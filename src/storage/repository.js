import { createId } from "../lib/utils.js";

export class InMemoryReportRepository {
  constructor() {
    this.reports = [];
  }

  async saveReport(reportType, payload, periodStart = null, periodEnd = null) {
    const id = payload.runId ?? createId(reportType);
    const record = {
      id,
      reportType,
      status: "completed",
      periodStart,
      periodEnd,
      payload,
      createdAt: new Date().toISOString()
    };
    this.reports.unshift(record);
    return record;
  }

  async getReport(id) {
    return this.reports.find((report) => report.id === id) ?? null;
  }

  async getLatestReport(reportType) {
    return this.reports.find((report) => report.reportType === reportType) ?? null;
  }
}

export class PostgresReportRepository {
  constructor(postgresUrl) {
    this.postgresUrl = postgresUrl;
    this.client = null;
  }

  async connect() {
    if (this.client) return;
    const { Client } = await import("pg");
    this.client = new Client({ connectionString: this.postgresUrl });
    await this.client.connect();
  }

  async saveReport(reportType, payload, periodStart = null, periodEnd = null) {
    await this.connect();
    const id = payload.runId ?? createId(reportType);
    await this.client.query(
      `
        INSERT INTO job_runs (id, report_type, status, period_start, period_end, payload)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [id, reportType, "completed", periodStart, periodEnd, JSON.stringify(payload)]
    );
    return this.getReport(id);
  }

  async getReport(id) {
    await this.connect();
    const result = await this.client.query(`SELECT * FROM job_runs WHERE id = $1 LIMIT 1`, [id]);
    return result.rows[0] ?? null;
  }

  async getLatestReport(reportType) {
    await this.connect();
    const result = await this.client.query(
      `SELECT * FROM job_runs WHERE report_type = $1 ORDER BY created_at DESC LIMIT 1`,
      [reportType]
    );
    return result.rows[0] ?? null;
  }
}

export function createRepository({ storageMode, postgresUrl }) {
  if (storageMode === "postgres") {
    if (!postgresUrl) throw new Error("POSTGRES_URL is required when STORAGE_MODE=postgres");
    return new PostgresReportRepository(postgresUrl);
  }
  return new InMemoryReportRepository();
}
