from flask import Flask, request, abort, redirect, url_for, session, make_response
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import os
from dotenv import load_dotenv
import psycopg2
from authlib.integrations.flask_client import OAuth
import jwt
import datetime

import sys
sys.path.append('/backend/src/actions')
from userActions import userExists, login_create, clearTable, createUser, getUser, getUsersInfo, getTable, deleteTable, deleteUser, editSettings, getUserSettings
from intervalActions import createIntervalTable, startInterval, endInterval, editInterval, deleteInterval, getIntervalsInfo
from projectActions import createProject, deleteProject, editProject, getProjects
from roomActions import onConnect, onDisconnect, onJoin, onLeave, startRoomInterval, stopRoomInterval, editActiveInterval, hostRoom, changeProject

import requests
import base64

CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'

def create_app(test_config=None):
    load_dotenv()
    app = Flask(__name__)

    if test_config is None:
        app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
        app.config['DATABASE'] = os.getenv("DATABASE_URL")
        
        app.config['FRONTEND_URL'] = os.getenv("FRONTEND_URL")

        app.config['OAUTH2_PROVIDERS'] = {
            'google': {
                'client_id': os.getenv("GOOGLE_AUTH_CLIENT_ID"),
                'client_secret': os.getenv("GOOGLE_AUTH_SECRET"),
                'authorize_url': 'https://accounts.google.com/o/oauth2/auth',
                'token_url': 'https://accounts.google.com/o/oauth2/token',
                'userinfo': {
                    'url': 'https://www.googleapis.com/oauth2/v3/userinfo',
                    'email': lambda json: json['email'],  # function that returns email from data returned by endpoint
                },
                'scopes': ['https://www.googleapis.com/auth/userinfo.email'],
            }
        }
    else:
        app.config.from_mapping(test_config)

    def establishConnection():
        return psycopg2.connect(app.config['DATABASE'])

    # remove when deploying
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    CORS(app, resources={r"/test/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    CORS(app, resources={r"/authenticate/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    @app.route('/')
    def index():
        return redirect(app.config['FRONTEND_URL'])

    #region interval API
    @app.get('/api')
    def defaultApiCall():
        return {"text": "Hello, world!"}

    @app.post('/api/user')
    def create_user_profile():
        return createUser(establishConnection)

    @app.get('/api/user/<int:user_id>')
    def get_user_profile(user_id):
        return getUser(user_id, establishConnection)
    
    @app.get('/api/users/<string:user_ids>')
    def get_users_profile(user_ids):
        return getUsersInfo(user_ids, establishConnection)
    
    @app.post('/api/intervals')
    def create_intervals_table():
        return createIntervalTable(establishConnection)

    @app.get('/api/intervals/<string:interval_ids>')
    def get_intervals(interval_ids):
        return getIntervalsInfo(interval_ids, establishConnection)
    
    @app.get('/api/table/<string:tableName>')
    def fetch_table(tableName):
        return getTable(tableName, establishConnection)

    @app.delete('/api/user/<int:user_id>')
    def delete_user_profile(user_id):
        return deleteUser(user_id, establishConnection)

    @app.post('/api/interval')
    def start_interval():
        return startInterval(establishConnection)

    @app.put('/api/interval/end/<int:interval_id>')
    def end_interval(interval_id):
        return endInterval(interval_id, establishConnection)

    @app.put('/api/interval/<int:interval_id>')
    def edit_interval(interval_id):
        return editInterval(interval_id, establishConnection)

    @app.delete('/api/interval/<int:interval_id>')
    def delete_interval(interval_id):
        return deleteInterval(interval_id, establishConnection)

    @app.put('/api/user/settings/<int:user_id>')
    def edit_user_settings(user_id):
        return editSettings(user_id, establishConnection)
    
    @app.get('/api/user/settings/<int:user_id>')
    def get_user_settings(user_id):
        return getUserSettings(user_id, establishConnection)

    @app.post('/api/project')
    def create_project():
        return createProject(establishConnection)
    
    @app.put('/api/project/<int:project_id>')
    def edit_project(project_id):
        return editProject(project_id, establishConnection)
    
    @app.delete('/api/project/<int:project_id>')
    def delete_project(project_id):
        return deleteProject(project_id, establishConnection)
    
    @app.get('/api/project/user/<int:user_id>')
    def get_projects(user_id):
        return getProjects(user_id, establishConnection)

    # THIS IS ONLY FOR DEVELOPMENT
    @app.delete('/api/delete/table/<string:tableName>')
    def delete_table(tableName):
        return deleteTable(tableName, establishConnection, os.getenv("DEV_PASSWORD"))
    @app.delete('/api/clear/table/<string:tableName>')
    def clear_table(tableName):
        return clearTable(tableName, establishConnection, os.getenv("DEV_PASSWORD"))
    #endregion

    #region rooms API
    socketio = SocketIO(app, cors_allowed_origins="*")

    @socketio.on('connect')
    def handle_connect():
        client = request.sid
        onConnect(client)

    @socketio.on('disconnect')
    def handle_disconnect():
        client = request.sid
        onDisconnect(client, establishConnection, emit)

    @socketio.on('join')
    def handle_join(data):
        client = request.sid
        onJoin(client, data, join_room, emit)

    @socketio.on('leave')
    def handle_leave():
        client = request.sid
        onLeave(client, leave_room, establishConnection, emit)
    
    @socketio.on('start_interval')
    def handle_start_interval(data):
        client = request.sid
        startRoomInterval(client, data, establishConnection, emit)
        
    @socketio.on('stop_interval')
    def handle_stop_interval():
        client = request.sid
        stopRoomInterval(client, establishConnection, emit)

    @socketio.on('edit_interval')
    def handle_active_interval(data):
        client = request.sid
        editActiveInterval(client, data, establishConnection, emit)
        
    @socketio.on('host')
    def handle_host_room(data):
        client = request.sid
        hostRoom(client, data, join_room, emit)
        
    @socketio.on('change_project')
    def handle_change_project(data):
        changeProject(data, establishConnection)
    #endregion
        
    #region Oauth
    oauth = OAuth(app)

    def generateToken(user_id):
        """
        Generates an authenication token that expires in 30 days

        @param {string} user_id: the ID of the user

        @returns {string}: the token
        """
        expiration_time = datetime.datetime.now() + datetime.timedelta(days=30)
        payload = {'exp': expiration_time, 'userId': user_id}
        token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
        return token
    
    def tokenValidator(token):
        """
        Checks if the authenication token is valid

        @param {string} token: the token

        @returns {boolean}: validity of token
        @returns {string}: user id
        """
        try:
            decoded_payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            expiration_time = datetime.datetime.fromtimestamp(decoded_payload['exp'])
            return expiration_time > datetime.datetime.now() and userExists(decoded_payload.get('userId'), establishConnection), decoded_payload.get('userId')
        except jwt.ExpiredSignatureError:
            return False, None
        except jwt.InvalidTokenError:
            return False, None

    @app.route('/authorize/<provider>')
    def oauth2_authorize(provider):
        if request.cookies.get('token') and tokenValidator(request.cookies.get('token'))[0]:
            return redirect(app.config['FRONTEND_URL'])

        provider_data = app.config['OAUTH2_PROVIDERS'].get(provider)
        if provider_data is None:
            abort(404)

        oauth.register(
            name=provider,
            client_id=provider_data["client_id"],
            client_secret=provider_data["client_secret"],
            server_metadata_url=CONF_URL,
            client_kwargs={
                'scope': 'openid email profile'
            }
        )
        redirect_uri = url_for(provider + '_auth', _external=True)
        return oauth.google.authorize_redirect(redirect_uri)
    
    @app.route('/google/auth')
    def google_auth():
        resp = make_response(redirect(app.config['FRONTEND_URL']))
        try:
            token = dict(oauth.google.authorize_access_token())
            user = token["userinfo"]["email"]
            try:
                # Get the image data from the URL
                response = requests.get(token["userinfo"]["picture"])
                response.raise_for_status()  # Raise an exception for 4xx and 5xx status codes

                # Encode the image data in base64
                
                imgString = f"data:image/jpeg;base64,{base64.b64encode(response.content).decode('utf-8')}"
            except Exception as e:
                print("Failed image: " + e)
                imgString = ""
            userID = login_create(
                token["userinfo"]["name"], 
                token["userinfo"]["email"], 
                "UTC",
                imgString,
                establishConnection
            )
            if type(userID) == Exception:
                resp.set_cookie('token', "")
                print("Failed: " + userID)
                return resp
            # query database, make new account if not found
            resp.set_cookie('token', generateToken(userID))
        except Exception as e:
            resp.set_cookie('token', "")
            print("Failed: " + e)
        return resp
    
    @app.route('/logout')
    def logout():
        resp = make_response(redirect(app.config['FRONTEND_URL']))
        resp.set_cookie('token', "")
        return resp
    
    @app.get('/authenticate')
    def authenticate():
        print(request.cookies.get('token'))
        if request.cookies.get('token') and tokenValidator(request.cookies.get('token'))[0]:
            return {"user_id": str(tokenValidator(request.cookies.get('token'))[1])}, 201
        return {"error": f"Failed to authenticate"}, 401
    #endregion
    return app, socketio

if __name__ == '__main__':
    app, socketio = create_app(None)
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)