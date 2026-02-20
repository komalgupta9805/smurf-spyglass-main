import { create } from "zustand";
import type { Account, Ring, CaseRun, GraphEdge, ValidationResult, Settings, InterventionAction, MitigationSummary } from "@/lib/types";
import type { PatternInterpretation, RiskExplanation, InvestigationRecommendation, CaseSummary } from "@/lib/ai/types";
import {
  sampleAccounts,
  sampleRings,
  sampleEdges,
  sampleCases,
} from "@/lib/mockData";
import { API_BASE_URL } from "@/config";
import { interpretAllPatterns } from "@/lib/ai/patternInterpreter";
import { explainAllRisks } from "@/lib/ai/riskExplainer";
import { generateInvestigationRecommendations } from "@/lib/ai/investigationRecommender";
import { generateCaseSummary } from "@/lib/ai/summaryGenerator";

interface AppState {
  hasAnalysis: boolean;
  cases: CaseRun[];
  currentCase: CaseRun | null;
  accounts: Account[];
  rings: Ring[];
  edges: GraphEdge[];

  uploadedFile: File | null;
  isProcessing: boolean;
  processingTime: number | null;
  validationResult: ValidationResult | null;

  selectedAccountId: string | null;
  selectedRingId: string | null;
  ringFocusMode: boolean;
  showWhyPanel: boolean;
  whyAccountId: string | null;

  settings: Settings;

  // Intervention state
  interventionScenario: InterventionAction[];
  mitigationSummary: MitigationSummary | null;

  // AI Interpretations (new)
  patternInterpretations: Map<string, PatternInterpretation>;
  riskExplanations: Map<string, RiskExplanation>;
  investigationRecommendations: InvestigationRecommendation[];
  caseSummary: CaseSummary | null;
  showAIPanel: boolean;

  setUploadedFile: (file: File | null) => void;
  validateFile: () => void;
  runAnalysis: () => Promise<void>;
  selectAccount: (id: string | null) => void;
  selectRing: (id: string | null) => void;
  setRingFocusMode: (active: boolean) => void;
  openWhyPanel: (accountId: string) => void;
  closeWhyPanel: () => void;
  updateSettings: (s: Partial<Settings>) => void;
  resetAnalysis: () => void;
  loadSampleData: () => void;
  toggleAIPanel: () => void;

  // Intervention actions
  addIntervention: (action: InterventionAction) => void;
  removeIntervention: (index: number) => void;
  previewIntervention: () => void;
  applyIntervention: () => void;
  resetIntervention: () => void;
}

const defaultSettings: Settings = {
  nodeLimit: 2000,
  defaultLayout: "force",
  defaultEdgeLabel: "none",
  aggregateEdges: true,
  cycleLengthMin: 3,
  cycleLengthMax: 5,
  fanThreshold: 10,
  timeWindowHours: 72,
  shellTxMin: 2,
  shellTxMax: 3,
  confidenceWeight: 0.5,
};

