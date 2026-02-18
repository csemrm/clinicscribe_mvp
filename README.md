# ClinicScribe (MVP) — AI Medical Documentation + Form-Filling Copilot

**Admin/documentation assistance tool only (NOT a diagnostic tool).**  
All AI-generated content requires **human review** before it can be finalized and exported.

## Tech Stack
- **Frontend:** React + TypeScript + Tailwind (Vite)
- **Backend:** Django + DRF
- **Auth:** JWT (email/password), roles: `ADMIN`, `CLINICIAN`
- **DB:** PostgreSQL
- **Async jobs:** Celery + Redis
- **Storage:** local `media/` (swap-ready for S3 later)
- **AI:** pluggable `LLMProvider` (default deterministic `MockLLMProvider`)

---

## Quickstart (Docker)

### 1) Prereqs
- Docker + Docker Compose

### 2) Configure environment
Copy env samples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Optional: set `LLM_PROVIDER=openai` and OpenAI-compatible env vars in `backend/.env`.

### 3) Run
```bash
docker compose up --build
```

### 4) Initialize DB + seed
In another terminal:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_demo
```

Open:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

Demo users created by seed:
- Clinician: `clinician@demo.com` / `Passw0rd!`
- Admin: `admin@demo.com` / `Passw0rd!`

---

## Common Commands

### Backend
```bash
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py test
```

### Celery worker logs
```bash
docker compose logs -f worker
```

### Frontend (inside container)
The `frontend` service runs Vite dev server. For local node dev outside docker:
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)
- `DJANGO_SECRET_KEY` (required)
- `DJANGO_DEBUG` (`1`/`0`)
- `DJANGO_ALLOWED_HOSTS` (comma-separated)
- `DATABASE_URL` (used by docker)
- `REDIS_URL` (used by celery/caching)
- `CORS_ALLOWED_ORIGINS` (comma-separated, e.g. `http://localhost:5173`)
- `LLM_PROVIDER` (`mock` | `openai`)
- `OPENAI_BASE_URL` (optional, OpenAI-compatible)
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional, default `gpt-4o-mini`)

### Frontend (`frontend/.env`)
- `VITE_API_BASE_URL` (default `http://localhost:8000`)

---

## Safety & Compliance (MVP)
- Banner disclaimer in UI and PDF footer.
- No raw notes or generated content is logged in server logs (see `logging` config).
- Clinic isolation enforced in querysets/permissions.
- Generation endpoints use DRF throttling (per-user).
- Red-flag detector: if raw notes include keywords like `suicidal` or `self-harm`, UI shows a non-alarming banner.

---

## Project Structure
```
clinicscribe_mvp/
  backend/
  frontend/
  docker-compose.yml
```

---

## Notes
- This MVP stores PHI in the database to function. For production, add encryption-at-rest, key mgmt, audit hardening, and formal HIPAA/GDPR reviews.
- No diagnosis or billing/coding suggestions implemented.
