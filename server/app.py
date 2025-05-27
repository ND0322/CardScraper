import os
from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from flask_session import Session
from flask_bcrypt import Bcrypt
from config import ApplicationConfig
from models import db, User
import requests
import pandas as pd
from sqlalchemy import func
from pyppeteer import launch
import asyncio
import base64
import math

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
app.config.update(SESSION_COOKIE_SAMESITE="None", SESSION_COOKIE_SECURE=False)

CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)

db.init_app(app)
with app.app_context():
    #db.drop_all()
    db.create_all()

server_session = Session(app)

@app.route("/register", methods = ["POST"])
def register_user():
    email = request.json["email"]
    password = request.json["password"]

    exists = User.query.filter_by(email = email).first() is not None

    if exists:
        return jsonify({"error": "User already exists"}), 409
    
    hshpass = bcrypt.generate_password_hash(password)


    nuser = User(email = email, password =hshpass)

    db.session.add(nuser)
    db.session.commit()

    session["user_id"] = nuser.id
    return jsonify({
        "id": nuser.id,
        "email":nuser.email
    })

@app.route("/login", methods = ["POST"])
def login_user():
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email = email).first()
    
    

    if user is None:
        return jsonify({"error" : "Unathorized"}), 401
    


    if not bcrypt.check_password_hash(user.password,password):
        return jsonify({"error": "Unauthorized"}), 401
    
    

    session["user_id"] = user.id

    return jsonify({
        "id" : user.id,
        "email" : user.email
    })

@app.route("/logout", methods=["POST", 'GET'])
def logout_user():
    session.pop("user_id")
    return "200"

@app.route("/@me", methods = ["GET"])
def get_current_user():


    if("user_id" not in session):
        return jsonify({"error": "Unauthorized"}), 401
    
    
    user_id = session["user_id"]

    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "id": user.id,
        "email": user.email
    }) 

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)