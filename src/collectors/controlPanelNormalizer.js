import { parseBoolean, parseNumber } from "../lib/utils.js";

export function normalizeControlPanel(panel = {}) {
  return {
    accounts: (panel.accounts ?? []).map(normalizeAccount),
    checklist: (panel.checklist ?? []).map(normalizeChecklistItem),
    recipients: (panel.recipients ?? []).map(normalizeRecipient),
    thresholds: (panel.thresholds ?? []).map(normalizeThreshold)
  };
}

function normalizeAccount(row) {
  return {
    customerId: String(row.customerId ?? row.customer_id ?? "").replace(/-/g, ""),
    accountName: String(row.accountName ?? row.account_name ?? ""),
    active: parseBoolean(row.active),
    ownerEmail: String(row.ownerEmail ?? row.owner_email ?? ""),
    timezone: String(row.timezone ?? "Europe/Helsinki"),
    currency: String(row.currency ?? "EUR"),
    notes: String(row.notes ?? "")
  };
}

function normalizeChecklistItem(row) {
  return {
    checkId: String(row.checkId ?? row.check_id ?? ""),
    section: String(row.section ?? ""),
    question: String(row.question ?? ""),
    instruction: String(row.instruction ?? ""),
    severity: normalizeSeverity(row.severity),
    appliesTo: String(row.appliesTo ?? row.applies_to ?? "all"),
    enabled: parseBoolean(row.enabled)
  };
}

function normalizeRecipient(row) {
  return {
    reportType: String(row.reportType ?? row.report_type ?? "").toLowerCase(),
    recipientEmail: String(row.recipientEmail ?? row.recipient_email ?? ""),
    recipientName: String(row.recipientName ?? row.recipient_name ?? ""),
    enabled: parseBoolean(row.enabled)
  };
}

function normalizeThreshold(row) {
  return {
    metric: String(row.metric ?? ""),
    comparisonWindow: String(row.comparisonWindow ?? row.comparison_window ?? "baseline_7d"),
    warnPct: parseNumber(row.warnPct ?? row.warn_pct),
    alertPct: parseNumber(row.alertPct ?? row.alert_pct),
    enabled: parseBoolean(row.enabled)
  };
}

function normalizeSeverity(value) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "alert") return "alert";
  if (normalized === "warn") return "warn";
  return "info";
}
