# Doczen AI Frontend Scaffold

React + TypeScript + Vite frontend for the Doczen AI workflow:
Patient → Encounter → AI Draft → Human Review → Final PDF

## Run locally

```bash
npm install
npm run dev
```

## Run with Docker

```bash
cp .env.example .env

docker compose up --build
```

Then open:

- http://localhost:3000

## API connection

Set the backend base URL:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

This scaffold includes the page structure, layout, and API wrapper hooks. Connect each page to the matching backend endpoints as needed.
