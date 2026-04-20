import { parseBoolean, parseNumber } from "../lib/utils.js";
import { fetchGoogleJson } from "../lib/googleAuth.js";

const SHEETS_SCOPE = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

export class GoogleSheetsControlPanelClient {
  constructor({ auth, spreadsheetId }) {
    this.auth = auth;
    this.spreadsheetId = spreadsheetId;
  }

  async readControlPanel() {
    const ranges = ["Accounts!A:G", "Checklist!A:G", "Recipients!A:D", "Thresholds!A:E"];
    const encodedRanges = ranges.map((range) => `ranges=${encodeURIComponent(range)}`).join("&");
    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values:batchGet?${encodedRanges}`;
    const response = await fetchGoogleJson(this.auth, SHEETS_SCOPE, url);
    const [accounts, checklist, recipients, thresholds] = response.valueRanges ?? [];

    return {
      accounts: mapSheet(accounts?.values ?? [], mapAccount),
      checklist: mapSheet(checklist?.values ?? [], mapChecklistItem),
      recipients: mapSheet(recipients?.values ?? [], mapRecipient),
      thresholds: mapSheet(thresholds?.values ?? [], mapThreshold)
    };
  }
}

function mapSheet(rows, mapper) {
  if (!rows.length) return [];
  const [headers, ...dataRows] = rows;
  return dataRows
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
    .map((row) => {
      const record = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
      return mapper(record);
    });
}

function mapAccount(row) {
  return {
    customerId: String(row.customer_id ?? "").replace(/-/g, ""),
    accountName: String(row.account_name ?? ""),
    active: parseBoolean(row.active),
    ownerEmail: String(row.owner_email ?? ""),
    timezone: String(row.timezone ?? "Europe/Helsinki"),
    currency: String(row.currency ?? "EUR"),
    notes: String(row.notes ?? "")
  };
}

function mapChecklistItem(row) {
  return {
    checkId: String(row.check_id ?? ""),
    section: String(row.section ?? ""),
    question: String(row.question ?? ""),
    instruction: String(row.instruction ?? ""),
    severity: normalizeSeverity(row.severity),
    appliesTo: String(row.applies_to ?? "all"),
    enabled: parseBoolean(row.enabled)
  };
}

function mapRecipient(row) {
  return {
    reportType: String(row.report_type ?? "").toLowerCase(),
    recipientEmail: String(row.recipient_email ?? ""),
    recipientName: String(row.recipient_name ?? ""),
    enabled: parseBoolean(row.enabled)
  };
}

function mapThreshold(row) {
  return {
    metric: String(row.metric ?? ""),
    comparisonWindow: String(row.comparison_window ?? "baseline_7d"),
    warnPct: parseNumber(row.warn_pct),
    alertPct: parseNumber(row.alert_pct),
    enabled: parseBoolean(row.enabled)
  };
}

function normalizeSeverity(value) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "alert") return "alert";
  if (normalized === "warn") return "warn";
  return "info";
}
