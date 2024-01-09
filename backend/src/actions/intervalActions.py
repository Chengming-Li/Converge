from flask import request, jsonify
import datetime

CREATE_INTERVALS_TABLE = "CREATE TABLE IF NOT EXISTS intervals (interval_id SERIAL PRIMARY KEY, user_id INT, project_id INT, name TEXT, start_time timestamptz, end_time timestamptz, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE);"
START_INTERVAL = "INSERT INTO intervals (user_id, project_id, name, start_time) VALUES (%s, %s, %s, %s) RETURNING *;"
END_INTERVAL = "UPDATE intervals SET end_time = (%s) WHERE interval_id = (%s) RETURNING *;"
EDIT_INTERVAL = "UPDATE intervals SET name = (%s), project_id = (%s), start_time = (%s), end_time = (%s) WHERE interval_id = (%s);"
FETCH_MULTIPLE_INTERVAL_INFO = "SELECT interval_id, user_id, project_id, name, start_time, end_time FROM intervals WHERE interval_id IN %s;"
DELETE_INTERVAL = "DELETE FROM intervals WHERE interval_id = (%s);"

# region interval functions
def createIntervalTable(establishConnection):
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(CREATE_INTERVALS_TABLE)
                connection.commit()
    except Exception as e:
        return {"error": f"Failed to create interval table: {str(e)}"}, 500
    return jsonify({"table": "intervals"}), 201

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
                }), 200

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
    return jsonify({"id": str(intervalId)}), 200

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

def getIntervalsInfo(interval_ids, establishConnection):
    """
    Fetch information for multiple intervals from database

    @returns {json}: a list of objects with the following attributes:
        "interval_id": (str) id of interval
        "name": (str) interval name
        "end_time": (str) String representing a timestamp in %A %d %B %Y %H:%M:%S %Z fomat
        "start_time": (str) String representing a timestamp in %A %d %B %Y %H:%M:%S %Z fomat
        "project_id": (str) id of project
        "user_id": (str) user id
    """
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                ids = interval_ids.split(", ")
                cursor.execute(FETCH_MULTIPLE_INTERVAL_INFO, (tuple(ids),))
                results = cursor.fetchall()
                interval_objects = [{"interval_id": str(row[0]), "user_id": str(row[1]), "project_id": row[2], "name": row[3], "start_time": row[4], "end_time": row[5]} for row in results]
    except Exception as e:
        return {"error": f"Failed to get intervals, {str(e)}"}, 500
    return jsonify({x["interval_id"]: x for x in interval_objects})
# endregion