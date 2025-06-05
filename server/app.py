import os
from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from flask_session import Session
from flask_bcrypt import Bcrypt
from config import ApplicationConfig
from models import db, User, Post, SavedPost
import requests
import pandas as pd
from sqlalchemy import func
from pyppeteer import launch
import asyncio
import base64
import math
import httpx
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from celery import Celery, Task, shared_task
from celery.schedules import crontab
from scraper import item_generator, scrape_search, randomItem
from sqlalchemy.exc import IntegrityError
import gc
import time
from celery.utils.debug import sample_mem, memdump

#celery -A app.celery_app worker --loglevel INFO
#celery -A app.celery_app worker --loglevel INFO --max-tasks-per-child=1

#celery -A app.celery_app worker --concurrency=1 --max-tasks-per-child=1 --loglevel INFO
#celery -A app.celery_app beat --loglevel INFO




def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config["CELERY"])
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app

def create_app():
    app = Flask(__name__)
    app.config.from_object(ApplicationConfig)
    app.config.update(SESSION_COOKIE_SAMESITE="None", SESSION_COOKIE_SECURE=False)
    app.config.from_mapping(
        CELERY=dict(
            broker_url="redis://localhost",
            result_backend="redis://localhost",
            task_ignore_result=True,
            beat_schedule={
                "task-every-10-seconds": {
                    "task": "app.run_crawler_task",
                    "schedule": 100,
                }
            },
        ),
    )

    return app





app = create_app()
celery_app = celery_init_app(app)

jwt = JWTManager(app)

CORS(app, supports_credentials=True, origins="*")    
bcrypt = Bcrypt(app)

db.init_app(app)
with app.app_context():
    #db.drop_all()
    db.create_all()

server_session = Session(app)

@app.route('/getData', methods = ['GET'])
def query():
    id = request.args.get("id")

    id = int(id) + 1


    post = Post.query.filter_by(id = id).first()

    if(post is None):
        return jsonify({"error" : "No site with this id"}), 401
    

    print("BALLS", id, post.content)
    

    return jsonify({
        "title" : post.content,
        "url" : post.url,
        "price" : post.price,
        "shipping" : post.shipping,
        "total" : post.total,
        "photo" : post.photo
    })



@app.route('/getSavedData', methods = ['GET'])
@jwt_required()
def getSavedData():
    id = request.args.get("id")
    user_id = get_jwt_identity()

    id = int(id)+1

    post = SavedPost.query.filter_by(user_id=user_id, index=id).first()

    try:
        print("GET:",  post.postId, user_id, id)
    except:
        print("BUT:", id)

    if(post is None):
        return jsonify({"error" : "No site with this id"}), 401
    
    post = Post.query.filter_by(id = post.postId+1).first()
    

    print("BALLS", id, post.content)
    

    return jsonify({
        "title" : post.content,
        "url" : post.url,
        "price" : post.price,
        "shipping" : post.shipping,
        "total" : post.total,
        "photo" : post.photo
    })

@app.route("/fuck", methods = ['POST'])
def fuck():
    run_crawler_task()
    return "fuck you"

