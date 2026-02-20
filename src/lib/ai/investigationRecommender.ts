/**
 * Investigation Recommender - Suggests investigation priorities and approaches
 * Purely informational - does not influence risk scoring
 */

import type { Account, Ring, getRiskLevel } from "@/lib/types";
import type { InvestigationRecommendation } from "./types";

export function generateInvestigationRecommendations(
  suspiciousAccounts: Account[],
  rings: Ring[]
): InvestigationRecommendation[] {
  const recommendations: InvestigationRecommendation[] = [];

  // High-risk account recommendations
  const highRiskAccounts = suspiciousAccounts.filter(a => a.riskScore >= 70);
  if (highRiskAccounts.length > 0) {
    recommendations.push({
      priority: "high",
      action: "Prioritize investigation of high-confidence accounts",
      rationale: `${highRiskAccounts.length} accounts flagged with 70+ risk score show strong indicators of suspicious activity.`,
      expectedFindings: "Beneficial ownership records, source of funds documentation, transaction purpose",
      suggestedApproach: "Interview account holder, request enhanced due diligence documentation, check against watchlists",
    });
  }

  // Ring investigation recommendations
  const highConfidenceRings = rings.filter(r => r.confidence > 0.75);
  if (highConfidenceRings.length > 0) {
    recommendations.push({
      priority: "high",
      action: "Investigate detected network rings",
      rationale: `${highConfidenceRings.length} high-confidence rings detected indicating coordinated activity`,
      expectedFindings: "Ownership connections, shared identifiers, coordinated transaction timing",
      suggestedApproach: "Map entity relationships, analyze transaction timing correlation, check for shell company indicators",
    });
  }

  // Velocity-based recommendations
  const velocityAccounts = suspiciousAccounts.filter(a => a.velocityLabel === "high");
  if (velocityAccounts.length > 0) {
    recommendations.push({
      priority: "medium",
      action: "Monitor high-velocity accounts for smurfing indicators",
      rationale: `${velocityAccounts.length} accounts with unusual transaction frequency suggesting potential smurfing.`,
      expectedFindings: "Structured deposits, transaction amounts just below reporting thresholds, multiple deposit locations",
      suggestedApproach: "Review transaction size distribution, check for just-below-threshold patterns, correlate with deposit timing",
    });
  }

  // Hub activity recommendations
  const hubAccounts = suspiciousAccounts.filter(
    a => a.inDegree > 15 || a.outDegree > 15
  );
  if (hubAccounts.length > 0) {
    recommendations.push({
      priority: "medium",
      action: "Investigate hub-like accounts with many counterparties",
      rationale: `${hubAccounts.length} accounts show hub characteristics with 15+ connections, typical of aggregators or money movers.`,
      expectedFindings: "Layer entity information, business justification, beneficial ownership",
      suggestedApproach: "Review counterparty legitimacy, verify business relationships, check settlement patterns",
    });
  }

  // Large flow recommendations
  const largeFlowAccounts = suspiciousAccounts.filter(a => a.totalOut > 1000000 || a.totalIn > 1000000);
  if (largeFlowAccounts.length > 0) {
    recommendations.push({
      priority: "medium",
      action: "Review large transaction flows",
      rationale: `${largeFlowAccounts.length} accounts moving 1M+ across network deserving transaction-level review.`,
      expectedFindings: "Source/destination legitimacy, business purpose, compliance with transaction limits",
      suggestedApproach: "Deep-dive transaction analysis, counterparty validation, regulatory limit verification",
    });
  }

  // Pattern diversity recommendations
  const multiPatternAccounts = suspiciousAccounts.filter(a => a.patterns.length > 2);
  if (multiPatternAccounts.length > 0) {
    recommendations.push({
      priority: "high",
      action: "Escalate accounts with multiple pattern matches",
      rationale: `${multiPatternAccounts.length} accounts match multiple suspicious patterns indicating sophisticated evasion.`,
      expectedFindings: "Deliberate structuring evidence, coordination indicators, intent to obscure",
      suggestedApproach: "Analyze temporal relationships between patterns, look for common orchestrator, check for legitimate explanation",
    });
  }

  // Confidence-based triage
  const lowConfidenceMatches = suspiciousAccounts.filter(a => a.confidence < 0.65 && a.riskScore >= 60);
  if (lowConfidenceMatches.length > 0) {
    recommendations.push({
      priority: "low",
      action: "Review lower-confidence alerts for false positives",
      rationale: `${lowConfidenceMatches.length} accounts flagged with moderate confidence may warrant revisiting assumptions.`,
      expectedFindings: "Legitimate business explanations, system tuning opportunities, model calibration data",
      suggestedApproach: "Request account context from business unit, validate business model legitimacy, gather feedback",
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Get investigation datapoints for a specific account
 */
export function getInvestigationDatapoints(account: Account): string[] {
  const datapoints: string[] = [];

  datapoints.push(`Risk Score: ${account.riskScore} (${account.confidence * 100}% confidence)`);
  datapoints.push(`Transaction Count: ${account.txCount}`);
  datapoints.push(`Total Inflow: $${(account.totalIn / 1000).toFixed(0)}k`);
  datapoints.push(`Total Outflow: $${(account.totalOut / 1000).toFixed(0)}k`);
  datapoints.push(`Network Degree: In=${account.inDegree}, Out=${account.outDegree}`);
  datapoints.push(`Unique Counterparties: ${account.uniqueCounterparties}`);
  datapoints.push(`Transaction Velocity: ${account.velocityLabel}`);

  if (account.patterns.length > 0) {
    datapoints.push(`Detected Patterns: ${account.patterns.join(", ")}`);
  }

  if (account.sccId !== null) {
    datapoints.push(`Part of Strongly Connected Component ${account.sccId}`);
  }

  datapoints.push(`K-Core Level: ${account.kCoreLevel}`);
  datapoints.push(`Network Centrality: ${(account.centralityScore * 100).toFixed(0)}%`);

  return datapoints;
}

/**
 * Suggest investigation approach based on account profile
 */
export function suggestInvestigationApproach(account: Account): string {
  if (account.riskScore >= 80) {
    return "URGENT: Escalate to senior analyst for immediate deep-dive investigation. Consider regulatory reporting.";
  }

  if (account.riskScore >= 60 && account.patterns.length > 1) {
    return "HIGH PRIORITY: Conduct multi-dimensional investigation covering all detected patterns. Request enhanced due diligence.";
  }

  if (account.riskScore >= 60 && account.velocityLabel === "high") {
    return "MEDIUM PRIORITY: Focus investigation on transaction velocity and structuring indicators. Monitor for pattern escalation.";
  }

  if (account.inDegree > 20 || account.outDegree > 20) {
    return "MEDIUM PRIORITY: Investigate network role and counterparty relationships. Verify business legitimacy.";
  }

  return "ROUTINE: Include in periodic review cycle. Monitor for behavioral changes.";
}
