CREATE TABLE IF NOT EXISTS job_runs (
  id TEXT PRIMARY KEY,
  report_type TEXT NOT NULL,
  status TEXT NOT NULL,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_runs_report_type_created_at
  ON job_runs (report_type, created_at DESC);
