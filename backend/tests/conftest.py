import os
from dotenv import load_dotenv
from src import app as a

import pytest

@pytest.fixture
def app():
    load_dotenv()
    app, socketio = a.create_app({
        "DATABASE": os.getenv("TEST_DATABASE_URL")
    })

    socket = socketio.test_client(app, flask_test_client=app.test_client())

    yield app, socket

    socket.disconnect()