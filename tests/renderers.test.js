import assert from "node:assert/strict";
import { renderDailyHealthEmail, renderWeeklyPortfolioEmail } from "../src/reporting/renderers.js";

function testDailyRenderer() {
  const email = renderDailyHealthEmail(
    [
      {
        accountName: "Account A",
        status: "red",
        runDate: "2026-04-20",
        issues: [{ summary: "No spend yesterday." }]
      }
    ],
    [{ recipientEmail: "am@example.com" }],
    "http://localhost:8080"
  );

  assert.match(email.subject, /2026-04-20/);
  assert.match(email.text, /No spend yesterday/);
}

function testWeeklyRenderer() {
  const email = renderWeeklyPortfolioEmail(
    {
      runId: "weekly_1",
      periodStart: "2026-04-14",
      periodEnd: "2026-04-20",
      portfolioSummary: {
        executiveSummary: "Stable week overall.",
        topRisks: ["Spend down in one account"],
        topOpportunities: ["Scale best performers"],
        managerActions: ["Review pacing"]
      },
      accountReports: [
        {
          account: { accountName: "Account A", currency: "EUR" },
          health: { metricSnapshots: { trailing7d: { costMicros: 7_000_000 } } },
          analysis: {
            executiveSummary: "Account A had a stable week.",
            nextActions: ["Increase budget on top campaign"]
          }
        }
      ]
    },
    "http://localhost:8080"
  );

  assert.match(email.html, /Stable week overall/);
  assert.match(email.text, /Increase budget on top campaign/);
}

export async function run() {
  testDailyRenderer();
  testWeeklyRenderer();
}
