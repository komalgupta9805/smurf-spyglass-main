import type { Account, Ring, CaseRun, GraphEdge, ScoreComponent } from "./types";

const mkBreakdown = (score: number): ScoreComponent[] => {
  const items: ScoreComponent[] = [];
  let rem = score;
  if (rem >= 40) { items.push({ label: "Cycle motif detected (length 3–4)", score: 50, description: "Part of a short closed loop indicating fund recycling" }); rem -= 50; }
  if (rem >= 10) { items.push({ label: "Star motif (fan-in within 72h)", score: 30, description: "Multiple inflows concentrated in a short window" }); rem -= 30; }
  if (rem >= 5) { items.push({ label: "High velocity transfers", score: 10, description: "Transaction frequency exceeds normal baseline" }); rem -= 10; }
  if (rem > -30) { items.push({ label: "Merchant/payroll downweight", score: -20, description: "Recurring merchant pattern reduces risk" }); }
  if (items.length === 0) items.push({ label: "Normal behaviour", score: 0, description: "No suspicious patterns detected" });
  return items;
};

const patterns = ["cycle", "fan-in", "fan-out", "layering", "shell-chain"];
const velocities: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];

export const sampleAccounts: Account[] = Array.from({ length: 24 }, (_, i) => {
  const risk = i < 5 ? 75 + Math.floor(Math.random() * 25) : i < 12 ? 35 + Math.floor(Math.random() * 35) : Math.floor(Math.random() * 30);
  const conf = Math.min(100, risk + Math.floor(Math.random() * 20) - 10);
  const ringIdx = i < 5 ? Math.floor(i / 2) : i < 8 ? 2 : null;
  return {
    id: `ACC-${(1000 + i).toString()}`,
    riskScore: risk,
    confidence: Math.max(10, conf),
    ringId: ringIdx !== null ? `RING-${String(ringIdx + 1).padStart(3, "0")}` : null,
    inDegree: Math.floor(Math.random() * 15) + 1,
    outDegree: Math.floor(Math.random() * 12) + 1,
    uniqueCounterparties: Math.floor(Math.random() * 20) + 2,
    velocityLabel: velocities[Math.min(2, Math.floor(risk / 35))],
    patterns: patterns.filter(() => Math.random() > 0.6).slice(0, 3),
    totalIn: Math.floor(Math.random() * 5000000) + 100000,
    totalOut: Math.floor(Math.random() * 4500000) + 80000,
    txCount: Math.floor(Math.random() * 200) + 10,
    sccId: i < 10 ? Math.floor(i / 3) : null,
    kCoreLevel: Math.floor(Math.random() * 4) + 1,
    centralityScore: parseFloat((Math.random() * 0.9 + 0.05).toFixed(3)),
    scoreBreakdown: mkBreakdown(risk),
  };
});

export const sampleRings: Ring[] = [
  { id: "RING-001", riskScore: 92, confidence: 88, members: ["ACC-1000", "ACC-1001", "ACC-1002"], patternType: "cycle", cycleLength: 3, avgTxSize: 245000, timeWindow: "48h", totalFlow: 12400000 },
  { id: "RING-002", riskScore: 85, confidence: 79, members: ["ACC-1003", "ACC-1004", "ACC-1005", "ACC-1006"], patternType: "fan-in", cycleLength: 4, avgTxSize: 180000, timeWindow: "72h", totalFlow: 8700000 },
  { id: "RING-003", riskScore: 78, confidence: 72, members: ["ACC-1005", "ACC-1006", "ACC-1007"], patternType: "layering", cycleLength: 3, avgTxSize: 310000, timeWindow: "36h", totalFlow: 6200000 },
  { id: "RING-004", riskScore: 64, confidence: 60, members: ["ACC-1008", "ACC-1009"], patternType: "shell-chain", cycleLength: 2, avgTxSize: 520000, timeWindow: "24h", totalFlow: 3100000 },
  { id: "RING-005", riskScore: 55, confidence: 51, members: ["ACC-1010", "ACC-1011", "ACC-1012", "ACC-1013", "ACC-1014"], patternType: "fan-out", cycleLength: 5, avgTxSize: 95000, timeWindow: "96h", totalFlow: 4800000 },
];

