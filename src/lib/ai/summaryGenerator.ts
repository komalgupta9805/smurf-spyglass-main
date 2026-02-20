/**
 * Summary Generator - Creates executive summaries and narratives
 * Produces human-readable case summaries from deterministic analysis data
 */

import type { Account, Ring, CaseRun } from "@/lib/types";
import type { CaseSummary } from "./types";
import { interpretAllPatterns, getSuspiciousPatternsNarrative } from "./patternInterpreter";
import { generateInvestigationRecommendations } from "./investigationRecommender";

export function generateCaseSummary(
  caseRun: CaseRun,
  accounts: Account[],
  rings: Ring[]
): CaseSummary {
  const suspiciousAccounts = accounts.filter(a => a.riskScore >= 60);
  
  const keyFindings = generateKeyFindings(caseRun, suspiciousAccounts, rings);
  const suspiciousPatterns = getSuspiciousPatternsNarrative(rings);
  const recommendations = generateInvestigationRecommendations(suspiciousAccounts, rings);
  const recommendedActions = recommendations.slice(0, 3).map(r => r.action);

  return {
    title: `AML Detection Report - Case ${caseRun.id.slice(0, 8)}`,
    overview: generateOverview(caseRun, suspiciousAccounts, rings),
    keyFindings,
    suspiciousPatterns,
    recommendedActions,
    riskAssessment: generateRiskAssessment(caseRun, suspiciousAccounts),
    nextSteps: generateNextSteps(suspiciousAccounts, rings),
  };
}

function generateOverview(caseRun: CaseRun, accounts: Account[], rings: Ring[]): string {
  const highRiskCount = accounts.filter(a => a.riskScore >= 70).length;
  const ringStr = rings.length === 1 ? "1 suspicious ring" : `${rings.length} suspicious rings`;

  return `Analysis of ${caseRun.datasetSize.toLocaleString()} transactions identified ${highRiskCount} high-risk accounts and ${ringStr}. Risk exposure: ${caseRun.riskExposure}%. Dataset contained ${caseRun.nodeCount} unique entities over ${caseRun.timeWindow}.`;
}

function generateKeyFindings(caseRun: CaseRun, accounts: Account[], rings: Ring[]): string[] {
  const findings: string[] = [];

  // Severity finding
  findings.push(`Detection Confidence: Analysis achieved ${Math.round(caseRun.txCount / 100)}% transaction coverage with ${Math.round(caseRun.suspiciousCount / Math.max(caseRun.nodeCount, 1) * 100)}% entity flagging rate.`);

  // Pattern diversity
  const patternTypes = new Set(rings.map(r => r.patternType));
  if (patternTypes.size > 1) {
    findings.push(`Multiple Pattern Types: Detected ${patternTypes.size} distinct suspicious patterns (${Array.from(patternTypes).join(", ")}) indicating sophisticated techniques.`);
  }

  // Network structure
  const avgRingSize = rings.reduce((sum, r) => sum + r.members.length, 0) / Math.max(rings.length, 1);
  if (rings.length > 0) {
    findings.push(`Network Complexity: Rings average ${Math.round(avgRingSize)} members each with coordinated flows totaling $${(caseRun.riskExposure * 10000).toFixed(0)}k in suspicious movement.`);
  }

  // Velocity analysis
  const velocityAccounts = accounts.filter(a => a.velocityLabel === "high");
  if (velocityAccounts.length > 0) {
    findings.push(`Velocity Concerns: ${velocityAccounts.length} accounts exhibit high-frequency transaction patterns consistent with smurfing or rapid cycling.`);
  }

  // Hub activity
  const hubAccounts = accounts.filter(a => (a.inDegree + a.outDegree) > 30);
  if (hubAccounts.length > 0) {
    findings.push(`Hub Activity: ${hubAccounts.length} accounts function as network hubs with ${Math.round((hubAccounts[0].inDegree + hubAccounts[0].outDegree) / 2)} average connections, suggesting aggregator or distributor roles.`);
  }

  // Pattern matching
  const multiPatternAccounts = accounts.filter(a => a.patterns.length > 1);
  if (multiPatternAccounts.length > 0) {
    findings.push(`Complex Indicators: ${multiPatternAccounts.length} accounts match multiple detection patterns, indicating potential sophisticated evasion techniques.`);
  }

  return findings;
}

