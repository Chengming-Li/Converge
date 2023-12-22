# Run "docker exec -it focus-backend-1 pytest" in terminal to test

def test_join_leave_room(app):
    client1 = app[1]
    client2 = app[2]
    client1.emit('join', {"room": "Test", 'ID': "11002331"})
    response1 = client1.get_received()
    response2 = client2.get_received()
    assert len(response1) == 1, "Invalid number of messages received"
    assert len(response2) == 0, "Invalid number of messages received"
    client2.emit('join', {"room": "Test", 'ID': "11002330"})
    response1 = client1.get_received()
    response2 = client2.get_received()
    assert len(response1) == len(response2) == 1, "Invalid number of messages received"
    assert response1[0]['args'][0] == "11002330", "Client2 joining room failed to notify client1"
    client1.emit('leave')
    response2 = client2.get_received()
    assert len(response2) == 1, "Invalid number of messages received"
    assert response2[0]['name'] == 'leave room' and response2[0]['args'][0] == '11002331', "Client2 was not correctly notified of client1's departure"

def test_start_stop_interval(app):
    try:
        client1 = app[1]
        client2 = app[2]
        client1.emit('join', {"room": "Test", 'ID': "927795817798598657"})
        client2.emit('join', {"room": "Test", 'ID': "11002330"})
        response1 = client1.get_received()
        response2 = client2.get_received()
        client1.emit('start_interval', {"name": "Test Interval", "project_id": None})
        response1 = client1.get_received()
        response2 = client2.get_received()
        assert len(response1) == 0, "Interval failed to start"
        assert len(response2) == 1, "Invalid number of messages received"
        data = response2[0]['args'][0]
        intervalID = data["interval_id"]
        assert response2[0]["name"] == "start interval" and data["userID"] == "927795817798598657" and intervalID, "Client2 was not notified of client1's interval"
        client1.emit('stop_interval')
        response1 = client1.get_received()
        response2 = client2.get_received()
        assert len(response1) == 0, "Interval failed to stop"
        assert len(response2) == 1, "Invalid number of messages received"
        data = response2[0]['args'][0]
        assert response2[0]["name"] == "stop interval" and data["userID"] == "927795817798598657" and data["interval_id"] == intervalID and data["start_time"] and data["end_time"] and data["name"], "Client2 was not notified of client1's interval"
    finally:
        client = app[0].test_client()
        assert client.delete("/api/interval/" + data["interval_id"]).status_code == 200