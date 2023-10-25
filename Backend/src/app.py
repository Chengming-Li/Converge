import os
from flask import Flask
import psycopg2
from dotenv import load_dotenv
from actions import createUser, getUser, getTable, deleteTable

app = Flask(__name__)

# exposes endpoints
@app.get('/api')
def defaultApiCall():
    return "Hello World"

@app.post('/api/user')
def create_user_profile():
    return createUser()

@app.get('/api/user/<int:user_id>')
def get_user_profile(user_id):
    return getUser(user_id)
   
@app.get('/api/table/<string:tableName>')
def fetch_table(tableName):
    return getTable(tableName)

# THIS IS ONLY FOR DEVELOPMENT, REMOVE WHEN DEPLOYING
@app.get('/api/delete/table/<string:tableName>')
def delete_table(tableName):
    return deleteTable(tableName)


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)