from flask import jsonify
import datetime

CREATE_INTERVALS_TABLE = "CREATE TABLE IF NOT EXISTS intervals (interval_id SERIAL PRIMARY KEY, user_id INT, project_id INT, name TEXT, start_time timestamptz, end_time timestamptz, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);" # FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
START_INTERVAL = "INSERT INTO intervals (user_id, project_id, name, start_time) VALUES (%s, %s, %s, %s) RETURNING *;"
END_INTERVAL = "UPDATE intervals SET end_time = (%s) WHERE interval_id = (%s) RETURNING *;"

# keys: client session ID
# values: dictionary with keys for UserID, Room, activeInterval, and timeJoined
clients = {}
# keys: room code
# value: dictionary with user session ID's as the key and a set of interval ID's as the value
roomUsers = {}

def onConnect(client_id):
    clients[client_id] = {"UserID":"", "room":None, "activeInterval": None, "timeJoined": None}

def onDisconnect(client_id, establishConnection, emit):
    if clients[client_id]["activeInterval"]:
        connection = establishConnection()
        endTime = datetime.datetime.now(datetime.UTC)
        try:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(END_INTERVAL, (endTime, clients[client_id]["activeInterval"],))
        except Exception as e:
            pass
    room = clients[client_id]["room"]
    if room != None:
        del roomUsers[room][client_id]
        if len(roomUsers[room]) == 0:
            del roomUsers[room]
        emit("leave room", clients[client_id]["UserID"], room=room)
    del clients[client_id]

def onJoin(client_id, data, join_room, emit):
    userID = data['ID']
    room = data['room']
    clients[client_id]["UserID"] = userID
    clients[client_id]["room"] = room
    clients[client_id]["timeJoined"] = datetime.datetime.now(datetime.UTC).strftime('%A %d %B %Y %H:%M:%S %Z')
    if room not in roomUsers:
        roomUsers[room] = {}
    roomUsers[room][client_id] = set()
    join_room(room)
    emit("join room", userID, room=room, skip_sid=client_id)
    emit("join data", {clients[x]["UserID"]: {"timeJoined": clients[x]["timeJoined"], "activeInterval": clients[x]["activeInterval"], "intervals": list(roomUsers[room][x])} for x in roomUsers[room]}, to=client_id)

def onLeave(client_id, leave_room, establishConnection, emit):
    room = clients[client_id]["room"]
    del roomUsers[room][client_id]
    if len(roomUsers[room]) == 0:
        del roomUsers[room]
    clients[client_id]["room"] = None
    if clients[client_id]["activeInterval"]:
        connection = establishConnection()
        endTime = datetime.datetime.now(datetime.UTC)
        try:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(END_INTERVAL, (endTime, clients[client_id]["activeInterval"],))
                    clients[client_id]["activeInterval"] = None
        except Exception as e:
            pass
    leave_room(room)
    emit("leave room", clients[client_id]["UserID"], room=room)

def startRoomInterval(client_id, data, establishConnection, emit):
    userID = clients[client_id]["UserID"]
    room = clients[client_id]["room"]
    connection = establishConnection()
    interval_name = data["name"]
    projectID = int(data["project_id"]) if data["project_id"] else None
    startTime = datetime.datetime.now(datetime.UTC)
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(CREATE_INTERVALS_TABLE)
                connection.commit()
                cursor.execute(START_INTERVAL, (int(userID), projectID, interval_name, startTime,))
                data = cursor.fetchone()
    except Exception as e:
        emit("error", "Failed to start interval", to=client_id)
        return
    clients[client_id]["activeInterval"] = str(data[0])
    emit("start interval", {"userID": userID, "interval_id": clients[client_id]["activeInterval"], "start_time": data[4].strftime('%A %d %B %Y %H:%M:%S %Z')}, room=room, skip_sid=client_id)

def stopRoomInterval(client_id, establishConnection, emit):
    userID = clients[client_id]["UserID"]
    room = clients[client_id]["room"]
    connection = establishConnection()
    intervalID = clients[client_id]["activeInterval"]
    if intervalID:
        connection = establishConnection()
        endTime = datetime.datetime.now(datetime.UTC)
        try:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(END_INTERVAL, (endTime, clients[client_id]["activeInterval"],))
                    data = cursor.fetchone() or [""] * 6
        except Exception as e:
            emit("error", "Failed to end interval", to=client_id)
            return
    clients[client_id]["activeInterval"] = None
    emit("stop interval", {
        "userID": userID, 
        "interval_id": intervalID, 
        "start_time": data[4].strftime('%A %d %B %Y %H:%M:%S %Z'), 
        "end_time" : data[5].strftime('%A %d %B %Y %H:%M:%S %Z'),
        "project_id" : str(data[2]) if data[2] else None, 
        "name" : data[3]
        }, room=room, skip_sid=client_id)
