/**
 * @typedef {Object} AccountConfig
 * @property {string} customerId
 * @property {string} accountName
 * @property {boolean} active
 * @property {string} ownerEmail
 * @property {string} timezone
 * @property {string} currency
 * @property {string} notes
 */

/**
 * @typedef {Object} ChecklistItem
 * @property {string} checkId
 * @property {string} section
 * @property {string} question
 * @property {string} instruction
 * @property {"info"|"warn"|"alert"} severity
 * @property {string} appliesTo
 * @property {boolean} enabled
 */

/**
 * @typedef {Object} ThresholdConfig
 * @property {string} metric
 * @property {"baseline_7d"|"baseline_28d"} comparisonWindow
 * @property {number} warnPct
 * @property {number} alertPct
 * @property {boolean} enabled
 */

/**
 * @typedef {Object} RecipientConfig
 * @property {"daily"|"weekly"} reportType
 * @property {string} recipientEmail
 * @property {string} recipientName
 * @property {boolean} enabled
 */

/**
 * @typedef {Object} MetricSnapshot
 * @property {number} costMicros
 * @property {number} impressions
 * @property {number} clicks
 * @property {number} conversions
 * @property {number} conversionValue
 */

/**
 * @typedef {Object} HealthIssue
 * @property {string} code
 * @property {"green"|"yellow"|"red"} severity
 * @property {string} summary
 * @property {Object<string, unknown>} [details]
 */

/**
 * @typedef {Object} HealthCheckResult
 * @property {string} customerId
 * @property {string} accountName
 * @property {string} runDate
 * @property {"green"|"yellow"|"red"} status
 * @property {HealthIssue[]} issues
 * @property {{ yesterday: MetricSnapshot, trailing7d: MetricSnapshot, trailing28d: MetricSnapshot }} metricSnapshots
 * @property {Object[]} campaignHighlights
 * @property {Object[]} policyIssues
 * @property {string[]} sourceErrors
 */

/**
 * @typedef {Object} WeeklyAnalysis
 * @property {string} executiveSummary
 * @property {string[]} findings
 * @property {string[]} risks
 * @property {string[]} opportunities
 * @property {string[]} nextActions
 */

/**
 * @typedef {Object} PortfolioReport
 * @property {string} runId
 * @property {string} periodStart
 * @property {string} periodEnd
 * @property {Object[]} accountReports
 * @property {Object} portfolioSummary
 * @property {RecipientConfig[]} emailRecipients
 */

export {};
