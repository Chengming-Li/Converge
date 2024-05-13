import os
from dotenv import load_dotenv
from ..src.app import create_app

import pytest

@pytest.fixture
def app():
    load_dotenv()
    app, socketio = create_app({
        "DATABASE": os.getenv("TEST_DATABASE_URL"),
        "GOOGLE_CLIENT_ID": None,
        "GOOGLE_CLIENT_SECRET": None,
        "SECRET_KEY": None,
    })

    socket1 = socketio.test_client(app, flask_test_client=app.test_client())
    socket2 = socketio.test_client(app, flask_test_client=app.test_client())

    yield app, socket1, socket2

    socket1.disconnect()
    socket2.disconnect()