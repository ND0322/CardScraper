from server.app import celery, db
from server.models import Post, User, SavedPost
from server.scraper import item_generator
import asyncio
import json
from celery import shared_task

@shared_task(ignore_result=False)
def run_crawler_task(query="pokemon booster box", max_pages=5):
    async def crawl_and_save():
        async for item in item_generator(query, max_pages=max_pages):
            if Post.query.filter_by(url=item['url']).first():
                continue
            post = Post(
                content=item["title"],
                url=item["url"],
                price=item.get("price"),
                shipping=item.get("shipping"),
                photo=item.get("photo"),
                condition=item.get("condition"),
                rating=item.get("rating"),
                rating_count=item.get("rating_count"),
        )
            db.session.add(post)
        db.session.commit()

    asyncio.run(crawl_and_save())

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

