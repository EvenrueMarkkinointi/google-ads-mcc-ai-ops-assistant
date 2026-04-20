import { toCurrency } from "../lib/utils.js";

export function renderDailyHealthEmail(results, recipients, appBaseUrl) {
  const hasIssues = results.some((result) => result.status !== "green");
  const affected = hasIssues ? results.filter((result) => result.status !== "green") : results;
  const date = results[0]?.runDate ?? new Date().toISOString().slice(0, 10);

  const html = `
    <h1>Daily Google Ads Health Check - ${date}</h1>
    <p>${hasIssues ? "Issues detected in one or more accounts." : "All monitored accounts are clear."}</p>
    <ul>
      ${affected
        .map(
          (result) => `
            <li>
              <strong>${result.accountName}</strong> (${result.status.toUpperCase()})
              <ul>
                ${result.issues.length ? result.issues.map((issue) => `<li>${issue.summary}</li>`).join("") : "<li>No issues detected.</li>"}
              </ul>
            </li>
          `
        )
        .join("")}
    </ul>
    <p>Recipients: ${recipients.map((recipient) => recipient.recipientEmail).join(", ")}</p>
    <p>Stored reports are available through the service API at ${appBaseUrl}/reports/&lt;id&gt;.</p>
  `.trim();

  const textLines = [
    `Daily Google Ads Health Check - ${date}`,
    hasIssues ? "Issues detected." : "All monitored accounts are clear.",
    ...affected.map((result) => {
      const issueText = result.issues.length ? result.issues.map((issue) => `- ${issue.summary}`).join("\n") : "- No issues detected.";
      return `${result.accountName} [${result.status.toUpperCase()}]\n${issueText}`;
    })
  ];

  return {
    subject: `Daily Google Ads Health Check - ${date}`,
    html,
    text: textLines.join("\n\n")
  };
}

export function renderWeeklyPortfolioEmail(report, appBaseUrl) {
  const html = `
    <h1>Weekly Google Ads Portfolio Review</h1>
    <p><strong>Period:</strong> ${report.periodStart} to ${report.periodEnd}</p>
    <p>${report.portfolioSummary.executiveSummary}</p>
    <h2>Top Risks</h2>
    <ul>${report.portfolioSummary.topRisks.map((item) => `<li>${item}</li>`).join("")}</ul>
    <h2>Top Opportunities</h2>
    <ul>${report.portfolioSummary.topOpportunities.map((item) => `<li>${item}</li>`).join("")}</ul>
    <h2>Accounts</h2>
    ${report.accountReports
      .map(
        (account) => `
          <section>
            <h3>${account.account.accountName}</h3>
            <p>${account.analysis.executiveSummary}</p>
            <p>7d spend: ${toCurrency(account.health.metricSnapshots.trailing7d.costMicros / 1_000_000, account.account.currency)}</p>
            <ul>${account.analysis.nextActions.map((item) => `<li>${item}</li>`).join("")}</ul>
          </section>
        `
      )
      .join("")}
    <p>Full report endpoint: ${appBaseUrl}/reports/${report.runId}</p>
  `.trim();

  const text = [
    "Weekly Google Ads Portfolio Review",
    `Period: ${report.periodStart} to ${report.periodEnd}`,
    report.portfolioSummary.executiveSummary,
    "Top Risks:",
    ...report.portfolioSummary.topRisks.map((item) => `- ${item}`),
    "Top Opportunities:",
    ...report.portfolioSummary.topOpportunities.map((item) => `- ${item}`),
    "Account actions:",
    ...report.accountReports.flatMap((account) => [
      `${account.account.accountName}: ${account.analysis.executiveSummary}`,
      ...account.analysis.nextActions.map((item) => `- ${item}`)
    ])
  ].join("\n");

  return {
    subject: `Weekly Google Ads Portfolio Review - ${report.periodEnd}`,
    html,
    text
  };
}
