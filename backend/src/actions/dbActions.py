from flask import request, jsonify
import datetime

# region SQL commands
# when adding new settings, edit to CREATE_USERS_TABLE, INSERT_USER, EDIT_SETTINGS, editSettings(), and getUser()
CREATE_USERS_TABLE = "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT, email TEXT, timezone TEXT, profile_picture TEXT);"
INSERT_USER = "INSERT INTO users (username, email, timezone, profile_picture) VALUES (%s, %s, %s, %s) RETURNING id;"
FETCH_USER_INFO = "SELECT username, email, timezone, profile_picture FROM users WHERE id = (%s);"
FETCH_MULTIPLE_USER_INFO = "SELECT id, username, profile_picture FROM users WHERE id IN %s;"
DELETE_USER = "DELETE FROM users WHERE id = (%s);"
CREATE_INTERVALS_TABLE = "CREATE TABLE IF NOT EXISTS intervals (interval_id SERIAL PRIMARY KEY, user_id INT, project_id INT, name TEXT, start_time timestamptz, end_time timestamptz, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);" # FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
START_INTERVAL = "INSERT INTO intervals (user_id, project_id, name, start_time) VALUES (%s, %s, %s, %s) RETURNING *;"
END_INTERVAL = "UPDATE intervals SET end_time = (%s) WHERE interval_id = (%s) RETURNING *;"
EDIT_INTERVAL = "UPDATE intervals SET name = (%s), project_id = (%s), start_time = (%s), end_time = (%s) WHERE interval_id = (%s);"
GET_ALL_INACTIVE_INTERVALS_BY_USER = "SELECT * FROM intervals WHERE user_id = %s AND end_time IS NOT NULL ORDER BY start_time DESC;"
GET_ALL_ACTIVE_INTERVALS_BY_USER = "SELECT * FROM intervals WHERE user_id = %s AND end_time IS NULL ORDER BY start_time;"
DELETE_INTERVAL = "DELETE FROM intervals WHERE interval_id = (%s);"
EDIT_SETTINGS = "UPDATE users SET username = %s, profile_picture = (%s), timezone = (%s) WHERE id = (%s) RETURNING id;"
# endregion

# API Functions
# region general functions, for testing
def getTable(tableName, establishConnection):
    """
    Fetches entire table from database based on the name of the table
    """
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(f"SELECT * FROM {tableName};",)
                table = cursor.fetchall()
                result = [dict(zip([column[0] for column in cursor.description], row)) for row in table]
    except Exception as e:
        return {"error": f"Failed to get table: {str(e)}"}, 500
    return jsonify(result)

def deleteTable(tableName, establishConnection, password):
    """
    Deletes entire table from database based on the name of the table
    """
    connection = establishConnection()
    data = request.get_json()
    if data["confimration"] != password:
        return {"error": "Access Denied"}, 403
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(f"DROP TABLE {tableName};",)
                result = [{"name": tableName}]
    except Exception as e:
        return {"error": f"Failed to delete Table: {str(e)}"}, 500
    return jsonify(result)

def clearTable(tableName, establishConnection, password):
    """
    Deletes all rows in table based on the name of the table
    """
    connection = establishConnection()
    data = request.get_json()
    if data["confimration"] != password:
        return {"error": "Access Denied"}, 403
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(f"DELETE FROM {tableName};",)
                result = [{"name": tableName}]
    except Exception as e:
        return {"error": f"Failed to clear Table: {str(e)}"}, 500
    return jsonify(result)
# endregion

