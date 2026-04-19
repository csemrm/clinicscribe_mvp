#!/usr/bin/env sh
set -eu

python - <<'PY'
import os, socket, time
host = os.getenv('DB_HOST', 'db')
port = int(os.getenv('DB_PORT', '5432'))
retries = int(os.getenv('DB_WAIT_RETRIES', '60'))
for _ in range(retries):
    try:
        with socket.create_connection((host, port), timeout=1):
            break
    except OSError:
        time.sleep(1)
else:
    raise SystemExit(f"Database {host}:{port} not reachable")
PY

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
