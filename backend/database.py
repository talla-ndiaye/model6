from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from dotenv import load_dotenv
import os

# Charger les variables d'environnement
load_dotenv()

db = SQLAlchemy()

def init_app(app: Flask):
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "default_secret")
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "default_jwt")

    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME")

    app.config['SQLALCHEMY_DATABASE_URI'] = (f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
