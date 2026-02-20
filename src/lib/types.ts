/**
 * Core type definitions for the smurfatcher AML detection engine
 * Defines domain models and interfaces for accounts, networks, transactions, and analysis results
 */

export interface ScoreComponent {
  label: string;
  score: number;
  description: string;
}

/** Represents a single financial entity (account/node) in the transaction network */
export interface Account {
  id: string;
  riskScore: number;
  confidence: number;
  ringId: string | null;
  inDegree: number;
  outDegree: number;
  uniqueCounterparties: number;
  velocityLabel: "low" | "medium" | "high";
  patterns: string[];
  totalIn: number;
  totalOut: number;
  txCount: number;
  sccId: number | null;
  kCoreLevel: number;
  centralityScore: number;
  scoreBreakdown: ScoreComponent[];
  activityHours?: number[];
}

/** Represents a suspicious network ring of connected entities */
export interface Ring {
  id: string;
  riskScore: number;
  confidence: number;
  members: string[];
  patternType: string;
  cycleLength: number;
  avgTxSize: number;
  timeWindow: string;
  totalFlow: number;
  coordStrength: number;
}

/** Represents a complete analysis case run */
export interface CaseRun {
  id: string;
  date: string;
  fileName: string;
  datasetSize: number;
  nodeCount: number;
  edgeCount: number;
  txCount: number;
  suspiciousCount: number;
  ringCount: number;
  processingTime: number;
  riskExposure: number;
  timeWindow: string;
  topPatterns: string[];
  riskLevel: RiskLevel;
}

/** CSV file validation result */
export interface ValidationResult {
  ok: boolean;
  columnsDetected: boolean;
  timestampValid: boolean;
  amountNumeric: boolean;
  amountPositive: boolean;
  duplicateTxCount: number;
  rowsParsed: number;
  invalidRows: number;
  columns: string[];
  errorMessages?: string[];
}

/** Graph edge representation with aggregated transaction data */
export interface GraphEdge {
  from: string;
  to: string;
  amount: number;
  count: number;
}

/** User preferences and analytical parameters */
export interface Settings {
  nodeLimit: number;
  defaultLayout: "force" | "hierarchical" | "circular" | "ring";
  defaultEdgeLabel: "none" | "amount" | "count";
  aggregateEdges: boolean;
  cycleLengthMin: number;
  cycleLengthMax: number;
  fanThreshold: number;
  timeWindowHours: number;
  shellTxMin: number;
  shellTxMax: number;
  confidenceWeight: number;
}

export type RiskLevel = "high" | "medium" | "low";

/**
 * Determine risk level classification from score
 * @param score Numerical risk score (0-100)
 * @returns Risk level classification
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/** Intervention action to mitigate detected risks */
export interface InterventionAction {
  type: "freeze" | "blacklist" | "fee";
  targetId: string;
  targetType: "node" | "edge" | "ring";
  impactScore?: number;
  confidence?: number;
  reason?: string;
  value?: number; // for fee bps
}

export interface MitigationStats {
  riskScore: number;
  suspiciousCount: number;
  ringCount: number;
  flow: number;
  disruption: number;
}

export interface MitigationSummary {
  before: MitigationStats;
  after: MitigationStats;
}