export const sampleEdges: GraphEdge[] = [
  { from: "ACC-1000", to: "ACC-1001", amount: 450000, count: 6 },
  { from: "ACC-1001", to: "ACC-1002", amount: 380000, count: 4 },
  { from: "ACC-1002", to: "ACC-1000", amount: 420000, count: 5 },
  { from: "ACC-1003", to: "ACC-1004", amount: 210000, count: 3 },
  { from: "ACC-1004", to: "ACC-1005", amount: 195000, count: 7 },
  { from: "ACC-1005", to: "ACC-1006", amount: 310000, count: 2 },
  { from: "ACC-1006", to: "ACC-1003", amount: 280000, count: 4 },
  { from: "ACC-1005", to: "ACC-1007", amount: 160000, count: 3 },
  { from: "ACC-1007", to: "ACC-1006", amount: 140000, count: 2 },
  { from: "ACC-1008", to: "ACC-1009", amount: 520000, count: 8 },
  { from: "ACC-1009", to: "ACC-1008", amount: 490000, count: 6 },
  { from: "ACC-1010", to: "ACC-1011", amount: 95000, count: 2 },
  { from: "ACC-1010", to: "ACC-1012", amount: 110000, count: 3 },
  { from: "ACC-1010", to: "ACC-1013", amount: 85000, count: 1 },
  { from: "ACC-1010", to: "ACC-1014", amount: 130000, count: 4 },
  { from: "ACC-1015", to: "ACC-1000", amount: 200000, count: 2 },
  { from: "ACC-1016", to: "ACC-1003", amount: 175000, count: 1 },
  { from: "ACC-1017", to: "ACC-1010", amount: 300000, count: 3 },
  { from: "ACC-1009", to: "ACC-1018", amount: 250000, count: 2 },
  { from: "ACC-1014", to: "ACC-1019", amount: 60000, count: 1 },
];

export const sampleCases: CaseRun[] = [
  { id: "CASE-2024-0042", date: "2024-12-14", fileName: "transactions_q4.csv", datasetSize: 14200, nodeCount: 342, edgeCount: 1287, txCount: 14200, suspiciousCount: 18, ringCount: 5, processingTime: 2.3, riskExposure: 78, timeWindow: "2024-10-01 → 2024-12-14", topPatterns: ["cycle", "fan-in", "layering"], riskLevel: "high" },
  { id: "CASE-2024-0041", date: "2024-11-28", fileName: "wire_transfers_nov.csv", datasetSize: 8400, nodeCount: 210, edgeCount: 890, txCount: 8400, suspiciousCount: 7, ringCount: 2, processingTime: 1.1, riskExposure: 52, timeWindow: "2024-11-01 → 2024-11-28", topPatterns: ["fan-out", "shell-chain"], riskLevel: "medium" },
  { id: "CASE-2024-0040", date: "2024-11-10", fileName: "batch_oct.csv", datasetSize: 22100, nodeCount: 510, edgeCount: 2100, txCount: 22100, suspiciousCount: 3, ringCount: 1, processingTime: 4.7, riskExposure: 31, timeWindow: "2024-10-01 → 2024-10-31", topPatterns: ["cycle"], riskLevel: "low" },
];

export const riskHistogramData = [
  { range: "0–20", count: 8, pct: 33 },
  { range: "20–40", count: 4, pct: 17 },
  { range: "40–60", count: 5, pct: 21 },
  { range: "60–80", count: 4, pct: 17 },
  { range: "80–100", count: 3, pct: 12 },
];

export const scatterData = sampleAccounts.map((a) => ({
  name: a.id,
  confidence: a.confidence,
  riskScore: a.riskScore,
  level: a.riskScore >= 70 ? "high" : a.riskScore >= 40 ? "medium" : "low",
}));

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["00–04", "04–08", "08–12", "12–16", "16–20", "20–24"];
export const heatmapData = days.flatMap((day) =>
  hours.map((hour) => ({
    day,
    hour,
    value: Math.floor(Math.random() * 100),
  }))
);

export const velocityData = Array.from({ length: 14 }, (_, i) => ({
  day: `Dec ${i + 1}`,
  velocity: Math.floor(Math.random() * 60) + 10 + (i === 5 || i === 9 ? 80 : 0),
}));

export const patternBarData = [
  { type: "Cycles", count: 12 },
  { type: "Fan-in", count: 8 },
  { type: "Fan-out", count: 6 },
  { type: "Layering", count: 4 },
  { type: "Shell", count: 3 },
];
