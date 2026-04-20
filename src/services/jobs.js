import { createId, isoDate, summarizeError } from "../lib/utils.js";
import { evaluateHealth } from "../rules/healthChecks.js";
import { renderDailyHealthEmail, renderWeeklyPortfolioEmail } from "../reporting/renderers.js";

export class JobService {
  constructor({ controlPanelService, googleAdsCollector, analysisProvider, emailClient, repository, appBaseUrl }) {
    this.controlPanelService = controlPanelService;
    this.googleAdsCollector = googleAdsCollector;
    this.analysisProvider = analysisProvider;
    this.emailClient = emailClient;
    this.repository = repository;
    this.appBaseUrl = appBaseUrl;
  }

  async listAccounts() {
    const panel = await this.controlPanelService.getControlPanel();
    return panel.accounts;
  }

  async runDailyHealthCheck() {
    const panel = await this.controlPanelService.getControlPanel();
    const results = [];

    for (const account of panel.accounts) {
      try {
        const snapshot = await this.googleAdsCollector.collectAccountSnapshot(account);
        results.push(evaluateHealth(account, snapshot, panel.thresholds));
      } catch (error) {
        results.push({
          customerId: account.customerId,
          accountName: account.accountName,
          runDate: isoDate(),
          status: "red",
          issues: [
            {
              code: "COLLECTION_FAILED",
              severity: "red",
              summary: summarizeError(error)
            }
          ],
          metricSnapshots: {
            yesterday: emptyMetrics(),
            trailing7d: emptyMetrics(),
            trailing28d: emptyMetrics()
          },
          campaignHighlights: [],
          policyIssues: [],
          sourceErrors: [summarizeError(error)]
        });
      }
    }

    const recipients = panel.recipients.filter((recipient) => recipient.reportType === "daily");
    const email = renderDailyHealthEmail(results, recipients, this.appBaseUrl);
    const payload = {
      runId: createId("daily"),
      runDate: isoDate(),
      results,
      recipients
    };
    const saved = await this.repository.saveReport("daily", payload, payload.runDate, payload.runDate);

    if (recipients.length) {
      await this.emailClient.sendEmail({
        to: recipients.map((recipient) => recipient.recipientEmail),
        subject: email.subject,
        html: email.html,
        text: email.text
      });
    }

    return { ...payload, reportId: saved.id };
  }

  async runWeeklyReview() {
    const panel = await this.controlPanelService.getControlPanel();
    const accountReports = [];

    for (const account of panel.accounts) {
      let snapshot;
      let health;
      try {
        snapshot = await this.googleAdsCollector.collectAccountSnapshot(account);
        health = evaluateHealth(account, snapshot, panel.thresholds);
      } catch (error) {
        snapshot = {
          customerId: account.customerId,
          accountName: account.accountName,
          servingStatus: "UNKNOWN",
          metricSnapshots: {
            yesterday: emptyMetrics(),
            trailing7d: emptyMetrics(),
            trailing28d: emptyMetrics()
          },
          campaignHighlights: [],
          policyIssues: [],
          sourceErrors: [summarizeError(error)]
        };
        health = evaluateHealth(account, snapshot, panel.thresholds);
      }

      const checklist = panel.checklist.filter(
        (item) => item.appliesTo === "all" || item.appliesTo === account.customerId || item.appliesTo === account.accountName
      );

      const analysisInput = {
        account,
        health,
        snapshot,
        checklist
      };
      const analysis = await this.analysisProvider.generateWeeklyAccountAnalysis(analysisInput);
      accountReports.push({ account, health, snapshot, checklist, analysis });
    }

    const report = {
      runId: createId("weekly"),
      periodStart: shiftDate(-6),
      periodEnd: isoDate(),
      accountReports,
      portfolioSummary: await this.analysisProvider.generatePortfolioSummary({
        periodStart: shiftDate(-6),
        periodEnd: isoDate(),
        accounts: accountReports.map((reportItem) => ({
          customerId: reportItem.account.customerId,
          accountName: reportItem.account.accountName,
          healthStatus: reportItem.health.status,
          executiveSummary: reportItem.analysis.executiveSummary,
          risks: reportItem.analysis.risks,
          opportunities: reportItem.analysis.opportunities,
          nextActions: reportItem.analysis.nextActions
        }))
      }),
      emailRecipients: panel.recipients.filter((recipient) => recipient.reportType === "weekly")
    };

    const saved = await this.repository.saveReport("weekly", report, report.periodStart, report.periodEnd);
    const email = renderWeeklyPortfolioEmail(report, this.appBaseUrl);

    if (report.emailRecipients.length) {
      await this.emailClient.sendEmail({
        to: report.emailRecipients.map((recipient) => recipient.recipientEmail),
        subject: email.subject,
        html: email.html,
        text: email.text
      });
    }

    return { ...report, reportId: saved.id };
  }

  async runAccountReview(customerId) {
    const accounts = await this.listAccounts();
    const account = accounts.find((item) => item.customerId === String(customerId).replace(/-/g, ""));
    if (!account) {
      throw new Error(`Account ${customerId} is not enabled in the control panel.`);
    }

    const panel = await this.controlPanelService.getControlPanel();
    const snapshot = await this.googleAdsCollector.collectAccountSnapshot(account);
    const health = evaluateHealth(account, snapshot, panel.thresholds);
    const checklist = panel.checklist.filter(
      (item) => item.appliesTo === "all" || item.appliesTo === account.customerId || item.appliesTo === account.accountName
    );
    const analysis = await this.analysisProvider.generateWeeklyAccountAnalysis({
      account,
      health,
      snapshot,
      checklist
    });

    return { account, health, analysis };
  }

  async getLatestReport(reportType) {
    return this.repository.getLatestReport(reportType);
  }

  async getReport(id) {
    return this.repository.getReport(id);
  }
}

function emptyMetrics() {
  return {
    costMicros: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    conversionValue: 0
  };
}

function shiftDate(days) {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
