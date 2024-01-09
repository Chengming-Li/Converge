from datetime import datetime
import base64
# Run "docker exec -it focus-backend-1 pytest" in terminal to test

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
def edit_user(client, user_id, username, timezone, profile_picture):
    response = client.put(f"/api/user/settings/{user_id}", json={
        "username" : username,
        "timezone" : timezone,
        "profile_picture": profile_picture
    })
    responseJson = response.get_json()
    try:
        assert response.status_code == 200, f"Expected status code 200, but got {response.status_code}"
        assert responseJson.get("id", None) == user_id, f"invalid id returned, got {responseJson.get('id', 'ID Missing')}"
    finally:
        return responseJson
def get_user(client, user_id):
    response = client.get(f"/api/user/{user_id}")
    responseJson = response.get_json()
    try:
        assert response.status_code == 200, f"Expected status code 200, but got {response.status_code}"
    finally:
        return responseJson
def create_project(client, name, user_id, color):
    response = client.post("/api/project", json={
        "name" : name,
        "user_id": user_id,
        "color" : color
    })
    responseJson = response.get_json()
    try:
        assert response.status_code == 201, f"Expected status code 201, but got {response.status_code}"
    finally:
        return responseJson
def edit_project(client, projectID, name, color):
    response = client.put(f"/api/project/{projectID}", json={
        "name" : name,
        "color" : color
    })
    responseJson = response.get_json()
    try:
        assert response.status_code == 200, f"Expected status code 200, but got {response.status_code}"
        assert responseJson.get("id", None) == projectID, f"invalid id returned, got {responseJson.get('id', 'ID Missing')}"
        assert responseJson.get("name", None) == name, f"invalid name returned, got {responseJson.get('name', 'Name Missing')}"
        assert responseJson.get("color", None) == color, f"invalid color returned, got {responseJson.get('color', 'Color Missing')}"
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
def end_interval(client, interval_id, name, user_id, project_id):
    response = client.put(f"/api/interval/end/{interval_id}")
    responseJson = response.get_json()
    try:
        assert response.status_code == 200, f"Expected status code 200, but got {response.status_code}"
        assert responseJson.get("start_time", False) and isValidTime(responseJson["start_time"], 5), "invalid or incorrect start_time in response JSON"
        assert responseJson.get("interval_id", False) == interval_id, "incorrect interval ID"
        assert responseJson.get("name", False) == name, "incorrect interval name"
        assert responseJson.get("project_id", False) == project_id, "incorrect project ID"
        assert responseJson.get("user_id", False) == user_id, "incorrect user ID"
        assert responseJson["end_time"] and isValidTime(responseJson["end_time"], 5), "invalid or incorrect end_time in response JSON"
        
    finally:
        return responseJson 
def edit_interval(client, interval_id, name, project_id, start_time, end_time):
    response = client.put(f"/api/interval/{interval_id}", json={
        "name" : name,
        "project_id": project_id,
        "start_time": start_time,
        "end_time": end_time
    })
    responseJson = response.get_json()
    try:
        assert response.status_code == 200, f"Expected status code 200, but got {response.status_code}"        
    finally:
        return responseJson

def test_api_home(app):
    client = app[0].test_client()
    response = client.get("/api")
    assert response.status_code == 200, f"Expected status code 200, but got {response.status_code}"
    assert response.get_json()["text"] == "Hello, world!", "'text' field should be 'Hello, World!'"

def test_create_user(app):
    try:
        client = app[0].test_client()
        responseJson = create_user(client, "Test", "test@gmail.com", "America/Los_Angeles", None)
        assert responseJson.get("id", False) is not "", f"invalid id returned, got {responseJson.get('id', 'id missing')}"
    finally:
        assert client.delete("/api/user/" + responseJson['id']).status_code == 200

def test_edit_user(app):
    try:
        client = app[0].test_client()
        userID = create_user(client, "Test", "test@gmail.com", "America/Los_Angeles", None)["id"]
        with open("./tests/pfp.png", "rb") as image2string: 
            encoded_image = base64.b64encode(image2string.read()).decode('utf-8') 
        responseJson = edit_user(client, userID, "Tester", "UTC", encoded_image)
        response = get_user(client, userID)
        responseJson = response.get("userInfo", False)
        assert responseJson.get("username", False) == "Tester", "incorrect username"
        assert responseJson.get("timezone", False) == "UTC", "incorrect timezone"
    finally:
        # clean up
        assert client.delete("/api/user/" + userID).status_code == 200

def test_project(app):
    try:
        client = app[0].test_client()
        userID = create_user(client, "Test", "test@gmail.com", "America/Los_Angeles", None)['id']
        projectID = create_project(client, "Test", userID, "Green").get("id", False)
        assert projectID, "invalid or missing id in response JSON"

        edit_project(client, projectID, "Test 1", "Green")
    finally:
        # clean up
        if projectID:
            assert client.delete("/api/project/" + projectID).status_code == 200
        assert client.delete("/api/user/" + userID).status_code == 200

def test_interval(app):
    try:
        client = app[0].test_client()
        userID = create_user(client, "Test", "test@gmail.com", "America/Los_Angeles", None)['id']
        responseJson = start_interval(client, "Test", userID, None)
        assert responseJson.get("id", False), "invalid or missing id in response JSON"
        
        intervalID = responseJson["id"]
        intervalResponse = client.put(f"/api/interval/end/{intervalID}")
        end_interval(client, intervalID, "Test", userID, None)
        
        projectID = create_project(client, "Test", userID, "Green")["id"]
        start_time = "Tuesday 21 November 2023 13:38:38 UTC"
        end_time = "Wednesday 06 November 2024 00:00:00 UTC"

        edit_interval(client, intervalID, "Test 1", projectID, start_time, end_time)
        
        responseJson = get_user(client, userID)
        assert len(responseJson.get("intervals", [])) == 1, "incorrect intervals"
        interval = responseJson["intervals"][0]
        assert interval["name"] == "Test 1", "incorrect name"
        assert interval["start_time"] == start_time and interval["end_time"] == end_time, "incorrect times"
        assert interval["project_id"] == projectID, "incorrect project ID"
        project = responseJson["projects"][0]
        assert len(responseJson["intervals"]) == 1 and project["project_id"] == projectID and project["user_id"] == userID and project["name"] == "Test", "Incorrect project retrieved"
    finally:
        # clean up
        assert client.delete("/api/user/" + userID).status_code == 200
        assert client.delete("/api/interval/" + intervalID).status_code == 200