@shared_task(bind=True, ignore_result=False)
def run_crawler_task(query="pokemon booster box", max_pages=1):
    """Celery task that runs the asynchronous crawler safely."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(_run_crawler("pokemon booster box", 1000))
    finally:
        loop.close()



async def _run_crawler(query, max_pages):
    """Main async function to crawl and insert posts."""

    BATCH_SIZE = 60
    queue = []

   
    print("BALLS", query)
    async for item in scrape_search(query=query, max_pages=max_pages):
        post = Post(
            content=item.get("Title"),
            url=item.get("Url"),
            price=item.get("Price"),
            shipping=item.get("Shipping"),
            total=item.get("Total"),
            photo=item.get("Photo"),
        )
        queue.append(post)

        if len(queue) >= BATCH_SIZE:
            # Move the insert to a separate thread to avoid blocking the event loop
            await asyncio.to_thread(_insert_batch, queue)
            queue.clear()
            gc.collect()

    if queue:
        await asyncio.to_thread(_insert_batch, queue)
        queue.clear()
        gc.collect()

    db.session.remove()

@app.route("/getSaved", methods = ["GET"])
@jwt_required()
def getSaved():
    id = request.args.get("id")
    user_id = get_jwt_identity()

    print("BALLSE", user_id)

    return jsonify({"msg" : (SavedPost.query.filter_by(user_id=user_id, post_id=id).first() is not None)}), 200



@app.route("/getRandom", methods = ["POST"])
def getRandom():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(runRandom())
    finally:
        loop.close()
    
    return "fuck off"

async def runRandom():
    q = []
    
    async for item in randomItem("pokemon booster box"):
        post = Post(
            content=item.get("Title"),
            url=item.get("Url"),
            price=item.get("Price"),
            shipping=item.get("Shipping"),
            total=item.get("Total"),
            photo=item.get("Photo"),
        )
        q.append(post)
    
    
    _insert_batch(q)




def _insert_batch(posts):
    try:
        # ORM-level bulk insert
        db.session.bulk_save_objects(posts)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        print(f"❌ Bulk save failed: {e}")
        
        # Fall back to row-by-row insertion
        for post in posts:
            try:
                db.session.add(post)
                db.session.commit()
                db.session.expunge(post)
            except IntegrityError as ie:
                db.session.rollback()
                print(f"⚠️ Failed to insert post: {post.url} — {ie}")
    finally:
        db.session.remove()

    

@shared_task(ignore_result=False)
def assign_scraped_to_users():
    users = User.query.all()
    posts = Post.query.order_by(Post.id.desc()).limit(50).all()  # Or fetch all if needed

    assigned = 0

    for user in users:
        seen_post_ids = {saved.post_id for saved in user.saved_posts}

        for post in posts:
            if post.id not in seen_post_ids:
                saved = SavedPost(user_id=user.id, post_id=post.id)
                db.session.add(saved)
                assigned += 1

    db.session.commit()
    return f"Assigned {assigned} unseen posts to users"



@app.route("/getCnt",methods = ["GET"])
def getCnt():
    return str(Post.query.count())

@app.route("/getSavedCnt",methods = ["GET"])
@jwt_required()
def getSavedCnt():

    user_id = get_jwt_identity()

    
    return str(SavedPost.query.filter_by(user_id=user_id).count())




@app.route("/save", methods = ["POST"])
@jwt_required()
def save():
    id = request.json["postId"]
    user_id = get_jwt_identity()



    if(not SavedPost.query.filter_by(user_id=user_id, post_id=id).first()):
        print("SUB:", id, user_id, SavedPost.query.filter_by(user_id=user_id).count()+1)
        new_save = SavedPost(user_id = user_id, post_id = id,postId = id, index = SavedPost.query.filter_by(user_id=user_id).count()+1)
        db.session.add(new_save)
        db.session.commit()


        return jsonify({"msg" : "Saved"}), 200
    return jsonify({"msg" : "Already Saved"}), 200


@app.route("/unsave", methods = ["POST"])
@jwt_required()
def unsave():
    id = request.json["postId"]
    user_id = get_jwt_identity()


    if(SavedPost.query.filter_by(user_id=user_id, post_id=id).first()):
        bad = SavedPost.query.filter_by(user_id=user_id, post_id=id).first()
        db.session.delete(bad)
        db.session.commit()

        return jsonify({"msg" : "Unsaved"}), 200
    return jsonify({"msg" : "Is not in saved"}), 200


@app.route("/otherUnsave", methods = ["POST"])
@jwt_required()
def otherUnsave():
    id = request.json["postId"]
    user_id = get_jwt_identity()

    id = int(id)+1



    if(SavedPost.query.filter_by(user_id=user_id, index=id).first()):
        bad = SavedPost.query.filter_by(user_id=user_id, index=id).first()
        db.session.delete(bad)
        db.session.commit()

        print("SEE:", id+1, SavedPost.query.filter_by(user_id = user_id).count()+2)
        for i in range(id+1, SavedPost.query.filter_by(user_id = user_id).count()+2):
            post = SavedPost.query.filter_by(user_id = user_id, index = i).first()
            post.index -= 1
            

        db.session.commit()
    
    
        

        return jsonify({"msg" : "Unsaved"}), 200
    return jsonify({"msg" : "Is not in saved"}), 200







@app.route("/register", methods=["POST"])
def register_user():
    email = request.json["email"]
    password = request.json["password"]

    exists = User.query.filter_by(email=email).first() is not None
    if exists:
        return jsonify({"error": "User already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User(email=email, password=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=str(new_user.id))

    return jsonify({
        "id": new_user.id,
        "email": new_user.email,
        "access_token": access_token
    }), 201




@app.route("/login", methods = ["POST"])
def login_user():
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email = email).first()
    
    

    if user is None:
        return jsonify({"error" : "Unathorized"}), 401
    


    if not bcrypt.check_password_hash(user.password,password):
        return jsonify({"error": "Unauthorized"}), 401
    
    

    access_token = create_access_token(identity=str(user.id))

    return jsonify(access_token = access_token)

@app.route("/logout", methods=["POST", "GET"])
def logout_user():
    # With JWT, logout is typically handled client-side by removing the token
    return jsonify({"message": "Logged out. Remove token on client."}), 200

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print("Invalid token:", error)
    return jsonify({"error": "Invalid token"}), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    print("Missing token:", error)
    return jsonify({"error": "Missing token"}), 401

@app.route("/@me", methods=["GET"])
@jwt_required()
def get_current_user():
    print("Authorization header:", request.headers.get("Authorization"))
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=int(user_id)).first()


    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "email": user.email
    })



if __name__ == '__main__':
    app.run(debug=True)