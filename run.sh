#!/bin/bash

# Activate virtual environment (adjust path if different)
source .venv/bin/activate

# Export PYTHONPATH so Python treats current folder as root for imports
export PYTHONPATH=$(pwd)

# Start Flask app (run as a module)
echo "Starting Flask app..."
flask --app server.app run &

# Give Flask a few seconds to start
sleep 3

# Start Celery worker
echo "Starting Celery worker..."
celery -A server.tasks worker --loglevel=info &

# Start Celery beat scheduler (if you use beat)
echo "Starting Celery beat..."
celery -A server.tasks beat --loglevel=info &

# Wait for all background jobs to finish (optional, keeps terminal open)
wait
