# Run "docker exec -it focus-backend-1 pytest" in terminal to test

"""
def test_api_home(app):
    client = app[1]
    client.emit('join', {"room": "Test", 'username': "Tester"})
    client.emit('message', {'msg': "Hello there", 'room': "Test", 'username': "Tester"})

    response = client.get_received()

    assert len(response) == 2, "Invalid number of messages received"
    assert response[0]['args'] == "Tester has entered the room.", "Failed to join room"
    assert response[1]['args'] == "Tester: Hello there", "Invalid message received"
"""