export const useAppStore = create<AppState>((set, get) => ({
  hasAnalysis: false,
  cases: [],
  currentCase: null,
  accounts: [],
  rings: [],
  edges: [],
  uploadedFile: null,
  isProcessing: false,
  processingTime: null,
  validationResult: null,
  selectedAccountId: null,
  selectedRingId: null,
  ringFocusMode: false,
  showWhyPanel: false,
  whyAccountId: null,
  settings: { ...defaultSettings },
  interventionScenario: [],
  mitigationSummary: null,
  patternInterpretations: new Map(),
  riskExplanations: new Map(),
  investigationRecommendations: [],
  caseSummary: null,
  showAIPanel: false,

  setUploadedFile: (file) =>
    set({ uploadedFile: file, validationResult: null }),

  validateFile: async () => {
    const file = get().uploadedFile;
    if (!file) return;

    try {
      const text = await file.text();
      const firstLine = text.split(/\r?\n/)[0] || "";
      const headers = firstLine.split(",").map(h => h.trim());

      const required = ["transaction_id", "sender_id", "receiver_id", "amount", "timestamp"];
      const missing = required.filter(col => !headers.includes(col));

      const columnsDetected = missing.length === 0;

      set({
        validationResult: {
          ok: columnsDetected,
          columnsDetected,
          timestampValid: columnsDetected,  // basic for now
          amountNumeric: columnsDetected,   // basic for now
          amountPositive: true,
          duplicateTxCount: 0,
          rowsParsed: Math.max(0, text.split(/\r?\n/).length - 1),
          invalidRows: 0,
          columns: headers,
        },
      });

      if (!columnsDetected) {
        alert(`Invalid CSV: missing columns -> ${missing.join(", ")}`);
      }
    } catch (e) {
      set({ validationResult: null });
      alert("Could not read the CSV file.");
    }
  },


  runAnalysis: async () => {
    const file = get().uploadedFile;
    if (!file) return;

    set({ isProcessing: true });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        set({
          isProcessing: false,
          validationResult: {
            ok: false,
            columnsDetected: false,
            timestampValid: false,
            amountNumeric: false,
            amountPositive: false,
            duplicateTxCount: err.detail?.stats?.duplicateTxCount || 0,
            rowsParsed: err.detail?.stats?.rowsParsed || 0,
            invalidRows: err.detail?.stats?.invalidRows || 0,
            columns: err.detail?.stats?.columns || [],
            errorMessages: err.detail?.errors || [err.detail || "Invalid dataset"]
          }
        });
        return;
      }

      const data = await response.json();

      set({
        isProcessing: false,
        hasAnalysis: true,
        accounts: (data.graph?.nodes || data.suspicious_accounts || []).map((a: any) => ({
          id: a.account_id,
          riskScore: a.suspicion_score,
          confidence: 0.8,
          ringId: (a.ring_id && a.ring_id !== "NONE") ? a.ring_id : null,
          inDegree: a.in_degree || 0,
          outDegree: a.out_degree || 0,
          uniqueCounterparties: (a.in_degree || 0) + (a.out_degree || 0),
          velocityLabel: "medium",
          patterns: a.detected_patterns || [],
          totalIn: 0,
          totalOut: 0,
          txCount: data.summary?.total_transactions || 0,
          sccId: null,
          kCoreLevel: 0,
          centralityScore: 0,
          scoreBreakdown: [],
        })),
        rings: (data.fraud_rings || []).map((r: any) => ({
          id: r.ring_id,
          riskScore: r.risk_score,
          confidence: 0.8,
          members: r.member_accounts || [],
          patternType: r.pattern_type || "structural",
          cycleLength: (r.member_accounts?.length || 0),
          avgTxSize: 0,
          timeWindow: `${r.time_window?.start_time ?? ""} → ${r.time_window?.end_time ?? ""}`,
          totalFlow: 0,
        })),
        edges: (data.graph?.edges || data.edges || []).map((e: any) => ({
          from: String(e.from),
          to: String(e.to),
          amount: e.amount || 0,
          count: e.count || 0
        })),
        currentCase: {
          id: `CASE-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          fileName: file.name,
          datasetSize: 0,
          nodeCount: data.summary?.total_accounts_analyzed || 0,
          edgeCount: data.summary?.total_edges || 0,
          txCount: data.summary?.total_transactions || 0,
          suspiciousCount: data.summary?.suspicious_accounts_flagged || 0,
          ringCount: data.summary?.fraud_rings_detected || 0,
          processingTime: data.summary?.processing_time_seconds || 0,
          riskExposure: 75,
          timeWindow: "",
          topPatterns: ["cycle"],
          riskLevel: "medium",
        },
        // Also update cases list
        cases: [
          {
            id: `CASE-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            fileName: file.name,
            datasetSize: 0,
            nodeCount: data.summary?.total_accounts_analyzed || 0,
            edgeCount: data.summary?.total_edges || 0,
            txCount: data.summary?.total_transactions || 0,
            suspiciousCount: data.summary?.suspicious_accounts_flagged || 0,
            ringCount: data.summary?.fraud_rings_detected || 0,
            processingTime: data.summary?.processing_time_seconds || 0,
            riskExposure: 75,
            timeWindow: "",
            topPatterns: ["cycle"],
            riskLevel: "medium",
          },
          ...get().cases
        ]
      });

    } catch (error) {
      console.error(error);
      alert(String(error));
      set({ isProcessing: false });
    }
  },


  selectAccount: (id) => set({ selectedAccountId: id }),
  selectRing: (id) => set({ selectedRingId: id }),
  setRingFocusMode: (active) => set({ ringFocusMode: active }),
  openWhyPanel: (id) => set({ showWhyPanel: true, whyAccountId: id }),
  closeWhyPanel: () => set({ showWhyPanel: false, whyAccountId: null }),

  toggleAIPanel: () => set((state) => ({ showAIPanel: !state.showAIPanel })),

  updateSettings: (s) =>
    set((state) => ({ settings: { ...state.settings, ...s } })),

  resetAnalysis: () =>
    set({
      hasAnalysis: false,
      currentCase: null,
      accounts: [],
      rings: [],
      edges: [],
      uploadedFile: null,
      processingTime: null,
      validationResult: null,
      selectedAccountId: null,
      selectedRingId: null,
      ringFocusMode: false,
    }),

  loadSampleData: () => {
    try {
      const c = sampleCases[0];
      const accounts = sampleAccounts;
      const rings = sampleRings;
      
      // Generate AI interpretations safely
      let patternInterpretations = new Map();
      let riskExplanations = new Map();
      let investigationRecommendations: InvestigationRecommendation[] = [];
      let caseSummary: CaseSummary | null = null;

      try {
        patternInterpretations = interpretAllPatterns(rings, accounts);
      } catch (e) {
        console.warn("[v0] Pattern interpretation error:", e);
      }

      try {
        riskExplanations = explainAllRisks(accounts);
      } catch (e) {
        console.warn("[v0] Risk explanation error:", e);
      }

      try {
        investigationRecommendations = generateInvestigationRecommendations(
          accounts.filter(a => a.riskScore >= 60),
          rings
        );
      } catch (e) {
        console.warn("[v0] Investigation recommendation error:", e);
      }

      try {
        caseSummary = generateCaseSummary(c, accounts, rings);
      } catch (e) {
        console.warn("[v0] Case summary generation error:", e);
      }

      set({
        hasAnalysis: true,
        currentCase: c,
        cases: sampleCases,
        accounts,
        rings,
        edges: sampleEdges,
        processingTime: c.processingTime,
        mitigationSummary: null,
        interventionScenario: [],
        patternInterpretations,
        riskExplanations,
        investigationRecommendations,
        caseSummary,
      });
    } catch (error) {
      console.error("[v0] Error loading sample data:", error);
      // Fall back to basic data
      set({
        hasAnalysis: false,
      });
    }
  },

  addIntervention: (action) =>
    set((state) => ({
      interventionScenario: [...state.interventionScenario, action]
    })),

  removeIntervention: (index) =>
    set((state) => ({
      interventionScenario: state.interventionScenario.filter((_, i) => i !== index)
    })),

  previewIntervention: () => {
    const { currentCase, interventionScenario } = get();
    if (!currentCase) return;

    // Mock calculation of deltas
    const reductionFactor = interventionScenario.length * 0.12;
    const flowReduction = interventionScenario.length * 450000;

    set({
      mitigationSummary: {
        before: {
          riskScore: currentCase.riskExposure,
          suspiciousCount: currentCase.suspiciousCount,
          ringCount: currentCase.ringCount,
          flow: 12450000,
          disruption: 0
        },
        after: {
          riskScore: Math.max(15, currentCase.riskExposure - Math.round(reductionFactor * 60)),
          suspiciousCount: Math.max(0, currentCase.suspiciousCount - interventionScenario.length * 2),
          ringCount: Math.max(0, currentCase.ringCount - Math.round(interventionScenario.length * 0.8)),
          flow: Math.max(0, 12450000 - flowReduction),
          disruption: Math.min(100, interventionScenario.length * 15)
        }
      }
    });
  },

  applyIntervention: () => {
    const { mitigationSummary, currentCase } = get();
    if (!mitigationSummary || !currentCase) return;

    // Commit the preview to current case (mock)
    const updatedCase = {
      ...currentCase,
      riskExposure: mitigationSummary.after.riskScore,
      suspiciousCount: mitigationSummary.after.suspiciousCount,
      ringCount: mitigationSummary.after.ringCount,
    };

    set({
      currentCase: updatedCase,
      mitigationSummary: null,
      interventionScenario: [],
    });
  },

  resetIntervention: () => set({ interventionScenario: [], mitigationSummary: null }),
}));
