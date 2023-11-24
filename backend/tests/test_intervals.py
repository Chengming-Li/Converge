# Run "docker exec -it focus-backend-1 pytest" in terminal to test

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
    assert "id" in response.get_json(), "id not included in response"
    assert response.get_json()["id"] is not "", f"invalid id returned, got {response.get_json()['id']}"

    # clean up
    client.delete("/api/user/" + response.get_json()['id'])