# region user functions
def getUser(userId, establishConnection):
    """
    Fetch user information from database

    @param {int} userId: the ID of the user

    @returns {json}: a dictionary with these keys:
        "userInfo" points to a dict with keys "email", "id", "timezone", "profile_picture", and "username"
        "intervals" points to a list of dictionaries, each with the keys "end_time", "start_time", "interval_id", "name", "project_id", and "user_id"
        "activeInterval" points to the current interval that hasn't been ended, with the keys "end_time", "start_time", "interval_id", "name", "project_id", and "user_id", or null if none exists
    """
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(FETCH_USER_INFO, (userId,))
                data = cursor.fetchone()
                print(data)
                user = {"id": str(userId), "username" : data[0], "email" : data[1], "timezone" : data[2], "profile_picture" : data[3]}
                
                cursor.execute(GET_ALL_INACTIVE_INTERVALS_BY_USER, (userId,))
                data = cursor.fetchall()
                inactive = [dict(zip([column[0] for column in cursor.description], row)) for row in data] if data else []
                for item in inactive:
                    item['interval_id'] = str(item['interval_id'])
                    item['user_id'] = str(item['user_id'])
                    item['project_id'] = str(item['project_id']) if item['project_id'] else None
                    startTime = item['start_time']
                    item['start_time'] = startTime.strftime('%A %d %B %Y %H:%M:%S %Z') if startTime else None
                    endTime = item['end_time']
                    item['end_time'] = endTime.strftime('%A %d %B %Y %H:%M:%S %Z') if endTime else None

                cursor.execute(GET_ALL_ACTIVE_INTERVALS_BY_USER, (userId,))
                data = cursor.fetchone()
                active = dict(zip([column[0] for column in cursor.description], data)) if data else None
                if active:
                    active['interval_id'] = str(active['interval_id'])
                    active['user_id'] = str(active['user_id'])
                    active['project_id'] = str(active['project_id']) if active['project_id'] else None
                    active['start_time'] = active['start_time'].strftime('%A %d %B %Y %H:%M:%S %Z')
    except Exception as e:
        return {"error": f"Failed to get user: {str(e)}"}, 500
    return jsonify({"userInfo" : user, "intervals" : inactive, "activeInterval" : active})

def getUsersInfo(establishConnection):
    """
    Fetch information for multiple users from database

    Json Body:
        "ids" : (list of str) ids of user

    @returns {json}: a list of objects with the following attributes:
        "id": (str) id of user
        "username": (str) username of user 
        "profile_picture": (str) encoded profile picture
    """
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                ids = request.json.get('ids', [])
                cursor.execute(FETCH_MULTIPLE_USER_INFO, (tuple(ids),))
                results = cursor.fetchall()
                user_objects = [{'id': row[0], 'username': row[1], "profile_picture": row[2]} for row in results]
    except Exception as e:
        return {"error": f"Failed to get users"}, 500
    return jsonify({'users': user_objects})

def createUser(establishConnection):
    """
    Create a new user in table users and return their ID
    Json Body:
        "username" : (str) name of user
        "email" : (str) email of user
        "timezone" : (str) timezone of user

    @returns {json}: a dictionary containing the key "id", with user's ID
    """
    connection = establishConnection()
    data = request.get_json()
    username = data["username"]
    email = data["email"]
    timezone = data["timezone"]
    pfp = data["profile_picture"]
    print(pfp)
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(CREATE_USERS_TABLE)
                connection.commit()
                cursor.execute(INSERT_USER, (username, email, timezone, pfp))
                userId = cursor.fetchone()[0]
    except Exception as e:
        return {"error": f"Failed to create user: {str(e)}"}, 500
    return jsonify({"id": str(userId)}), 201

def deleteUser(userId, establishConnection):
    """
    Delete user from database

    @param {int} userId: the ID of the user

    @returns {json}: a dictionary containing the key "id" with the deleted user's ID
    """
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(DELETE_USER, (userId,))
                result = [{"id": str(userId)}]
    except Exception as e:
        return {"error": f"Failed to delete user: {str(e)}"}, 500
    return jsonify(result)

