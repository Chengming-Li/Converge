from flask import request, jsonify

CREATE_USERS_TABLE = "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT, email TEXT, timezone TEXT, profile_picture TEXT);"
INSERT_USER = "INSERT INTO users (username, email, timezone, profile_picture) VALUES (%s, %s, %s, %s) RETURNING id;"
FETCH_USER_INFO = "SELECT username, email, timezone, profile_picture FROM users WHERE id = (%s);"
FETCH_MULTIPLE_USER_INFO = "SELECT id, username, profile_picture FROM users WHERE id IN %s;"
DELETE_USER = "DELETE FROM users WHERE id = (%s);"
EDIT_SETTINGS = "UPDATE users SET username = %s, profile_picture = (%s), timezone = (%s) WHERE id = (%s) RETURNING id;"
GET_ALL_INTERVALS_BY_USER = "SELECT * FROM intervals WHERE user_id = %s ORDER BY start_time DESC;"
GET_ALL_PROJECTS_BY_USER = "SELECT * FROM projects WHERE user_id = %s ORDER BY name ASC;"

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
        "projects" points to a list of objects with the keys "project_id", "user_id", "name", and "color"
    """
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(FETCH_USER_INFO, (userId,))
                data = cursor.fetchone()
                user = {"id": str(userId), "username" : data[0], "email" : data[1], "timezone" : data[2], "profile_picture" : data[3]}
                
                cursor.execute(GET_ALL_INTERVALS_BY_USER, (userId,))
                data = cursor.fetchall()
                inactive = [dict(zip([column[0] for column in cursor.description], row)) for row in data] if data else []
                active = None
                i = 0
                while i < len(inactive):
                    item = inactive[i]
                    item['interval_id'] = str(item['interval_id'])
                    item['user_id'] = str(item['user_id'])
                    item['project_id'] = str(item['project_id']) if item['project_id'] else None
                    startTime = item['start_time']
                    item['start_time'] = startTime.strftime('%A %d %B %Y %H:%M:%S %Z') if startTime else None
                    endTime = item['end_time']
                    if not endTime:
                        active = inactive.pop(i)
                    else:
                        item['end_time'] = endTime.strftime('%A %d %B %Y %H:%M:%S %Z')
                        i += 1

                cursor.execute(GET_ALL_PROJECTS_BY_USER, (userId,))
                data = cursor.fetchall()
                projects = [{"project_id": str(project[0]), "user_id": str(project[1]), "name": project[2], "color": project[3]} for project in data]
    except Exception as e:
        return {"error": f"Failed to get user: {str(e)}"}, 500
    return jsonify({"userInfo" : user, "intervals" : inactive, "activeInterval" : active, "projects" : projects})

def getUserSettings(userId, establishConnection):
    """
    Fetch user's settings from database

    @param {int} userId: the ID of the user

    @returns {json}: a dictionary with these keys:
        "id": (str) user's id
        "username": (str) user's username
        "email": (str) user's email
        "timezone": (str) user's selected timezone
        "profile_picture": (str) image encoded into base64 format
    """
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(FETCH_USER_INFO, (userId,))
                data = cursor.fetchone()
                user = {"id": str(userId), "username" : data[0], "email" : data[1], "timezone" : data[2], "profile_picture" : data[3]}
    except Exception as e:
        return {"error": f"Failed to get user: {str(e)}"}, 500
    return jsonify(user)

def getUsersInfo(user_ids, establishConnection):
    """
    Fetch information for multiple users from database

    @returns {json}: a list of objects with the following attributes:
        "id": (str) id of user
        "username": (str) username of user 
        "profile_picture": (str) encoded profile picture
    """
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                ids = user_ids.split(", ")
                cursor.execute(FETCH_MULTIPLE_USER_INFO, (tuple(ids),))
                results = cursor.fetchall()
                user_objects = [{'id': str(row[0]), 'username': row[1], "profile_picture": row[2]} for row in results]
    except Exception as e:
        return {"error": f"Failed to get users, {str(e)}"}, 500
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
        "profile_picture" : (str) image encoded into base64 format
        
    @returns {json}: a dictionary containing the key "id", "timezone", "username", and "profile_picture"
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
    return jsonify({"id": str(userId), "timezone": timezone, "username": username, "profile_picture": pfp}), 200
# endregion