/**
 * Type definitions for AI interpretation layer
 * All interpretations are explanatory only and never modify risk scores
 */

export interface PatternInterpretation {
  patternType: string;
  confidence: number;
  explanation: string;
  riskIndicator: string;
  keyAccounts: string[];
  flowDescription: string;
  timeline: string;
}

export interface RiskExplanation {
  score: number;
  level: "high" | "medium" | "low";
  mainFactors: RiskFactor[];
  summary: string;
  contextualNotes: string;
}

export interface RiskFactor {
  name: string;
  weight: number;
  contribution: string;
  examples: string[];
}

export interface InvestigationRecommendation {
  priority: "high" | "medium" | "low";
  action: string;
  rationale: string;
  expectedFindings: string;
  suggestedApproach: string;
}

export interface CaseSummary {
  title: string;
  overview: string;
  keyFindings: string[];
  suspiciousPatterns: string[];
  recommendedActions: string[];
  riskAssessment: string;
  nextSteps: string[];
}

export interface AIInsights {
  patternInterpretations: Map<string, PatternInterpretation>;
  accountExplanations: Map<string, RiskExplanation>;
  recommendations: InvestigationRecommendation[];
  caseSummary: CaseSummary;
  generatedAt: string;
}
