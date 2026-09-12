#!/bin/sh
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Seeding admin account (if needed){If change password after log in}..."
python3 seed_admin.py

echo "Starting application..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-4000}"