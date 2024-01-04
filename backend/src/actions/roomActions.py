from flask import jsonify
import datetime
import secrets

CREATE_INTERVALS_TABLE = "CREATE TABLE IF NOT EXISTS intervals (interval_id SERIAL PRIMARY KEY, user_id INT, project_id INT, name TEXT, start_time timestamptz, end_time timestamptz, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);" # FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
START_INTERVAL = "INSERT INTO intervals (user_id, project_id, name, start_time) VALUES (%s, %s, %s, %s) RETURNING *;"
END_INTERVAL = "UPDATE intervals SET end_time = (%s) WHERE interval_id = (%s) RETURNING *;"
EDIT_INTERVAL = "UPDATE intervals SET name = (%s), project_id = (%s) WHERE interval_id = (%s);"

# keys: client session ID
# values: dictionary with keys for UserID, Room, activeInterval, intervals, and timeJoined
clients = {}
# keys: room code
# value: set of user session Id's
roomUsers = {}

class User:
    def __init__(self):
        self.userID = ""
        self.room = None
        self.activeInterval = None
        self.intervals = []
        self.timeJoined = None
    
    def joinRoom(self, client_id, data, join_room, emit):
        self.userID = data['ID']
        room = data['room']
        emit("join", room, to=client_id)
        self.room = room
        self.timeJoined = datetime.datetime.now(datetime.UTC).strftime('%A %d %B %Y %H:%M:%S %Z')
        emit("join_data", {clients[x].userID: {"timeJoined": clients[x].timeJoined, "active_interval": clients[x].activeInterval, "intervals": clients[x].intervals} for x in roomUsers[room]}, to=client_id)
        roomUsers[room].add(client_id)
        join_room(room)
        emit("join_room", {"timeJoined": datetime.datetime.now(datetime.UTC).strftime('%A %d %B %Y %H:%M:%S %Z'), "user_id": data['ID']}, room=room, skip_sid=client_id)

    def leaveRoom(self, client_id, leave_room, establishConnection, emit):
        roomUsers[self.room].remove(client_id)
        if len(roomUsers[self.room]) == 0:
            del roomUsers[self.room]
        if self.activeInterval:
            connection = establishConnection()
            endTime = datetime.datetime.now(datetime.UTC)
            try:
                with connection:
                    with connection.cursor() as cursor:
                        cursor.execute(END_INTERVAL, (endTime, self.activeInterval.interval_id,))
                        self.activeInterval = None
            except Exception as e:
                pass
        leave_room(self.room)
        emit("leave", self.userID, room=self.room)
        self.room = None

    def startInterval(self, client_id, data, establishConnection, emit):
        userID = self.userID
        room = self.room
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
            emit("error", f"Failed to start interval: {str(e)}", to=client_id)
            return
        self.activeInterval = str(data[0])
        emit("start", {
            "project_id": projectID, 
            "interval_name": interval_name, 
            "user_id": userID, 
            "interval_id": self.activeInterval, 
            "start_time": data[4].strftime('%A %d %B %Y %H:%M:%S %Z')}, room=room, skip_sid=client_id)

    def stopInterval(self, client_id, establishConnection, emit):
        userID = self.userID
        room = self.room
        intervalID = self.activeInterval
        if intervalID:
            connection = establishConnection()
            endTime = datetime.datetime.now(datetime.UTC)
            try:
                with connection:
                    with connection.cursor() as cursor:
                        cursor.execute(END_INTERVAL, (endTime, self.activeInterval,))
                        data = cursor.fetchone() or [""] * 6
                self.activeInterval = None
                self.intervals.append(intervalID)
                emit("stop", {
                    "user_id": userID, 
                    "interval_id": intervalID, 
                    "start_time": data[4].strftime('%A %d %B %Y %H:%M:%S %Z'), 
                    "end_time" : data[5].strftime('%A %d %B %Y %H:%M:%S %Z'),
                    "project_id" : str(data[2]) if data[2] else None, 
                    "name" : data[3]
                    }, room=room, skip_sid=client_id)
                emit("stop feedback", {
                    "user_id": userID, 
                    "interval_id": intervalID, 
                    "start_time": data[4].strftime('%A %d %B %Y %H:%M:%S %Z'), 
                    "end_time" : data[5].strftime('%A %d %B %Y %H:%M:%S %Z'),
                    "project_id" : str(data[2]) if data[2] else None, 
                    "name" : data[3]
                    }, to=client_id)
            except Exception as e:
                emit("error", f"Failed to end interval: {str(e)}", to=client_id)
                return

    def editInterval(self, client_id, data, establishConnection, emit):
        userID = self.userID
        room = self.room
        connection = establishConnection()
        interval_id = self.activeInterval
        interval_name = data["name"]
        projectID = int(data["project_id"]) if data["project_id"] else None
        try:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(EDIT_INTERVAL, (interval_name, projectID, interval_id,))
        except Exception as e:
            emit("error", f"Failed to modify interval: {str(e)}", to=client_id)
            return
        emit("edit", {"user_id": userID, "interval_id": interval_id, "interval_name": interval_name, "projectID": projectID}, room=room, skip_sid=client_id)

    def __str__(self):
        return '{' + f"userID: {self.userID}, room: {self.room}, activeInterval: {self.activeInterval}, intervals: {self.intervals}, timeJoined: {self.timeJoined}" + '}'

def onConnect(client_id):
    clients[client_id] = User()

def onDisconnect(client_id, establishConnection, emit):
    if clients[client_id].activeInterval:
        connection = establishConnection()
        endTime = datetime.datetime.now(datetime.UTC)
        try:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(END_INTERVAL, (endTime, clients[client_id].activeInterval,))
        except Exception as e:
            pass
    room = clients[client_id].room
    if room != None:
        roomUsers[room].remove(client_id)
        if len(roomUsers[room]) == 0:
            del roomUsers[room]
        emit("leave", clients[client_id].userID, room=room)
    del clients[client_id]

def onJoin(client_id, data, join_room, emit):
    room = data["room"]
    if room not in roomUsers:
        emit("error", f"Room {room} does not exist", to=client_id)
    else:
        clients[client_id].joinRoom(client_id, data, join_room, emit)
    
def onLeave(client_id, leave_room, establishConnection, emit):
    clients[client_id].leaveRoom(client_id, leave_room, establishConnection, emit)

def startRoomInterval(client_id, data, establishConnection, emit):
    clients[client_id].startInterval(client_id, data, establishConnection, emit)

def stopRoomInterval(client_id, establishConnection, emit):
    clients[client_id].stopInterval(client_id, establishConnection, emit)

def editActiveInterval(client_id, data, establishConnection, emit):
    clients[client_id].editInterval(client_id, data, establishConnection, emit)
    
def hostRoom(client_id, data, join_room, emit):
    room = secrets.token_hex(3).upper()
    while room in roomUsers:
        room = str(secrets.token_hex(3).upper())
    userID = data['ID']
    clients[client_id].userID = userID
    clients[client_id].room = room
    clients[client_id].timeJoined = datetime.datetime.now(datetime.UTC).strftime('%A %d %B %Y %H:%M:%S %Z')
    roomUsers[room] = {client_id}
    join_room(room)
    emit("join", room, to=client_id)