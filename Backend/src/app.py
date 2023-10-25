import os
from flask import Flask, request, jsonify
import psycopg2
from dotenv import load_dotenv

# SQL commands
CREATE_USERS_TABLE = "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT, email TEXT);"
INSERT_USER_RETURN_ID = "INSERT INTO users (username, email) VALUES (%s, %s) RETURNING id"
FETCH_USER_INFO = "SELECT username, email FROM users WHERE id = (%s)"

app = Flask(__name__)

# loads environment variables from .env and gets the database URL
load_dotenv()
url = os.getenv("DATABASE_URL")
def establishConnection():
    return psycopg2.connect(url)

# exposes endpoints
@app.get('/api')
def defaultApiCall():
    return "Hello World"

@app.post('/api/user')
def create_user():
    connection = establishConnection()
    data = request.get_json()
    username = data["username"]
    email = data["email"]
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(CREATE_USERS_TABLE)
                cursor.execute(INSERT_USER_RETURN_ID, (username, email,))
                room_id = cursor.fetchone()[0]
    except Exception as e:
        return {"error": f"Failed to create the user: {str(e)}"}, 500
    return {"id": room_id, "message": f"user {username} created with email {email}."}, 201

@app.get('/api/user/<int:user_id>')
def get_user(user_id):
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(FETCH_USER_INFO, (user_id,))
                data = cursor.fetchone()
                user = {"username" : data[0], "email" : data[1]}
    except Exception as e:
        return {"error": str(e)}, 500
    return jsonify(user)
            
@app.get('/api/table/<string:tableName>')
def fetchTable(tableName):
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(f"SELECT * FROM {tableName}",)
                table = cursor.fetchall()
                result = [dict(zip([column[0] for column in cursor.description], row)) for row in table]
    except Exception as e:
        return {"error": str(e)}, 500
    return jsonify(result)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)