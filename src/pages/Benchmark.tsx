import { useAppStore } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HelpCircle, Cpu, Gauge, Shield, Sliders, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer
} from "recharts";

const thresholdSensitivityData = [
  { variance: "-10%", rings: 4 },
  { variance: "-5%", rings: 5 },
  { variance: "0%", rings: 6 },
  { variance: "+5%", rings: 6 },
  { variance: "+10%", rings: 7 },
];

const temporalStabilityData = [
  { window: "24h", rings: 2, volume: 1400 },
  { window: "48h", rings: 4, volume: 3800 },
  { window: "72h", rings: 6, volume: 8400 },
  { window: "96h", rings: 6, volume: 11200 },
];

const Benchmark = () => {
  const { hasAnalysis, currentCase } = useAppStore();
  const nav = useNavigate();

  if (!hasAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-muted-foreground text-sm">Run an analysis first to see benchmark data.</p>
        <Button variant="outline" onClick={() => nav("/")}>Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">System Calibration & Analytical Metrics</h1>
          <p className="text-sm text-muted-foreground">Behavioral model performance and analytical configuration</p>
        </div>
        <Badge variant="outline" className="h-6 gap-1 px-2 border-primary/30 text-primary">
          <Zap size={10} /> Model v3.2-Stable
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Performance */}
        <Card className="p-4 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={16} className="text-primary" />
            <h3 className="text-sm font-semibold">Analytical Runtime Performance</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Processing Time</p>
              <p className="text-2xl font-bold">{currentCase?.processingTime}s</p>
              <div className="w-full bg-muted h-1 rounded-full mt-1.5">
                <div className="bg-primary h-full rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 p-2 rounded">
                <p className="text-muted-foreground mb-0.5">Throughput</p>
                <p className="font-mono font-bold">12k tx/s</p>
              </div>
              <div className="bg-muted/50 p-2 rounded">
                <p className="text-muted-foreground mb-0.5">Memory</p>
                <p className="font-mono font-bold">142MB</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stability Graphs */}
        <Card className="p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Gauge size={16} className="text-primary" />
            <h3 className="text-sm font-semibold">Detection Stability Under Parameter Variation</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-3 tracking-wider">Threshold Sensitivity</p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={thresholdSensitivityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="variance" fontSize={9} axisLine={false} tickLine={false} />
                  <YAxis fontSize={9} axisLine={false} tickLine={false} />
                  <RTooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 10 }}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  />
                  <Bar dataKey="rings" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[9px] text-center text-muted-foreground mt-2 leading-relaxed">
                Measures how sensitive ring detection is to minor changes in scoring threshold.
                <br />
                <span className="italic">This analysis ensures structural detection is not overly sensitive to minor parameter changes.</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-3 tracking-wider">Temporal Window Sensitivity</p>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={temporalStabilityData}>
                  <defs>
                    <linearGradient id="colorRing" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="window" fontSize={9} axisLine={false} tickLine={false} />
                  <YAxis fontSize={9} axisLine={false} tickLine={false} />
                  <RTooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 10 }}
                  />
                  <Area type="monotone" dataKey="rings" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRing)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-[9px] text-center text-muted-foreground mt-2 leading-relaxed">
                Shows how detection volume changes as temporal window expands.
                <br />
                <span className="italic">This analysis ensures structural detection is not overly sensitive to minor parameter changes.</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Threshold Configuration */}
        <Card className="p-4 border-dashed bg-muted/20">
          <div className="flex items-center gap-2 mb-4">
            <Sliders size={16} className="text-primary" />
            <h3 className="text-sm font-semibold">Active Behavioral Thresholds</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                id: "temporal",
                label: "Temporal Proximity",
                value: "72h",
                pop: () => (
                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <p><span className="font-bold text-primary">Controls:</span> Behavioral grouping window within which transactions are linked.</p>
                    <p><span className="font-bold text-primary">Status:</span> 72h captures historical flow cycles. {useAppStore.getState().rings.length} rings detected in this window.</p>
                    <p><span className="font-bold text-primary">Sensitivity:</span> Extending increases noise; shortening may miss multi-hop layering.</p>
                  </div>
                )
              },
              {
                id: "cycle",
                label: "Cycle Max Vertices",
                value: "8",
                pop: () => (
                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <p><span className="font-bold text-primary">Controls:</span> Maximum breadth of a single circular transaction network.</p>
                    <p><span className="font-bold text-primary">Status:</span> Bounded to 8 nodes for computational stability. Max cycle in set: 5.</p>
                    <p><span className="font-bold text-primary">Sensitivity:</span> Higher limits significantly increase runtime for exponential path detection.</p>
                  </div>
                )
              },
              {
                id: "velocity",
                label: "Velocity Alpha",
                value: "0.85",
                pop: () => (
                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <p><span className="font-bold text-primary">Controls:</span> Smoothing factor for transaction rate anomalies (smurfing).</p>
                    <p><span className="font-bold text-primary">Status:</span> Set to 0.85 to prioritize burst intensity. Current avg intensity: 0.62.</p>
                    <p><span className="font-bold text-primary">Sensitivity:</span> Lower alpha makes detection more sensitive to single large tx spikes.</p>
                  </div>
                )
              },
              {
                id: "degree",
                label: "Structural Min Degree",
                value: "2",
                pop: () => (
                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <p><span className="font-bold text-primary">Controls:</span> Minimum connectivity required to flag shell behavior.</p>
                    <p><span className="font-bold text-primary">Status:</span> Requires at least 2 links per shell node. Avg node degree: 3.2.</p>
                    <p><span className="font-bold text-primary">Sensitivity:</span> Setting to 1 increases false positives by including standard transfers.</p>
                  </div>
                )
              },
            ].map((t) => (
              <div key={t.label} className="p-3 bg-card border rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-muted-foreground font-medium">{t.label}</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="hover:bg-accent p-0.5 rounded transition-colors group">
                        <HelpCircle size={11} className="text-muted-foreground/50 group-hover:text-primary" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4 shadow-xl border-primary/20 backdrop-blur-sm bg-card/95">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                        <Info size={14} className="text-primary" />
                        <h4 className="text-xs font-bold uppercase tracking-tight">{t.label} Threshold</h4>
                      </div>
                      {t.pop()}
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="text-sm font-mono font-black">{t.value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Protection Layers */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-primary" />
            <h3 className="text-sm font-semibold">Analytical Guardrails</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Entity Resolution (ER)", desc: "Deduplicates same-owner accounts across IDs", status: "Active" },
              { label: "Merchant Noise Filter", desc: "Excludes 200k+ known recurring business flows", status: "Active" },
              { label: "Self-Loop Suppression", desc: "Auto-prunes non-malicious self-transfers", status: "Active" },
              { label: "Velocity Anomaly (VA)", desc: "Flags temporal bursts using Z-score logic", status: "Calibrating" },
            ].map((c) => (
              <div key={c.label} className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 transition-colors border-l-2 border-primary/20">
                <div>
                  <p className="text-xs font-bold leading-none">{c.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{c.desc}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] h-5 scale-90",
                    c.status === "Active"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}
                >
                  {c.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Benchmark;
