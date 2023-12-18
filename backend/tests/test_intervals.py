from datetime import datetime
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

def test_api_home(app):
    client = app[0].test_client()
    response = client.get("/api")
    assert response.status_code == 200, f"Expected status code 200, but got {response.status_code}"
    assert response.get_json()["text"] == "Hello, world!", "'text' field should be 'Hello, World!'"

def test_create_user(app):
    client = app[0].test_client()
    response = client.post("/api/user", json={
        "username" : "Test",
	    "email" : "test@gmail.com",
	    "timezone" : "America/Los_Angeles"
    })

    assert response.status_code == 201, f"Expected status code 201, but got {response.status_code}"
    responseJson = response.get_json()
    assert responseJson.get("id", False) is not "", f"invalid id returned, got {responseJson.get('id', 'id missing')}"

    # clean up
    assert client.delete("/api/user/" + responseJson['id']).status_code == 200

def test_edit_user(app):
    client = app[0].test_client()
    response = client.post("/api/user", json={
        "username" : "Test",
	    "email" : "test@gmail.com",
	    "timezone" : "America/Los_Angeles"
    })
    assert response.status_code == 201, f"Expected status code 201, but got {response.status_code}"
    userID = response.get_json()["id"]

    response = client.put(f"/api/user/settings/{userID}", json={
        "timezone" : "UTC"
    })
    assert response.status_code == 201, f"Expected status code 201, but got {response.status_code}"
    responseJson = response.get_json()
    assert responseJson.get("id", False) == userID, "incorrect ID"
    assert responseJson.get("timezone", False) == "UTC", "incorrect timezone"

    # clean up
    assert client.delete("/api/user/" + userID).status_code == 200

def test_interval(app):
    client = app[0].test_client()
    userID = client.post("/api/user", json={
        "username" : "Test",
	    "email" : "test@gmail.com",
	    "timezone" : "America/Los_Angeles"
    }).get_json()['id']
    intervalResponse = client.post("/api/interval", json={
        "name" : "Test",
        "user_id": userID,
        "project_id": None
    })
    assert intervalResponse.status_code == 201, f"Expected status code 201, but got {intervalResponse.status_code}"
    responseJson = intervalResponse.get_json()
    assert responseJson.get("id", False), "invalid or missing id in response JSON"
    assert responseJson.get("start_time", False) and isValidTime(responseJson["start_time"], 5), "invalid or incorrect start_time in response JSON"
    
    intervalID = responseJson["id"]
    intervalResponse = client.put(f"/api/interval/end/{intervalID}")
    assert intervalResponse.status_code == 201, f"Expected status code 201, but got {intervalResponse.status_code}"
    responseJson = intervalResponse.get_json()
    assert responseJson.get("interval_id", False) == intervalID, "incorrect interval ID"
    assert responseJson.get("name", False) == "Test", "incorrect interval name"
    assert responseJson.get("project_id", False) == None, "incorrect project ID"
    assert responseJson.get("user_id", False) == userID, "incorrect user ID"
    assert responseJson["end_time"] and isValidTime(responseJson["end_time"], 5), "invalid or incorrect end_time in response JSON"
    
    start_time = "Tuesday 21 November 2023 13:38:38 UTC"
    end_time = "Wednesday 06 November 2024 00:00:00 UTC"
    intervalResponse = client.put(f"/api/interval/{intervalID}", json={
        "name" : "Test 1",
        "project_id": None,
        "start_time": start_time,
        "end_time": end_time
    })
    assert intervalResponse.status_code == 201, f"Expected status code 201, but got {intervalResponse.status_code}"
    
    response = client.get(f"http://localhost:5000/api/user/{userID}")
    assert response.status_code == 200, f"Expected status code 200, but got {intervalResponse.status_code}"
    responseJson = response.get_json()
    assert len(responseJson.get("intervals", [])) == 1, "incorrect intervals"
    interval = responseJson["intervals"][0]
    assert interval["name"] == "Test 1", "incorrect name"
    assert interval["start_time"] == start_time and interval["end_time"] == end_time, "incorrect times"
    assert interval["project_id"] == None, "incorrect project ID"

    # clean up
    assert client.delete("/api/user/" + userID).status_code == 200
    assert client.delete("/api/interval/" + intervalID).status_code == 200