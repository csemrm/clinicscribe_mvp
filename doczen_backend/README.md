# Doczen AI Backend

Minimal Django REST backend for the core workflow:
Patient -> Encounter -> AI Draft -> Human Review -> Final PDF

## Docker run

Copy the example environment file and start the stack:

```bash
cp .env.example .env
docker compose up --build

docker compose down
docker compose run --rm web python manage.py makemigrations core
docker compose down -v
docker compose up --build
docker compose run --rm web python manage.py migrate
docker compose exec web python manage.py createsuperuser
```
The stack includes:
- Django app on `http://localhost:8000`
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- Celery worker for generation tasks

## Local run without Docker

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Main endpoints

- `POST /api/register/`
- `POST /api/login/`
- `GET /api/me/`
- `GET|POST /api/patients/`
- `GET|POST /api/encounters/`
- `POST /api/encounters/:id/generate_soap/`
- `POST /api/encounters/:id/generate_avs/`
- `POST /api/encounters/:id/generate_form/`
- `POST /api/encounters/:id/upload_attachment/`
- `GET /api/encounters/:id/documents/`
- `GET|PATCH /api/documents/:id/`
- `POST /api/documents/:id/submit_review/`
- `POST /api/documents/:id/finalize/`
- `GET /api/documents/:id/export_json/`
- `GET /api/documents/:id/export_pdf/`

## Notes

- JWT auth is enabled.
- Everything is clinic-scoped.
- Final documents are read-only.
- Every create/update/review/finalize step records an audit event.
- PDF export is allowed only after finalization.
