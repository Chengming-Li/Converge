# Run "docker exec -it focus-backend-1 pytest" in terminal to test
from datetime import datetime
def isValidTime(date_string, maxDifference):
    """
    Check if the time elapsed exceeds the max alloted time
    """
    try:
        parsed_date = datetime.strptime(date_string, '%A %d %B %Y %H:%M:%S %Z')
        current_time = datetime.now()
        time_diff = current_time - parsed_date
        minutes = abs(time_diff.total_seconds() / 60)
        if minutes <= maxDifference:
            return True
        else:
            return False
    except ValueError:
        return False
def create_user(client, username, email, timezone, profile_picture):
    response = client.post("/api/user", json={
        "username" : username,
        "email" : email,
        "timezone" : timezone,
        "profile_picture" : profile_picture
    })
    responseJson = response.get_json()
    try:
        assert response.status_code == 201, f"Expected status code 201, but got {response.status_code}"
        assert responseJson.get("username", None) == username, f"invalid username returned, got {responseJson.get('username', 'Username Missing')}"
        assert responseJson.get("email", None) == email, f"invalid email returned, got {responseJson.get('email', 'Email Missing')}"
        assert responseJson.get("timezone", None) == timezone, f"invalid timezone returned, got {responseJson.get('timezone', 'Timezone Missing')}"
        assert responseJson.get("profile_picture", None) == profile_picture, f"invalid profile_picture returned, got {responseJson.get('profile_picture', 'Profile_picture Missing')}"
    finally:
        return responseJson
def start_interval(client, name, user_id, project_id):
    response = client.post("/api/interval", json={
        "name" : name,
        "user_id": user_id,
        "project_id": project_id
    })
    responseJson = response.get_json()
    try:
        assert response.status_code == 201, f"Expected status code 201, but got {response.status_code}"
        assert responseJson.get("start_time", False) and isValidTime(responseJson["start_time"], 5), "invalid or incorrect start_time in response JSON"
    finally:
        return responseJson

def test_host_room(app):
    client = app[1]
    client.emit('host', {'ID': "11002331"})
    response = client.get_received()
    assert len(response) == 1, "Invalid number of messages received"
    data = response[0]
    assert data["name"] == "join" and data["args"][0], "invalid host data"

def test_join_leave_room(app):
    client1 = app[1]
    client2 = app[2]
    client1.emit('host', {'ID': "11002331"})
    response1 = client1.get_received()
    response2 = client2.get_received()
    assert len(response1) == 1, "Invalid number of messages received"
    assert len(response2) == 0, "Invalid number of messages received"
    code = response1[0]['args'][0]
    client2.emit('join', {"room": code, 'ID': "11002330"})
    response1 = client1.get_received()
    response2 = client2.get_received()
    assert len(response1) == 1 and len(response2) == 2, "Invalid number of messages received"
    assert response1[0]['args'][0]["user_id"] == "11002330", "Client2 joining room failed to notify client1"
    client1.emit('leave')
    response2 = client2.get_received()
    assert len(response2) == 1, "Invalid number of messages received"
    assert response2[0]['name'] == 'leave' and response2[0]['args'][0] == '11002331', "Client2 was not correctly notified of client1's departure"

def test_start_stop_interval(app):
    try:
        client1 = app[1]
        client2 = app[2]
        client = app[0].test_client()
        userID = create_user(client, "Test", "test@gmail.com", "America/Los_Angeles", None).get("id", None)
        assert userID != None, "Failed to create new User"
        client1.emit('host', {'ID': userID})
        code = client1.get_received()[0]['args'][0]
        client2.emit('join', {"room": code, 'ID': "11002330"})
        response1 = client1.get_received()
        response2 = client2.get_received()
        client1.emit('start_interval', {"name": "Test Interval", "project_id": None})
        response1 = client1.get_received()
        response2 = client2.get_received()
        assert len(response1) == 0, "Interval failed to start"
        assert len(response2) == 1, "Invalid number of messages received"
        data = response2[0]['args'][0]
        intervalID = data["interval_id"]
        assert response2[0]["name"] == "start" and data["user_id"] == userID and intervalID, "Client2 was not notified of client1's interval"
        client1.emit('stop_interval')
        response1 = client1.get_received()
        response2 = client2.get_received()
        assert len(response1) == 1 and response1[0]["name"] == "stop feedback", "Interval failed to stop"
        assert len(response2) == 1, "Invalid number of messages received"
        data = response2[0]['args'][0]
        assert response2[0]["name"] == "stop" and data["user_id"] == userID and data["interval_id"] == intervalID and data["start_time"] and data["end_time"] and data["name"], "Client2 was not notified of client1's interval"
    finally:
        assert client.delete("/api/user/" + userID).status_code == 200
        assert client.delete("/api/interval/" + data["interval_id"]).status_code == 200

def test_fetching_multiple_user_data(app):
    try:
        ids = []
        client = app[0].test_client()
        ids.append(create_user(client, "Test1", "test1@gmail.com", "America/Los_Angeles", None).get("id"))
        ids.append(create_user(client, "Test2", "test2@gmail.com", "America/Los_Angeles", None).get("id"))
        ids.append(create_user(client, "Test3", "test3@gmail.com", "America/Los_Angeles", None).get("id"))
        idString = ", ".join(ids)
        response = client.get(f"/api/users/{idString}")
        assert len(response.get_json()["users"]) == 3, "Invalid response"
    finally:
        # clean up
        for i in ids:
            assert client.delete("/api/user/" + i).status_code == 200

def test_fetching_multiple_interval_data(app):
    try:
        ids = []
        client = app[0].test_client()
        userID = create_user(client, "Test1", "test1@gmail.com", "America/Los_Angeles", None).get("id")
        ids.append(start_interval(client, "Tester", userID, None).get("id"))
        ids.append(start_interval(client, "Tester", userID, None).get("id"))
        ids.append(start_interval(client, "Tester", userID, None).get("id"))
        ids.append(start_interval(client, "Tester", userID, None).get("id"))
        idString = ", ".join(ids)
        response = client.get(f"/api/intervals/{idString}")
        assert len(response.get_json()) == 4, "Invalid response"
    finally:
        # clean up
        assert client.delete("/api/user/" + userID).status_code == 200
        for i in ids:
            assert client.delete("/api/interval/" + i).status_code == 200

def test_edit_interval(app):
    try:
        client1 = app[1]
        client2 = app[2]
        client = app[0].test_client()
        userID = create_user(client, "Test", "test@gmail.com", "America/Los_Angeles", None).get("id", None)
        assert userID != None, "Failed to create new User"
        client1.emit('host', {'ID': userID})
        code = client1.get_received()[0]['args'][0]
        client2.emit('join', {"room": code, 'ID': "11002330"})
        client1.emit('start_interval', {"name": "Test Interval", "project_id": None})
        response1 = client1.get_received()
        response2 = client2.get_received()
        client1.emit('edit_interval', {"name": "Test Interval2", "project_id": None})
        response1 = client1.get_received()
        response2 = client2.get_received()
        assert len(response1) == 0, "Failed to edit interval"
        assert len(response2) == 1, "Invalid number of messages received"
        data = response2[0]['args'][0]
        assert response2[0]["name"] == "edit" and data["user_id"] == userID and data["interval_name"] == "Test Interval2", "Client2 was not notified of client1's interval"
    finally:
        assert client.delete("/api/user/" + userID).status_code == 200
        assert client.delete("/api/interval/" + data["interval_id"]).status_code == 200