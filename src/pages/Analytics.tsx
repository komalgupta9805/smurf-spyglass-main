import { useAppStore } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/StatsCard";
import RiskBadge from "@/components/RiskBadge";
import HeatmapChart from "@/components/HeatmapChart";
import FanInOutGraph from "@/components/FanInOutGraph";
import { getRiskLevel } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  ScatterChart, Scatter, LineChart, Line, Cell,
  Tooltip as RTooltip,
} from "recharts";
import {
  Users, ArrowRightLeft, AlertTriangle, Network, Clock, HelpCircle,
  ExternalLink, TrendingUp, Zap, Layers, Target, Info, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { useState, useMemo } from "react";

const riskColor = (l: string) =>
  l === "high" ? "hsl(var(--risk-high))" : l === "medium" ? "hsl(var(--risk-medium))" : "hsl(var(--risk-low))";

// Helper to generate dynamic histogram from accounts
const generateHistogram = (accounts: any[]) => {
  const bins = [
    { range: "0-20", count: 0, pct: 0 },
    { range: "21-40", count: 0, pct: 0 },
    { range: "41-60", count: 0, pct: 0 },
    { range: "61-80", count: 0, pct: 0 },
    { range: "81-100", count: 0, pct: 0 },
  ];

  accounts.forEach(a => {
    const score = a.riskScore;
    if (score <= 20) bins[0].count++;
    else if (score <= 40) bins[1].count++;
    else if (score <= 60) bins[2].count++;
    else if (score <= 80) bins[3].count++;
    else bins[4].count++;
  });

  const total = accounts.length || 1;
  return bins.map(b => ({ ...b, pct: Math.round((b.count / total) * 100) }));
};

const PatternVisual = ({ type }: { type: string }) => {
  switch (type) {
    case "cycle":
      return (
        <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto animate-spin-slow">
          <circle cx="50" cy="50" r="30" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="10 5" />
          <circle cx="50" cy="20" r="4" fill="hsl(var(--primary))" />
          <circle cx="80" cy="50" r="4" fill="hsl(var(--primary))" />
          <circle cx="50" cy="80" r="4" fill="hsl(var(--primary))" />
          <circle cx="20" cy="50" r="4" fill="hsl(var(--primary))" />
        </svg>
      );
    case "fan-out":
      return (
        <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto">
          <circle cx="30" cy="50" r="5" fill="hsl(var(--primary))" />
          <path d="M35 50 L70 20 M35 50 L70 50 M35 50 L70 80" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" className="animate-pulse" />
          <circle cx="75" cy="20" r="3" fill="hsl(var(--muted-foreground))" />
          <circle cx="75" cy="50" r="3" fill="hsl(var(--muted-foreground))" />
          <circle cx="75" cy="80" r="3" fill="hsl(var(--muted-foreground))" />
        </svg>
      );
    case "fan-in":
      return (
        <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto">
          <circle cx="70" cy="50" r="5" fill="hsl(var(--primary))" />
          <path d="M30 20 L65 50 M30 50 L65 50 M30 80 L65 50" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" className="animate-pulse" />
          <circle cx="25" cy="20" r="3" fill="hsl(var(--muted-foreground))" />
          <circle cx="25" cy="50" r="3" fill="hsl(var(--muted-foreground))" />
          <circle cx="25" cy="80" r="3" fill="hsl(var(--muted-foreground))" />
        </svg>
      );
    case "layering":
      return (
        <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto">
          <path d="M20 50 L40 50 M45 50 L65 50 M70 50 L90 50" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" strokeDasharray="4 2" />
          <circle cx="20" cy="50" r="4" fill="hsl(var(--muted-foreground))" />
          <circle cx="45" cy="50" r="4" fill="hsl(var(--primary))" />
          <circle cx="70" cy="50" r="4" fill="hsl(var(--primary))" />
          <circle cx="95" cy="50" r="4" fill="hsl(var(--muted-foreground))" />
        </svg>
      );
    default:
      return <Zap size={40} className="text-primary/40 mx-auto" />;
  }
};

const patternDetails: Record<string, { title: string, explanation: string, impact: string }> = {
  "cycle": {
    title: "Cycle Motif",
    explanation: "Funds circulate in a closed loop between accounts.",
    impact: "Increases risk due to coordinated fund recycling."
  },
  "fan-out": {
    title: "Rapid Dispersion",
    explanation: "One account distributes funds rapidly to multiple recipients.",
    impact: "Suggests structured smurfing or burst dispersion behavior."
  },
  "fan-in": {
    title: "Concentration",
    explanation: "Multiple accounts funneling funds into a single central node.",
    impact: "Indicative of aggregation for cashing out or layering."
  },
  "layering": {
    title: "Linear Layering",
    explanation: "Complex chain of rapid sequential transfers between entities.",
    impact: "Classic technique to distance funds from the original source."
  },
  "shell-chain": {
    title: "Shell Chain",
    explanation: "Transfers through multiple high-risk intermediary nodes.",
    impact: "Used to obscure movement through anonymous shell entities."
  }
};

const PatternBadge = ({ pattern }: { pattern: string }) => {
  const details = patternDetails[pattern] || { title: pattern, explanation: "Behavioral indicator", impact: "Contributes to overall risk score." };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant="secondary"
          className="text-[9px] cursor-pointer transition-all border-none bg-primary/10 text-primary hover:bg-primary/20"
        >
          {pattern.replace("-", " ")}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 space-y-3 shadow-xl">
        <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-center border">
          <PatternVisual type={pattern} />
        </div>
        <div className="space-y-1.5">
          <p className="font-bold text-xs uppercase tracking-tight">{details.title}</p>
          <p className="text-[11px] text-muted-foreground leading-snug">{details.explanation}</p>
          <p className="text-[11px] text-primary font-medium italic border-t pt-1.5 mt-1.5">{details.impact}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Analytics = () => {
  const { hasAnalysis, currentCase, accounts, edges, rings, openWhyPanel, selectRing, setRingFocusMode } = useAppStore();
  const nav = useNavigate();
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const realHistogram = useMemo(() => generateHistogram(accounts), [accounts]);
  const scatterData = useMemo(() => accounts.map(a => ({
    id: a.id,
    riskScore: a.riskScore,
    confidence: Math.round(a.confidence * 100),
    level: getRiskLevel(a.riskScore),
    ringId: a.ringId,
    pattern: a.patterns[0]
  })), [accounts]);

  if (!hasAnalysis || !currentCase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-muted-foreground text-sm">No analysis available. Run an analysis from the home page.</p>
        <Button variant="outline" onClick={() => nav("/")}>Go to Home</Button>
      </div>
    );
  }

  const suspicious = accounts.filter((a) => a.riskScore >= 60).sort((a, b) => b.riskScore - a.riskScore);
  const topRings = [...rings].sort((a, b) => b.riskScore - a.riskScore);
  const maxDeg = accounts.length > 0
    ? accounts.reduce((m, a) => (a.inDegree > m.inDegree ? a : m), accounts[0])
    : { id: "N/A", inDegree: 0 };
  const maxOut = accounts.length > 0
    ? accounts.reduce((m, a) => (a.outDegree > m.outDegree ? a : m), accounts[0])
    : { id: "N/A", outDegree: 0 };
  const topCentral = [...accounts].sort((a, b) => b.centralityScore - a.centralityScore).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Analytical Insights</h1>
          <p className="text-sm text-muted-foreground">Examine relationship indicators and structural behavioral flags</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="px-3 py-1.5 flex items-center gap-4 text-xs font-medium cursor-help hover:bg-accent/50 transition-colors">
              <div><span className="text-muted-foreground mr-1">Analytical Case</span> <span className="font-mono font-black">{currentCase.id}</span></div>
              <div className="flex items-center gap-1">
                <RiskBadge level={currentCase.riskLevel} score={currentCase.riskExposure} size="sm" />
              </div>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="text-[11px]">
            Risk exposure index based on detected behavioral indicators.
          </TooltipContent>
        </Tooltip>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="general" className="text-xs px-4">General Analytics</TabsTrigger>
          <TabsTrigger value="structural" className="text-xs px-4">Structural Motifs</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-0">
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Tooltip>
              <TooltipTrigger asChild><div><StatsCard label="Total Entities" value={currentCase.nodeCount} icon={Users} /></div></TooltipTrigger>
              <TooltipContent className="text-[11px]">Total count of distinct entities found in the transaction dataset.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild><div><StatsCard label="Transactions" value={currentCase.txCount.toLocaleString()} icon={ArrowRightLeft} /></div></TooltipTrigger>
              <TooltipContent className="text-[11px]">Number of individual payment records analyzed by the engine.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild><div><StatsCard label="Requires Review" value={currentCase.suspiciousCount} icon={AlertTriangle} /></div></TooltipTrigger>
              <TooltipContent className="text-[11px]">Accounts flagged for manual review based on elevated risk scores.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild><div><StatsCard label="Networks Flagged" value={currentCase.ringCount} icon={Network} /></div></TooltipTrigger>
              <TooltipContent className="text-[11px]">Number of distinct suspicious behavioral structures identified.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild><div><StatsCard label="Analysis Runtime" value={`${currentCase.processingTime}s`} icon={Clock} /></div></TooltipTrigger>
              <TooltipContent className="text-[11px]">Total time taken by the engine to process and score the dataset.</TooltipContent>
            </Tooltip>
          </div>

          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" /> Risk Distribution Histogram
                </h3>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={realHistogram} barGap={0} barCategoryGap={1}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="range"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <RTooltip
                      cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(v: number, _: string, entry: any) => [
                        <div className="flex flex-col gap-1">
                          <span className="font-bold">{v} Entities</span>
                          <span className="text-muted-foreground">{entry.payload.pct}% of total dataset</span>
                        </div>,
                        null
                      ]}
                    />
                    <Bar dataKey="count">
                      {realHistogram.map((d, i) => (
                        <Cell
                          key={i}
                          fill={i >= 3 ? "hsl(var(--risk-high))" : i >= 2 ? "hsl(var(--risk-medium))" : "hsl(var(--primary))"}
                          fillOpacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Confidence vs Risk</h3>
              <ResponsiveContainer width="100%" height={200}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="confidence" name="Confidence" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="riskScore" name="Risk" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <RTooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <Card className="p-3 shadow-xl border-primary/20 min-w-[180px] bg-card/95 backdrop-blur-sm">
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between items-center border-b pb-1.5 mb-1.5">
                                <span className="font-mono font-bold text-primary">{data.id}</span>
                                <Badge variant="outline" className="text-[10px] h-4 scale-90 uppercase">
                                  {data.level}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Risk Score</span>
                                <span className="font-bold">{data.riskScore}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Confidence</span>
                                <span className="font-bold">{data.confidence}%</span>
                              </div>
                              <div className="flex justify-between border-t pt-1.5 mt-1.5 font-mono">
                                <span className="text-muted-foreground italic">Ring</span>
                                <span>{data.ringId || "—"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground italic">Pattern</span>
                                <span className="text-primary font-medium capitalize">{data.pattern || data.level}</span>
                              </div>
                            </div>
                          </Card>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={scatterData}>
                    {scatterData.map((d, i) => (
                      <Cell key={i} fill={riskColor(d.level)} opacity={0.7} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Activity Indicator</h3>
              <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded border border-dashed text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                Real-time Heatmap Stream
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Linkage Volume</h3>
              <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded border border-dashed text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                Network Propagation Trend
              </div>
            </Card>
          </div>

          {/* Result Tables */}
          <div className="space-y-6">
            {/* 1. Fraud Ring Summary table (top) */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Network size={16} className="text-primary" /> Suspicious Networks Summary
                </h2>
                <Badge variant="outline" className="text-[10px] uppercase font-bold">Top Priority</Badge>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="text-[10px] uppercase h-8">Network ID</TableHead>
                      <TableHead className="text-[10px] uppercase h-8 text-center">Members</TableHead>
                      <TableHead className="text-[10px] uppercase h-8">Patterns</TableHead>
                      <TableHead className="text-[10px] uppercase h-8">Risk Level</TableHead>
                      <TableHead className="text-[10px] uppercase h-8">Time Span</TableHead>
                      <TableHead className="text-[10px] uppercase h-8 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topRings.map((ring) => (
                      <TableRow key={ring.id} className="h-12 group">
                        <TableCell className="font-mono text-xs font-bold py-2">{ring.id}</TableCell>
                        <TableCell className="text-center py-2">
                          <Badge variant="secondary" className="text-[10px]">{ring.members.length}</Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <PatternBadge pattern={ring.patternType} />
                        </TableCell>
                        <TableCell className="py-2">
                          <RiskBadge level={getRiskLevel(ring.riskScore)} score={ring.riskScore} size="sm" />
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground py-2 font-medium">
                          {ring.timeWindow}
                        </TableCell>
                        <TableCell className="text-right py-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] gap-1 px-3 border-primary/30 hover:bg-primary/5 transition-colors"
                            onClick={() => {
                              selectRing(ring.id);
                              setRingFocusMode(true);
                              nav("/graph");
                            }}
                          >
                            View Ring in Graph <ArrowRight size={10} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Card className="p-4 h-full">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Target size={14} className="text-primary" /> Structural Risk Anchors
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {[
                      { label: "Coordination Index", value: "Elevated" },
                      { label: "Role Balance", value: "Significant" },
                      { label: "Primary Receiver", value: maxDeg.id },
                      { label: "Primary Sender", value: maxOut.id },
                    ].map((m) => (
                      <div key={m.label} className="p-2 bg-muted/30 rounded border border-border/50">
                        <p className="text-muted-foreground text-[9px] uppercase font-bold">{m.label}</p>
                        <p className="font-bold text-sm mt-0.5">{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Central entities for priority review</p>
                    <div className="flex flex-wrap gap-1.5">
                      {topCentral.map((a) => (
                        <Badge key={a.id} variant="outline" className="text-[10px] font-mono cursor-pointer hover:bg-primary/10" onClick={() => openWhyPanel(a.id)}>
                          {a.id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-4 flex flex-col justify-center border-primary/20 bg-primary/5">
                <div className="text-center space-y-2">
                  <AlertTriangle className="mx-auto text-primary" size={24} />
                  <h3 className="text-sm font-bold">Investigation Recommended</h3>
                  <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
                    The structural flags identified above suggest non-standard movement of funds that requires manual compliance evaluation.
                  </p>
                  <Button size="sm" className="mt-2 text-xs h-8" variant="outline" onClick={() => nav("/report")}>
                    Generate Risk Assessment <ExternalLink size={10} className="ml-1" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Risk Distribution Table</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase h-8">Account</TableHead>
                    <TableHead className="text-[10px] uppercase h-8">Risk Score</TableHead>
                    <TableHead className="text-[10px] uppercase h-8">Network Membership</TableHead>
                    <TableHead className="text-[10px] uppercase h-8">Structural In/Out</TableHead>
                    <TableHead className="text-[10px] uppercase h-8">Behavioral Motif</TableHead>
                    <TableHead className="text-[10px] uppercase h-8 text-right">Rationale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspicious.slice(0, 10).map((a) => (
                    <TableRow key={a.id} className="h-10 group">
                      <TableCell className="font-mono text-xs font-medium py-1">{a.id}</TableCell>
                      <TableCell className="py-1"><RiskBadge level={getRiskLevel(a.riskScore)} score={a.riskScore} /></TableCell>
                      <TableCell className="py-1">
                        {a.ringId ? (
                          <Badge variant="outline" className="font-mono text-[10px] bg-accent/30">{a.ringId}</Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Independent</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[10px] py-1 font-medium">{a.inDegree} In / {a.outDegree} Out</TableCell>
                      <TableCell className="py-1">
                        <PatternBadge pattern={a.patterns[0] || "normal"} />
                      </TableCell>
                      <TableCell className="text-right py-1">
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] gap-1 opacity-100 md:opacity-0 group-hover:opacity-100" onClick={() => openWhyPanel(a.id)}>
                          Why? <Info size={10} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button variant="ghost" className="w-full mt-2 h-8 text-[10px] text-muted-foreground uppercase font-bold" onClick={() => nav("/entities")}>
              View All Entities <ArrowRight size={12} className="ml-1" />
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="structural" className="mt-0">
          {currentCase.nodeCount > 2000 ? (
            <Card className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Network className="text-primary" size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Complex Network Detected</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                  This dataset contains {currentCase.nodeCount} nodes. Rendering a full structural motif graph here may impact performance.
                  Summarized metrics are available in General Analytics.
                </p>
              </div>
              <Button onClick={() => nav("/graph")} className="gap-2">
                Open in Full Transaction Graph <ArrowRight size={16} />
              </Button>
            </Card>
          ) : (
            <FanInOutGraph accounts={accounts} edges={edges} />
          )}
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedPattern} onOpenChange={(open) => !open && setSelectedPattern(null)}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Target className="text-primary" /> {selectedPattern && patternDetails[selectedPattern]?.title}
            </SheetTitle>
            <SheetDescription>
              Pattern Insight & Behavioral Analysis
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-8">
            <div className="bg-muted/30 rounded-xl p-8 border border-muted flex items-center justify-center">
              {selectedPattern && <PatternVisual type={selectedPattern} />}
            </div>

            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Pattern Explanation</h3>
              <p className="text-sm leading-relaxed">
                {selectedPattern && patternDetails[selectedPattern]?.explanation}
              </p>
            </section>

            <section className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Zap size={14} /> Risk Impact Score
              </h3>
              <p className="text-2xl font-black text-primary">
                {selectedPattern && patternDetails[selectedPattern]?.impact}
              </p>
              <p className="text-[10px] text-muted-foreground italic">
                Calculated based on current engine weighting and analytical thresholds.
              </p>
            </section>

            <div className="pt-6 border-t">
              <Button className="w-full gap-2" variant="outline" onClick={() => nav("/graph")}>
                Detect in Transaction Graph <ExternalLink size={14} />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Analytics;
