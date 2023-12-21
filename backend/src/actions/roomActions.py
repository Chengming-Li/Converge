from flask import request, jsonify
from datetime import datetime
import pytz

clients = {}
rooms = {}

def onConnect(client_id):
    clients[client_id] = {"UserID":"", "Room":None, "timeJoined": None}

def onDisconnect(client_id, send):
    room = clients[client_id]["Room"]
    if room != None:
        rooms[room].discard(client_id)
    del clients[client_id]

def onJoin(client_id, data, join_room, send):
    userID = data['ID']
    room = data['room']
    clients[client_id]["UserID"] = userID
    clients[client_id]["Room"] = room
    clients[client_id]["timeJoined"] = datetime.now(pytz.utc)
    if room not in rooms:
        rooms[room] = set()
    rooms[room].add(client_id)
    join_room(room)

def onLeave(client_id, data, leave_room, send):
    userID = data['UserID']
    room = data['room']
    rooms[room].discard(client_id)
    if len(rooms[room]) == 0:
        del rooms[room]
    leave_room(room)