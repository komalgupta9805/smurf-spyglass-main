/**
 * Risk Explainer - Breaks down risk scores into understandable factors
 * Explains "why" an account is flagged without changing the score
 */

import type { Account, getRiskLevel } from "@/lib/types";
import type { RiskExplanation, RiskFactor } from "./types";

export function explainRiskScore(account: Account): RiskExplanation {
  const riskLevel = getRiskLevel(account.riskScore);
  const factors = analyzeRiskFactors(account);

  const summary = generateRiskSummary(account, factors, riskLevel);
  const contextualNotes = generateContextualNotes(account, riskLevel);

  return {
    score: account.riskScore,
    level: riskLevel,
    mainFactors: factors,
    summary,
    contextualNotes,
  };
}

function analyzeRiskFactors(account: Account): RiskFactor[] {
  const factors: RiskFactor[] = [];

  // Velocity analysis
  if (account.velocityLabel === "high") {
    factors.push({
      name: "High Transaction Velocity",
      weight: 0.25,
      contribution: `${account.txCount} transactions in recent period suggests rapid fund movement`,
      examples: [
        "Potential smurfing activity",
        "Rapid cycling through accounts",
        "Unusual trading volume for account type"
      ],
    });
  }

  // Degree analysis
  if (account.inDegree > 10 || account.outDegree > 10) {
    const degree = Math.max(account.inDegree, account.outDegree);
    factors.push({
      name: "High Network Degree",
      weight: 0.2,
      contribution: `Connected to ${degree} counterparties indicates hub-like behavior`,
      examples: [
        "Central node in transaction network",
        "Potential aggregator or distributor",
        "Unusual interconnectedness for account profile"
      ],
    });
  }

  // Pattern analysis
  if (account.patterns.length > 0) {
    const patternStr = account.patterns.join(", ");
    factors.push({
      name: "Detected Behavioral Patterns",
      weight: 0.25,
      contribution: `${account.patterns.length} suspicious patterns detected: ${patternStr}`,
      examples: account.patterns.map(p => `Pattern: ${p}`),
    });
  }

  // Amount analysis
  if (account.totalOut > 500000 || account.totalIn > 500000) {
    const highestFlow = Math.max(account.totalOut, account.totalIn);
    factors.push({
      name: "High Transaction Volume",
      weight: 0.15,
      contribution: `$${(highestFlow / 1000000).toFixed(1)}M total movement suggests significant fund flow`,
      examples: [
        "Large transaction sizes",
        "Cumulative high volume",
        "Potential layering activity"
      ],
    });
  }

  // Confidence analysis
  if (account.confidence > 0.8) {
    factors.push({
      name: "High Detection Confidence",
      weight: 0.15,
      contribution: `${Math.round(account.confidence * 100)}% confidence level indicates strong signal`,
      examples: [
        "Multiple independent indicators align",
        "Pattern consistency across timeframe",
        "Clear behavioral anomaly detected"
      ],
    });
  }

  // Normalize weights
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  factors.forEach(f => f.weight = Math.round((f.weight / totalWeight) * 100));

  return factors.sort((a, b) => b.weight - a.weight);
}

function generateRiskSummary(account: Account, factors: RiskFactor[], level: string): string {
  const accountId = account.id;
  const topFactor = factors[0]?.name || "detected anomalies";

  if (level === "high") {
    return `Account ${accountId} exhibits multiple high-risk indicators. Primary concern: ${topFactor}. Recommend immediate investigation and potential intervention.`;
  }

  if (level === "medium") {
    return `Account ${accountId} shows concerning behavior patterns. Key issue: ${topFactor}. Suitable for monitoring and targeted investigation.`;
  }

  return `Account ${accountId} has low-risk profile with minor anomalies. Monitor: ${topFactor}.`;
}

function generateContextualNotes(account: Account, level: string): string {
  const notes: string[] = [];

  if (level === "high" && account.sccId !== null) {
    notes.push("Part of a detected strongly connected component suggesting coordinated activity.");
  }

  if (account.kCoreLevel > 3) {
    notes.push(`K-core level ${account.kCoreLevel} indicates deeply embedded network position.`);
  }

  if (account.centralityScore > 0.7) {
    notes.push("High centrality score suggests hub role in transaction network.");
  }

  if (account.uniqueCounterparties > 50) {
    notes.push(`High counterparty diversity (${account.uniqueCounterparties} unique) may indicate deliberate relationship rotation.`);
  }

  return notes.length > 0 
    ? notes.join(" " || "Account shows standard transaction patterns."
    : "Account shows standard transaction patterns.";
}

/**
 * Generate risk explanations for multiple accounts
 */
export function explainAllRisks(accounts: Account[]): Map<string, RiskExplanation> {
  const explanations = new Map<string, RiskExplanation>();

  for (const account of accounts) {
    explanations.set(account.id, explainRiskScore(account));
  }

  return explanations;
}

/**
 * Explain risk score breakdown as a structured string
 */
export function getRiskBreakdownString(account: Account): string {
  const explanation = explainRiskScore(account);
  const factorStrings = explanation.mainFactors
    .map(f => `${f.name} (${f.weight}%): ${f.contribution}`)
    .join("\n");

  return `${explanation.summary}\n\nContributing Factors:\n${factorStrings}\n\nNotes: ${explanation.contextualNotes}`;
}
