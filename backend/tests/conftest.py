import os
from dotenv import load_dotenv
from src.app import create_app

import pytest

@pytest.fixture
def app():
    load_dotenv()
    app = create_app({
        "DATABASE": os.getenv("TEST_DATABASE_URL")
    })

    yield app

@pytest.fixture()
def client(app):
    return app.test_client()
