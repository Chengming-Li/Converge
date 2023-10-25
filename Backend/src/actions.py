import os
import psycopg2
from dotenv import load_dotenv
from flask import request, jsonify

# SQL commands
CREATE_USERS_TABLE = "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT, email TEXT);"
INSERT_USER_RETURN_ID = "INSERT INTO users (username, email) VALUES (%s, %s) RETURNING id"
FETCH_USER_INFO = "SELECT username, email FROM users WHERE id = (%s)"

# loads environment variables from .env and gets the database URL
load_dotenv()
url = os.getenv("DATABASE_URL")
def establishConnection():
    return psycopg2.connect(url)

# API Functions
def createUser():
    """
    Create a new user in table Users and return their ID

    @returns {json}: a dictionary containing the key "id", with user's ID
    """
    connection = establishConnection()
    data = request.get_json()
    username = data["username"]
    email = data["email"]
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(CREATE_USERS_TABLE)
                cursor.execute(INSERT_USER_RETURN_ID, (username, email,))
                userId = cursor.fetchone()[0]
    except Exception as e:
        return {"error": f"Failed to create the user: {str(e)}"}, 500
    return jsonify({"id": userId}), 201

def getUser(userId):
    """
    Fetch user information from database

    @param {int} userId: the ID of the user

    @returns {json}: a dictionary with the keys "id", "username", and "email" with the user's ID, username, and email, respectively
    """
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(FETCH_USER_INFO, (userId,))
                data = cursor.fetchone()
                user = {"id": userId, "username" : data[0], "email" : data[1]}
    except Exception as e:
        return {"error": str(e)}, 500
    return jsonify(user)

def getTable(tableName):
    """
    Fetches entire table from database

    @param {int} tableName: the name of the table

    @returns {json}: a list of dictionaries corresponding to the rows, each dictionary's keys corresponds to the columns
    """
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

def deleteTable(tableName):
    """
    Deletes entire table from database

    @param {int} tableName: the name of the table

    @returns {json}: a dictionary containing key "name" with the name of the deleted table
    """
    connection = establishConnection()
    data = request.get_json()
    if data["confimration"] != "Confirm":
        return {"error": "Access Denied"}, 403
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(f"DROP TABLE {tableName}",)
                result = [{"name": tableName}]
    except Exception as e:
        return {"error": str(e)}, 500
    return jsonify(result)