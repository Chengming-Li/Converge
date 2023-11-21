from flask import Flask
from flask_cors import CORS
from actions import createUser, getUser, getTable, deleteTable, deleteUser, startInterval, endInterval, editInterval, deleteInterval, editSettings

app = Flask(__name__)

# remove when deploying
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# exposes endpoints
@app.get('/api')
def defaultApiCall():
    return {"text": "Hello, world!"}

@app.post('/api/user')
def create_user_profile():
    return createUser()

@app.get('/api/user/<int:user_id>')
def get_user_profile(user_id):
    return getUser(user_id)
   
@app.get('/api/table/<string:tableName>')
def fetch_table(tableName):
    return getTable(tableName)

@app.delete('/api/user/<int:user_id>')
def delete_user_profile(user_id):
    return deleteUser(user_id)

@app.post('/api/interval')
def start_interval():
    return startInterval()

@app.put('/api/interval/end/<int:interval_id>')
def end_interval(interval_id):
    return endInterval(interval_id)

@app.put('/api/interval/<int:interval_id>')
def edit_interval(interval_id):
    return editInterval(interval_id)

@app.delete('/api/interval/<int:interval_id>')
def delete_interval(interval_id):
    return deleteInterval(interval_id)

@app.put('/api/user/settings/<int:user_id>')
def edit_user_settings(user_id):
    return editSettings(user_id)

# THIS IS ONLY FOR DEVELOPMENT, REMOVE WHEN DEPLOYING
@app.delete('/api/delete/table/<string:tableName>')
def delete_table(tableName):
    return deleteTable(tableName)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)