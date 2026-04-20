# Google Ads MCC AI Ops Assistant

Dependency-light Node service for daily Google Ads MCC health checks and weekly AI-assisted portfolio reports.

## What is included

- HTTP API for scheduled jobs and report retrieval
- CLI for ad hoc runs from Claude Code or a terminal
- Google Sheets control panel parsing
- Google Ads data collection adapters
- Deterministic health checks
- OpenAI weekly analysis provider using structured JSON
- Email rendering and Resend delivery
- Storage abstraction with in-memory and Postgres implementations
- SQL bootstrap file for Cloud SQL Postgres
- Unit/integration-style tests around rules and renderers

## Quick start

1. Copy `.env.example` to `.env` and fill the required secrets.
2. Install dependencies with `npm install`.
3. Run tests with `node scripts/run-tests.js`.
4. Start the API with `node src/server.js`.
5. Run manual jobs with `node src/cli.js list_accounts` or `node src/cli.js run_daily_health_check`.

## Control panel spreadsheet

Create one Google Sheet with the tabs below.

### `Accounts`

| customer_id | account_name | active | owner_email | timezone | currency | notes |
| --- | --- | --- | --- | --- | --- | --- |

### `Checklist`

| check_id | section | question | instruction | severity | applies_to | enabled |
| --- | --- | --- | --- | --- | --- | --- |

### `Recipients`

| report_type | recipient_email | recipient_name | enabled |
| --- | --- | --- | --- |

### `Thresholds`

| metric | comparison_window | warn_pct | alert_pct | enabled |
| --- | --- | --- | --- | --- |

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
- Use `STORAGE_MODE=postgres` and `POSTGRES_URL` for Cloud SQL Postgres.
