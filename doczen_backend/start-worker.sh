#!/usr/bin/env sh
set -eu
exec celery -A config.celery worker --loglevel=info
