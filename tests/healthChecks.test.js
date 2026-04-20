import assert from "node:assert/strict";
import { evaluateHealth } from "../src/rules/healthChecks.js";

const account = {
  customerId: "1234567890",
  accountName: "Example Account",
  currency: "EUR"
};

const thresholds = [
  { metric: "costMicros", comparisonWindow: "baseline_7d", warnPct: 30, alertPct: 60, enabled: true },
  { metric: "conversions", comparisonWindow: "baseline_7d", warnPct: 25, alertPct: 50, enabled: true }
];

function testGreenHealth() {
  const result = evaluateHealth(
    account,
    {
      metricSnapshots: {
        yesterday: { costMicros: 10_000_000, impressions: 1000, clicks: 100, conversions: 10, conversionValue: 500 },
        trailing7d: { costMicros: 70_000_000, impressions: 7000, clicks: 700, conversions: 70, conversionValue: 3500 },
        trailing28d: { costMicros: 280_000_000, impressions: 28000, clicks: 2800, conversions: 280, conversionValue: 14000 }
      },
      campaignHighlights: [],
      policyIssues: [],
      sourceErrors: []
    },
    thresholds
  );

  assert.equal(result.status, "green");
  assert.equal(result.issues.length, 0);
}

function testRedHealth() {
  const result = evaluateHealth(
    account,
    {
      metricSnapshots: {
        yesterday: { costMicros: 0, impressions: 0, clicks: 0, conversions: 0, conversionValue: 0 },
        trailing7d: { costMicros: 70_000_000, impressions: 7000, clicks: 700, conversions: 70, conversionValue: 3500 },
        trailing28d: { costMicros: 280_000_000, impressions: 28000, clicks: 2800, conversions: 280, conversionValue: 14000 }
      },
      campaignHighlights: [],
      policyIssues: [{ id: "ad-1" }],
      sourceErrors: []
    },
    thresholds
  );

  assert.equal(result.status, "red");
  assert.ok(result.issues.some((issue) => issue.code === "NO_SPEND"));
  assert.ok(result.issues.some((issue) => issue.code === "POLICY_ISSUES"));
}

export async function run() {
  testGreenHealth();
  testRedHealth();
}
