from flask import Flask, request, abort, redirect, url_for, session
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import os
from dotenv import load_dotenv
import psycopg2
from authlib.integrations.flask_client import OAuth

import sys
sys.path.append('/backend/src/actions')
from userActions import clearTable, createUser, getUser, getUsersInfo, getTable, deleteTable, deleteUser, editSettings, getUserSettings
from intervalActions import createIntervalTable, startInterval, endInterval, editInterval, deleteInterval, getIntervalsInfo
from projectActions import createProject, deleteProject, editProject, getProjects
from roomActions import onConnect, onDisconnect, onJoin, onLeave, startRoomInterval, stopRoomInterval, editActiveInterval, hostRoom, changeProject

CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'

def create_app(test_config=None):
    load_dotenv()
    app = Flask(__name__)

    if test_config is None:
        app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
        app.config['DATABASE'] = os.getenv("DATABASE_URL")

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

    @app.route('/')
    def index():
        html_code = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Default Page</title>
        </head>
        <body>
            <h1>Hello, Flask!</h1>
            <p>This is an example of returning HTML code directly from a Flask route.</p>
            <p>
                <a class="btn btn-primary" href="authorize/google">Login with Google</a>
            </p>
        </body>
        </html>
        """
        return html_code

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

    @app.route('/authorize/<provider>')
    def oauth2_authorize(provider):
        # checks if logged in
        if 'logged_in' in session and session['logged_in']:
            return redirect(url_for('index'))

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
    
    @app.route('/google/auth/')
    def google_auth():
        try:
            token = dict(oauth.google.authorize_access_token())
            user = token["userinfo"]["email"]
            print(" Google User ", user)
            session['logged_in'] = True
        except Exception as e:
            session['logged_in'] = True
            print(e)
            return redirect('/api')
        return redirect('/')
    #endregion
    return app, socketio

if __name__ == '__main__':
    app, socketio = create_app(None)
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)