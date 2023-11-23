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
    
    with app.test_client() as client:
        client.delete("/api/clear/table/users", json={"confimration" : os.getenv("DEV_PASSWORD")})
        client.delete("/api/clear/table/intervals", json={"confimration" : os.getenv("DEV_PASSWORD")})

@pytest.fixture()
def client(app):
    return app.test_client()
