from app import celery  # or from tasks import celery, adjust to your project

if __name__ == "__main__":
    # Start the celery worker from this script
    celery.worker_main()
