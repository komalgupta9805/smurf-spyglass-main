/**
 * Pattern Interpreter - Converts graph patterns into natural language explanations
 * Deterministic template-based system for interpreting detected patterns
 */

import type { Ring, Account } from "@/lib/types";
import type { PatternInterpretation } from "./types";

const patternDescriptions: Record<string, string> = {
  cycle: "Circular transaction flow suggesting potential value transfer obfuscation",
  fan_out: "One entity distributing funds to multiple recipients, common in layering operations",
  fan_in: "Multiple entities consolidating funds into one account, typical integration phase",
  shell: "Rapid sequential transactions through shell entities for AML evasion",
  sudden_jump: "Unusual increase in transaction volume indicating potential money movement",
  velocity: "High-frequency transactions suggesting potential smurfing or rapid cycling",
  counterparty_churn: "Continuous change of transaction partners to avoid detection patterns",
};

const riskIndicators: Record<string, string> = {
  cycle: "Value laundering through circular flows",
  fan_out: "Potential placement/layering phase",
  fan_in: "Potential integration/consolidation phase",
  shell: "Deliberate obfuscation through intermediaries",
  sudden_jump: "Suspicious volume spike with unclear origin",
  velocity: "Potential smurfing or transaction cycling",
  counterparty_churn: "Evasion technique to break pattern detection",
};

export function interpretPattern(ring: Ring, accounts: Account[]): PatternInterpretation {
  const patternType = ring.patternType || "unknown";
  const memberAccounts = accounts.filter(a => ring.members.includes(a.id));
  
  // Calculate explanation quality based on ring metrics
  const confidence = Math.min(
    (ring.confidence + (ring.cycleLength > 3 ? 0.1 : 0)) * 100
  ) / 100;

  // Build key actors
  const sortedByVolume = memberAccounts.sort((a, b) => b.totalOut - a.totalOut);
  const keyAccounts = sortedByVolume.slice(0, Math.min(3, ring.members.length)).map(a => a.id);

  // Generate flow description
  const flowDescription = generateFlowDescription(ring, memberAccounts);

  // Generate timeline context
  const timeline = generateTimeline(ring);

  return {
    patternType,
    confidence,
    explanation: patternDescriptions[patternType] || "Complex transaction pattern detected",
    riskIndicator: riskIndicators[patternType] || "Unusual activity pattern",
    keyAccounts,
    flowDescription,
    timeline,
  };
}

function generateFlowDescription(ring: Ring, accounts: Account[]): string {
  const numAccounts = ring.members.length;
  const totalFlow = ring.totalFlow;
  const avgTx = ring.avgTxSize;

  if (ring.patternType === "cycle") {
    return `Circular flow involving ${numAccounts} accounts with ~$${(totalFlow / 1000).toFixed(0)}k total movement. Each transaction averages $${(avgTx / 1000).toFixed(0)}k, suggesting deliberate structuring.`;
  }

  if (ring.patternType === "fan_out") {
    const sourceAccount = accounts[0]?.id || "Primary account";
    return `${sourceAccount} distributed $${(totalFlow / 1000).toFixed(0)}k across ${numAccounts} recipients in ${ring.timeWindow}, averaging $${(avgTx / 1000).toFixed(0)}k per transaction.`;
  }

  if (ring.patternType === "fan_in") {
    const targetAccount = accounts[accounts.length - 1]?.id || "Target account";
    return `${numAccounts} accounts consolidated $${(totalFlow / 1000).toFixed(0)}k into ${targetAccount} through ${ring.cycleLength} transactions over ${ring.timeWindow}.`;
  }

  return `Pattern involves ${numAccounts} accounts with $${(totalFlow / 1000).toFixed(0)}k in total movement detected in ${ring.timeWindow}.`;
}

function generateTimeline(ring: Ring): string {
  const timeWindow = ring.timeWindow || "recent activity";
  return `Activity concentrated in ${timeWindow}, suggesting coordinated or time-sensitive operations.`;
}

/**
 * Interpret multiple rings and return organized patterns
 */
export function interpretAllPatterns(rings: Ring[], accounts: Account[]): Map<string, PatternInterpretation> {
  const interpretations = new Map<string, PatternInterpretation>();

  for (const ring of rings) {
    const interpretation = interpretPattern(ring, accounts);
    interpretations.set(ring.id, interpretation);
  }

  return interpretations;
}

/**
 * Get human-readable summary of detected patterns
 */
export function getSuspiciousPatternsNarrative(rings: Ring[]): string[] {
  const patternCounts = rings.reduce((acc, ring) => {
    const type = ring.patternType || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(patternCounts)
    .map(([type, count]) => {
      const desc = patternDescriptions[type] || type;
      return count === 1 
        ? `${count} instance of ${desc}`
        : `${count} instances of ${desc}`;
    });
}
