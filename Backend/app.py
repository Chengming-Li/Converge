import os
import psycopg2
from dotenv import load_dotenv
from flask import Flask

app = Flask(__name__)

# loads environment variables from .env and gets the database URL
load_dotenv()
url = os.getenv("DATABASE_URL")

connection = psycopg2.connect(url)  # establishes connection to database

@app.get('/api/')  # exposes endpoint at "/api/"
def defaultApiCall():
    return "Hello World"

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)