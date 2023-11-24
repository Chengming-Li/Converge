# Run "docker exec -it focus-backend-1 pytest" in terminal to test

def test_api_home(app):
    client = app[1]
    client.send("Hello there")

    response = client.get_received()

    assert len(response) > 0, "No message received"
    assert response[0]['args'] == "Hello there", "Incorrect message received"