export class MockAnalysisProvider {
  async generateWeeklyAccountAnalysis(input) {
    const issueCount = input.health.issues.length;
    return {
      executiveSummary:
        issueCount > 0
          ? `${input.account.accountName} has ${issueCount} active issues that need review this week.`
          : `${input.account.accountName} looks stable with no active health alerts.`,
      findings: input.checklist.map((item) => `${item.section}: ${item.question}`),
      risks: input.health.issues.map((issue) => issue.summary),
      opportunities: [`Review campaign winners in ${input.account.accountName}.`],
      nextActions: issueCount > 0 ? ["Triage the red and yellow health issues."] : ["Maintain current budget and monitor trend stability."]
    };
  }

  async generatePortfolioSummary(input) {
    return {
      executiveSummary: `Portfolio review for ${input.accounts.length} account(s).`,
      topRisks: input.accounts.flatMap((item) => item.risks).slice(0, 5),
      topOpportunities: input.accounts.flatMap((item) => item.opportunities).slice(0, 5),
      managerActions: input.accounts.flatMap((item) => item.nextActions).slice(0, 5)
    };
  }
}

export class MockEmailClient {
  constructor() {
    this.sent = [];
  }

  async sendEmail(payload) {
    this.sent.push(payload);
    return { id: `mock_${this.sent.length}` };
  }
}
