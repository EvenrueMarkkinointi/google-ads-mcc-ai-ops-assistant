import { fetchGoogleJson } from "../lib/googleAuth.js";

const ADS_SCOPE = ["https://www.googleapis.com/auth/adwords"];
const ADS_API_VERSION = "v19";

export class GoogleAdsCollector {
  constructor({ auth, developerToken, loginCustomerId }) {
    this.auth = auth;
    this.developerToken = developerToken;
    this.loginCustomerId = loginCustomerId;
  }

  async collectAccountSnapshot(account) {
    const [yesterday, trailing7d, trailing28d, campaignHighlights, policyIssues, servingStatus] =
      await Promise.all([
        this.searchMetrics(account.customerId, buildMetricsQuery("YESTERDAY")),
        this.searchMetrics(account.customerId, buildMetricsQuery("LAST_7_DAYS")),
        this.searchMetrics(account.customerId, buildMetricsQuery("LAST_28_DAYS")),
        this.search(account.customerId, buildCampaignHighlightsQuery()),
        this.search(account.customerId, buildPolicyIssuesQuery()),
        this.search(account.customerId, buildAccountStatusQuery())
      ]);

    return {
      customerId: account.customerId,
      accountName: account.accountName,
      servingStatus: servingStatus[0]?.customer?.status ?? "UNKNOWN",
      metricSnapshots: {
        yesterday: aggregateMetrics(yesterday),
        trailing7d: aggregateMetrics(trailing7d),
        trailing28d: aggregateMetrics(trailing28d)
      },
      campaignHighlights: campaignHighlights.slice(0, 25),
      policyIssues,
      sourceErrors: []
    };
  }

  async searchMetrics(customerId, query) {
    return this.search(customerId, query);
  }

  async search(customerId, query) {
    const url = `https://googleads.googleapis.com/${ADS_API_VERSION}/customers/${customerId}/googleAds:searchStream`;
    const normalizedLoginCustomerId = String(this.loginCustomerId ?? "").trim();
    const headers = {
      "developer-token": this.developerToken,
      ...(normalizedLoginCustomerId ? { "login-customer-id": normalizedLoginCustomerId } : {})
    };

    const rows = await fetchGoogleJson(this.auth, ADS_SCOPE, url, {
      method: "POST",
      headers,
      body: JSON.stringify({ query })
    });

    return (rows ?? []).flatMap((chunk) => chunk.results ?? []);
  }
}

function buildMetricsQuery(dateRange) {
  return `
    SELECT
      customer.id,
      customer.descriptive_name,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.conversions_value
    FROM customer
    WHERE segments.date DURING ${dateRange}
  `;
}

function buildCampaignHighlightsQuery() {
  return `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE segments.date DURING LAST_7_DAYS
    ORDER BY metrics.cost_micros DESC
  `;
}

function buildPolicyIssuesQuery() {
  return `
    SELECT
      ad_group_ad.ad.id,
      ad_group_ad.ad.name,
      ad_group_ad.policy_summary.approval_status,
      ad_group_ad.policy_summary.review_status
    FROM ad_group_ad
    WHERE ad_group_ad.policy_summary.approval_status != 'APPROVED'
  `;
}

function buildAccountStatusQuery() {
  return `
    SELECT
      customer.id,
      customer.descriptive_name,
      customer.status
    FROM customer
  `;
}

function aggregateMetrics(rows) {
  return rows.reduce(
    (acc, row) => ({
      costMicros: acc.costMicros + Number(row.metrics?.costMicros ?? row.metrics?.cost_micros ?? 0),
      impressions: acc.impressions + Number(row.metrics?.impressions ?? 0),
      clicks: acc.clicks + Number(row.metrics?.clicks ?? 0),
      conversions: acc.conversions + Number(row.metrics?.conversions ?? 0),
      conversionValue:
        acc.conversionValue +
        Number(row.metrics?.conversionsValue ?? row.metrics?.conversions_value ?? 0)
    }),
    { costMicros: 0, impressions: 0, clicks: 0, conversions: 0, conversionValue: 0 }
  );
}
