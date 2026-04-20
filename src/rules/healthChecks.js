import { isoDate } from "../lib/utils.js";

export function evaluateHealth(account, snapshot, thresholds, runDate = isoDate()) {
  const issues = [];
  const enabledThresholds = thresholds.filter((threshold) => threshold.enabled);

  if (snapshot.sourceErrors?.length) {
    issues.push({
      code: "SOURCE_ERROR",
      severity: "red",
      summary: `Source errors prevented a full read for ${account.accountName}.`,
      details: { errors: snapshot.sourceErrors }
    });
  }

  const daily = snapshot.metricSnapshots.yesterday;
  const baseline7d = divideMetrics(snapshot.metricSnapshots.trailing7d, 7);
  const baseline28d = divideMetrics(snapshot.metricSnapshots.trailing28d, 28);

  if (baseline7d.costMicros > 0 && daily.costMicros === 0) {
    issues.push({
      code: "NO_SPEND",
      severity: "red",
      summary: "No spend yesterday although the recent baseline shows active spend."
    });
  }

  if (baseline7d.impressions > 0 && daily.impressions === 0) {
    issues.push({
      code: "NO_IMPRESSIONS",
      severity: "red",
      summary: "No impressions yesterday although the recent baseline shows active delivery."
    });
  }

  if (baseline7d.clicks > 0 && daily.clicks === 0) {
    issues.push({
      code: "NO_CLICKS",
      severity: "yellow",
      summary: "No clicks yesterday although the recent baseline shows traffic."
    });
  }

  if (Array.isArray(snapshot.policyIssues) && snapshot.policyIssues.length > 0) {
    issues.push({
      code: "POLICY_ISSUES",
      severity: "yellow",
      summary: `${snapshot.policyIssues.length} ads have policy or approval issues.`,
      details: { policyIssues: snapshot.policyIssues.slice(0, 10) }
    });
  }

  for (const threshold of enabledThresholds) {
    const baseline = threshold.comparisonWindow === "baseline_28d" ? baseline28d : baseline7d;
    const metric = threshold.metric;
    const currentValue = daily[metric];
    const baselineValue = baseline[metric];
    if (!baselineValue || !Number.isFinite(currentValue)) {
      continue;
    }
    const deltaPct = ((currentValue - baselineValue) / baselineValue) * 100;
    const absDelta = Math.abs(deltaPct);
    if (absDelta >= threshold.alertPct) {
      issues.push(metricDeltaIssue(metric, deltaPct, "red", threshold.comparisonWindow));
    } else if (absDelta >= threshold.warnPct) {
      issues.push(metricDeltaIssue(metric, deltaPct, "yellow", threshold.comparisonWindow));
    }
  }

  return {
    customerId: account.customerId,
    accountName: account.accountName,
    runDate,
    status: deriveStatus(issues),
    issues,
    metricSnapshots: snapshot.metricSnapshots,
    campaignHighlights: snapshot.campaignHighlights ?? [],
    policyIssues: snapshot.policyIssues ?? [],
    sourceErrors: snapshot.sourceErrors ?? []
  };
}

function metricDeltaIssue(metric, deltaPct, severity, comparisonWindow) {
  const direction = deltaPct > 0 ? "up" : "down";
  return {
    code: `DELTA_${metric.toUpperCase()}`,
    severity,
    summary: `${metric} moved ${Math.abs(deltaPct).toFixed(1)}% ${direction} versus ${comparisonWindow}.`,
    details: { metric, deltaPct, comparisonWindow }
  };
}

function deriveStatus(issues) {
  if (issues.some((issue) => issue.severity === "red")) return "red";
  if (issues.some((issue) => issue.severity === "yellow")) return "yellow";
  return "green";
}

function divideMetrics(snapshot, days) {
  return {
    costMicros: snapshot.costMicros / days,
    impressions: snapshot.impressions / days,
    clicks: snapshot.clicks / days,
    conversions: snapshot.conversions / days,
    conversionValue: snapshot.conversionValue / days
  };
}