def editSettings(userId, establishConnection):
    """
    Changes the settings associated with an account
    Json Body:
        "timezone" : (str) timezone of user
        "username" : (str) username of user
        
    @returns {json}: a dictionary containing the key "id"
    """
    connection = establishConnection()
    data = request.get_json()
    timezone = data["timezone"]
    username = data["username"]
    pfp = data["profile_picture"]
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(EDIT_SETTINGS, (username, pfp, timezone, userId,))
                userId = cursor.fetchone()[0]
    except Exception as e:
        return {"error": f"Failed to edit settings: {str(e)}"}, 500
    return jsonify({"id": str(userId)}), 201
# endregion

# region interval functions
def startInterval(establishConnection):
    """
    Create a new interval and return its ID
    Json Body:
        "name" : (str) name of the interval
        "user_id" : (str) ID of the user creating the interval
        "project_id" : (str) ID of the user creating the interval

    @returns {json}: a dictionary containing the key "id" and a string "start_time"
    """
    connection = establishConnection()
    data = request.get_json()
    name = data["name"]
    userID = int(data["user_id"])
    projectID = int(data["project_id"]) if data["project_id"] else None
    startTime = datetime.datetime.now(datetime.UTC)
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(CREATE_INTERVALS_TABLE)
                connection.commit()
                cursor.execute(START_INTERVAL, (userID, projectID, name, startTime,))
                data = cursor.fetchone()
    except Exception as e:
        return {"error": f"Failed to start the interval: {str(e)}"}, 500
    return jsonify({"id": str(data[0]), "start_time": data[4].strftime('%A %d %B %Y %H:%M:%S %Z')}), 201

def endInterval(intervalId, establishConnection):
    """
    Ends interval with ID
    
    @param {int} intervalId: the ID of the interval

    @returns {json}: a dictionary containing the keys "name", "project_id", "interval_id", "user_id", "start_time", and "end_time"
    """
    connection = establishConnection()
    endTime = datetime.datetime.now(datetime.UTC)
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(END_INTERVAL, (endTime, intervalId,))
                data = cursor.fetchone() or [""] * 6
    except Exception as e:
        return {"error": f"Failed to end interval: {str(e)}"}, 500
    return jsonify({"interval_id": str(intervalId), 
                    "end_time" : data[5].strftime('%A %d %B %Y %H:%M:%S %Z'), 
                    "user_id" : str(data[1]), 
                    "project_id" : str(data[2]) if data[2] else None, 
                    "name" : data[3], 
                    "start_time" : data[4].strftime('%A %d %B %Y %H:%M:%S %Z')
                }), 201

def editInterval(intervalId, establishConnection):
    """
    Edits interval with ID
    Json Body:
        "name" : (str)
        "project_id" : (str)
        "start_time" : (str) String representing a timestamp in %A %d %B %Y %H:%M:%S %Z fomat
        "end_time" : (str) String representing a timestamp in %A %d %B %Y %H:%M:%S %Z fomat
                    Example: Sunday 06 November 2023 00:00:00 UTC
    
    @param {int} intervalId: the ID of the interval

    @returns {json}: a dictionary containing the key "id"
    """
    connection = establishConnection()
    data = request.get_json()
    name = data["name"]
    projectID = int(data["project_id"]) if data["project_id"] else None
    startTime = datetime.datetime.strptime(data["start_time"], "%A %d %B %Y %H:%M:%S %Z")
    endTime = datetime.datetime.strptime(data["end_time"], "%A %d %B %Y %H:%M:%S %Z") if data["end_time"] else None
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(EDIT_INTERVAL, (name, projectID, startTime, endTime, intervalId,))
    except Exception as e:
        return {"error": f"Failed to edit interval: {str(e)}"}, 500
    return jsonify({"id": str(intervalId)}), 201

def deleteInterval(intervalId, establishConnection):
    """
    Delete interval from database

    @param {int} intervalId: the ID of the interval

    @returns {json}: a dictionary containing the key "id"
    """
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(DELETE_INTERVAL, (intervalId,))
                result = [{"id": str(intervalId)}]
    except Exception as e:
        return {"error": f"Failed to delete interval: {str(e)}"}, 500
    return jsonify(result)
# endregion