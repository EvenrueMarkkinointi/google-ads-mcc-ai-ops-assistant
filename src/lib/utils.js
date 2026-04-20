import crypto from "node:crypto";

export function createId(prefix = "run") {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "y"].includes(String(value).trim().toLowerCase());
}

export function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function isoDate(value = new Date()) {
  return new Date(value).toISOString().slice(0, 10);
}

export function toCurrency(value, currency = "EUR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

export function jsonResponse(res, statusCode, body) {
  res.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body, null, 2));
}

export async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export function summarizeError(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}
