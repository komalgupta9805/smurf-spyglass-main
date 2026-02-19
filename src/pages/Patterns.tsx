import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";
import { patternBarData } from "@/lib/mockData";
import { HelpCircle, ArrowRight, Network } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Build Directed Weighted Temporal Graph",
    what: "Construct a graph where edges carry amount, timestamp, and direction.",
    why: "Foundation for all structural analysis; preserves temporal ordering.",
    stats: { nodes: 342, edges: 1287, timeSpan: "75 days" },
  },
  {
    step: 2,
    title: "Compute SCC (Strongly Connected Components)",
    what: "Find groups of nodes where every node can reach every other node.",
    why: "SCCs reveal fund recycling loops — money flows in circles.",
    stats: { sccCount: 4, largestSCC: 6 },
  },
  {
    step: 3,
    title: "Detect Bounded Cycle Motifs (3–5)",
    what: "Search for short directed cycles of length 3, 4, or 5.",
    why: "Short cycles are hallmark smurfing patterns — funds split and merge quickly.",
    stats: { "length-3": 8, "length-4": 3, "length-5": 1 },
  },
  {
    step: 4,
    title: "Detect Temporal Star Motifs",
    what: "Find fan-in (many→one) and fan-out (one→many) within 72h windows.",
    why: "Rapid aggregation or distribution suggests layering or structuring.",
    stats: { fanIn: 8, fanOut: 6, threshold: "10 in 72h" },
  },
  {
    step: 5,
    title: "Detect Degree-Constrained Path Motifs",
    what: "Identify layered shell chains with limited in/out degrees.",
    why: "Shell accounts typically have very few connections — just pass-through.",
    stats: { chains: 4, avgDepth: 3.2 },
  },
  {
    step: 6,
    title: "Compute Structural Metrics",
    what: "Calculate centrality, k-core decomposition, and degree distributions.",
    why: "Highlights structurally important nodes that may be orchestrators.",
    stats: { kCoreMax: 4, topCentrality: 0.87 },
  },
  {
    step: 7,
    title: "Score Nodes + Rings",
    what: "Aggregate motif contributions into a risk_score with full breakdown.",
    why: "Explainable scoring ensures investigators trust and understand results.",
    stats: { scored: 24, ringsScored: 5 },
  },
];

const Patterns = () => {
  const { hasAnalysis } = useAppStore();
  const nav = useNavigate();

  if (!hasAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-muted-foreground text-sm">Run an analysis to see pattern detection pipeline.</p>
        <Button variant="outline" onClick={() => nav("/upload")}>Upload CSV</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Pattern Detection Pipeline</h1>
        <p className="text-sm text-muted-foreground">Step-by-step graph analysis methodology</p>
      </div>

      {/* Pipeline Steps */}
      <div className="space-y-3">
        {steps.map((s) => (
          <Card key={s.step} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                {s.step}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{s.what}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle size={12} className="text-muted-foreground/50" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-60 text-xs">{s.why}</TooltipContent>
                  </Tooltip>
                  <span className="text-[10px] text-muted-foreground italic">Why it matters</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(s.stats).map(([k, v]) => (
                    <Badge key={k} variant="secondary" className="text-[10px] font-mono">
                      {k}: {v}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs shrink-0 gap-1 hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => nav("/graph", { state: { highlightPattern: s.title } })}
              >
                <Network size={12} /> Highlight
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pattern distribution chart */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Detected Patterns by Type</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={patternBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="type" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Patterns;