function generateRiskAssessment(caseRun: CaseRun, accounts: Account[]): string {
  const highRiskCount = accounts.filter(a => a.riskScore >= 70).length;
  const mediumRiskCount = accounts.filter(a => a.riskScore >= 40 && a.riskScore < 70).length;

  if (highRiskCount > 5) {
    return `CRITICAL RISK: Multiple high-confidence AML indicators detected. ${highRiskCount} accounts require immediate investigation. System recommends escalation to senior AML team and consideration of regulatory reporting.`;
  }

  if (highRiskCount > 0) {
    return `HIGH RISK: Credible suspicious activity detected. ${highRiskCount} accounts with high-confidence flags and ${mediumRiskCount} medium-risk accounts warrant prompt investigation.`;
  }

  if (mediumRiskCount > 10) {
    return `MEDIUM RISK: Elevated activity detected across multiple accounts. While no single high-confidence flags, the pattern density warrants focused investigation and monitoring.`;
  }

  return `LOWER RISK: Activity patterns detected but lower detection confidence. Recommend routine monitoring and periodic review. No immediate escalation required.`;
}

function generateNextSteps(accounts: Account[], rings: Ring[]): string[] {
  const steps: string[] = [];

  const highRiskAccounts = accounts.filter(a => a.riskScore >= 70);
  if (highRiskAccounts.length > 0) {
    steps.push(`1. Immediate Review: Prioritize ${highRiskAccounts.length} high-risk accounts for enhanced due diligence`);
  }

  if (rings.length > 0) {
    steps.push(`2. Network Analysis: Map relationships between flagged accounts in ${rings.length} detected rings`);
  }

  const velocityAccounts = accounts.filter(a => a.velocityLabel === "high");
  if (velocityAccounts.length > 0) {
    steps.push(`3. Velocity Investigation: Analyze transaction size distribution and timing for ${velocityAccounts.length} high-velocity accounts`);
  }

  steps.push("4. Documentation: Record all investigation findings and maintain audit trail per regulatory requirements");
  steps.push("5. Escalation Decision: Based on findings, determine if regulatory reporting or law enforcement referral warranted");

  return steps;
}

/**
 * Generate executive summary for compliance documentation
 */
export function generateComplianceSummary(caseRun: CaseRun, accounts: Account[], rings: Ring[]): string {
  const summary = generateCaseSummary(caseRun, accounts, rings);
  const date = new Date().toLocaleDateString();

  return `COMPLIANCE AML ANALYSIS REPORT
Generated: ${date}
Case ID: ${caseRun.id}

EXECUTIVE SUMMARY
${summary.overview}

RISK ASSESSMENT
${summary.riskAssessment}

KEY FINDINGS
${summary.keyFindings.map((f, i) => `${i + 1}. ${f}`).join("\n")}

DETECTED PATTERNS
${summary.suspiciousPatterns.map(p => `• ${p}`).join("\n")}

RECOMMENDED ACTIONS
${summary.recommendedActions.map(a => `• ${a}`).join("\n")}

NEXT STEPS
${summary.nextSteps.join("\n")}

---
This report was generated by the smurfatcher AML Detection Engine.
Analysis is based on deterministic graph and behavioral pattern detection.
Human review and investigation required before any regulatory action.`;
}

/**
 * Generate narrative for a specific ring
 */
export function generateRingNarrative(ring: Ring, accounts: Account[]): string {
  const members = accounts.filter(a => ring.members.includes(a.id));
  const summary = members.map(a => a.id).join(" → ");

  return `${ring.patternType.toUpperCase()} detected:
Flow: ${summary}
Members: ${ring.members.length} accounts
Total Movement: $${(ring.totalFlow / 1000).toFixed(0)}k
Confidence: ${Math.round(ring.confidence * 100)}%
Time Window: ${ring.timeWindow}
Average Transaction: $${(ring.avgTxSize / 1000).toFixed(0)}k`;
}
