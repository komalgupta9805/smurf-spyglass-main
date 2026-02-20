export interface ScoreComponent {
  label: string;
  score: number;
  description: string;
}

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
}

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
}

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
  riskLevel: "high" | "medium" | "low";
}

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

export interface GraphEdge {
  from: string;
  to: string;
  amount: number;
  count: number;
}

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

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

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
