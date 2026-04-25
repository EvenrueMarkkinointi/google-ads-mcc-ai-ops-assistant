# Google Ads MCC AI Ops Assistant

Dependency-light Node service for daily Google Ads MCC health checks and weekly AI-assisted portfolio reports.

## What is included

- HTTP API for scheduled jobs and report retrieval
- CLI for ad hoc runs from Claude Code or a terminal
- GitHub-managed control panel file parsing
- Google Ads data collection adapters
- Deterministic health checks
- OpenAI weekly analysis provider using structured JSON
- Email rendering and Resend delivery
- Storage abstraction with in-memory and Postgres implementations
- SQL bootstrap file for Cloud SQL Postgres
- Unit/integration-style tests around rules and renderers

## Quick start

1. Copy `.env.example` to `.env` and fill the required secrets.
2. Install dependencies with `npm.cmd install`.
3. Run unit tests with `node scripts/run-tests.js`.
4. Run a local smoke test with `npm run smoke` (starts server, checks `/health`, and triggers `/jobs/daily-health-check`).
5. Start the API with `node src/server.js`.
6. Run manual jobs with `node src/cli.js list_accounts` or `node src/cli.js run_daily_health_check`.

## Environment variables

The app loads a local `.env` file from the project root automatically for local development.

Google Ads authentication now uses OAuth refresh-token credentials:
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`

Other main values:
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `POSTGRES_URL`
- `CONTROL_PANEL_PATH`

## Control panel file

Edit `config/control-panel.json`. This file is intended to live in GitHub so config changes are versioned with the codebase.

Expected top-level keys:
- `accounts`
- `checklist`
- `recipients`
- `thresholds`

The bundled example file shows the expected field names and structure.

## HTTP endpoints

- `GET /health`
- `POST /jobs/daily-health-check`
- `POST /jobs/weekly-review`
- `POST /jobs/run-account-review`
- `GET /reports/:id`

## CLI commands

- `list_accounts`
- `run_daily_health_check`
- `run_weekly_review`
- `review_single_account --customer-id=1234567890`
- `get_latest_report --type=weekly`

## Deployment notes

- Deploy the container to Cloud Run.
- Use Cloud Scheduler to call:
  - daily: `POST /jobs/daily-health-check` at `07:00 Europe/Helsinki`
  - weekly: `POST /jobs/weekly-review` at `08:00 Europe/Helsinki` every Monday
- Put secrets in Secret Manager and expose them as env vars to Cloud Run.
- Keep `config/control-panel.json` in GitHub and redeploy when config changes, or point `CONTROL_PANEL_PATH` at another mounted JSON file if you prefer runtime-managed config.
- Use `STORAGE_MODE=postgres` and `POSTGRES_URL` for Cloud SQL Postgres.
