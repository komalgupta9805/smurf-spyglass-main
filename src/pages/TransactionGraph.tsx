import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import GraphCanvas from "@/components/GraphCanvas";
import RiskBadge from "@/components/RiskBadge";
import { getRiskLevel } from "@/lib/types";
import { AlertTriangle, Search, Info, Network } from "lucide-react";
import { cn } from "@/lib/utils";

const layoutInfo: Record<string, { title: string; desc: string; bullets: string[]; diagram: React.ReactNode }> = {
  force: {
    title: "Force",
    desc: "Spreads nodes based on connection strength. Best for spotting natural clusters and highly connected hubs.",
    bullets: ["Natural clusters", "Hub identification", "High connectivity"],
    diagram: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-60 text-primary">
        <circle cx="20" cy="20" r="3" fill="currentColor" />
        <circle cx="10" cy="15" r="2" fill="currentColor" />
        <circle cx="30" cy="15" r="2" fill="currentColor" />
        <circle cx="15" cy="30" r="2" fill="currentColor" />
        <circle cx="25" cy="30" r="2" fill="currentColor" />
        <line x1="20" y1="20" x2="10" y2="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
        <line x1="20" y1="20" x2="30" y2="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
        <line x1="20" y1="20" x2="15" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
        <line x1="20" y1="20" x2="25" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
      </svg>
    )
  },
  hierarchical: {
    title: "Hierarchical",
    desc: "Arranges nodes in levels from sources → destinations. Best for tracing layered flows and chain-like movement.",
    bullets: ["Flow direction", "Chain detection", "Layered movement"],
    diagram: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-60 text-primary">
        <rect x="18" y="5" width="4" height="4" fill="currentColor" />
        <rect x="10" y="18" width="4" height="4" fill="currentColor" />
        <rect x="26" y="18" width="4" height="4" fill="currentColor" />
        <rect x="18" y="31" width="4" height="4" fill="currentColor" />
        <line x1="20" y1="10" x2="12" y2="18" stroke="currentColor" strokeWidth="1" />
        <line x1="20" y1="10" x2="28" y2="18" stroke="currentColor" strokeWidth="1" />
        <line x1="12" y1="22" x2="20" y2="31" stroke="currentColor" strokeWidth="1" />
        <line x1="28" y1="22" x2="20" y2="31" stroke="currentColor" strokeWidth="1" />
      </svg>
    )
  },
  circular: {
    title: "Circular",
    desc: "Places nodes around a circle to make cycles and mutual transfers obvious. Best for identifying ring-like behavior.",
    bullets: ["Cycle detection", "Mutual transfers", "Ring behavior"],
    diagram: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-60 text-primary">
        <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
        <circle cx="20" cy="8" r="2" fill="currentColor" />
        <circle cx="32" cy="20" r="2" fill="currentColor" />
        <circle cx="20" cy="32" r="2" fill="currentColor" />
        <circle cx="8" cy="20" r="2" fill="currentColor" />
      </svg>
    )
  },
  ring: {
    title: "Ring Cluster",
    desc: "Groups nodes by detected ring/community and shows intra-ring vs inter-ring links. Best for comparing rings and their members.",
    bullets: ["Community mapping", "Intra-ring analysis", "Member comparison"],
    diagram: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-60 text-primary">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
        <circle cx="28" cy="28" r="8" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
        <circle cx="12" cy="8" r="1.5" fill="currentColor" />
        <circle cx="16" cy="15" r="1.5" fill="currentColor" />
        <circle cx="24" cy="25" r="1.5" fill="currentColor" />
        <circle cx="30" cy="31" r="1.5" fill="currentColor" />
        <line x1="18" y1="18" x2="22" y2="22" stroke="currentColor" strokeWidth="1" />
      </svg>
    )
  },
};

const TransactionGraph = () => {
  const {
    hasAnalysis, accounts, edges, rings,
    selectedAccountId, selectedRingId,
    selectAccount, selectRing, openWhyPanel,
    ringFocusMode, setRingFocusMode
  } = useAppStore();
  const nav = useNavigate();

  const [layout, setLayout] = useState<string>("circular");
  const [edgeLabelMode, setEdgeLabelMode] = useState<"none" | "amount" | "count">("none");
  const [showLabels, setShowLabels] = useState(false);
  const [suspiciousOnly, setSuspiciousOnly] = useState(accounts.length > 100);
  const [minRisk, setMinRisk] = useState(0);
  const [search, setSearch] = useState("");

  // Storage for filters before entering Focus Mode
  const [prevFilters, setPrevFilters] = useState<{
    layout: string;
    minRisk: number;
    suspiciousOnly: boolean;
  } | null>(null);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const selectedRing = rings.find((r) => r.id === selectedRingId);

  // Sync Focus Mode Filters
  useEffect(() => {
    if (ringFocusMode && selectedRing && !prevFilters) {
      setPrevFilters({ layout, minRisk, suspiciousOnly });
      setLayout("circular");
      setMinRisk(0);
      setSuspiciousOnly(true);
    }
  }, [ringFocusMode, selectedRing, prevFilters]);

  // If a ring is selected but focus mode isn't active, we might want to suggest it 
  // or handle the case where the user manually selects a ring.
  // For now, let's keep it strictly controlled by the ringFocusMode state.

  const handleExitFocus = () => {
    if (prevFilters) {
      setLayout(prevFilters.layout);
      setMinRisk(prevFilters.minRisk);
      setSuspiciousOnly(prevFilters.suspiciousOnly);
    }
    setRingFocusMode(false);
    setPrevFilters(null);
    selectRing(null);
  };

  if (!hasAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <AlertTriangle size={32} className="text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Upload a CSV to explore the transaction graph.</p>
        <Button variant="outline" onClick={() => nav("/upload")}>Go to Upload</Button>
      </div>
    );
  }

  // Insight banner
  const topRing = rings.length > 0 ? rings.reduce((a, b) => (a.riskScore > b.riskScore ? a : b)) : null;

  return (
    <div className="space-y-4">
      {/* Ring Focus Banner */}
      {ringFocusMode && selectedRing ? (
        <Card className="p-3 border-primary/40 bg-primary/10 flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top duration-500 border-l-[4px] border-l-primary ring-1 ring-primary/5">
          <div className="flex items-center gap-6 px-1">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-1 rounded-md">
                <Network size={16} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Focused Network Analysis</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black">{selectedRing.id}</span>
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 py-0 bg-primary/5 border-primary/20 text-primary animate-pulse">LIVE FOCUS</Badge>
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-border/60" />

            <div className="flex gap-6 text-[11px]">
              <div><p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">Members</p><p className="font-bold">{selectedRing.members.length}</p></div>
              <div><p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">Risk Score</p><p className="font-bold text-risk-high">{selectedRing.riskScore}</p></div>
              <div><p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">Analytical Flow</p><p className="font-bold text-primary">₹{(selectedRing.totalFlow / 1e6).toFixed(1)}M</p></div>
              <div><p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">Detection Window</p><p className="font-bold">{selectedRing.timeWindow}</p></div>
            </div>
          </div>

          <Button
            size="sm"
            variant="default"
            className="h-8 text-[10px] gap-2 bg-destructive hover:bg-destructive/90 text-white shadow-sm px-4 font-bold border-none"
            onClick={handleExitFocus}
          >
            Exit Focus Mode
          </Button>
        </Card>
      ) : topRing && (
        <Card className="p-3 border-primary/20 bg-accent flex items-start gap-2">
          <Info size={16} className="text-primary mt-0.5 shrink-0" />
          <p className="text-xs">
            <span className="font-semibold">{topRing.id}</span> identified as a {topRing.cycleLength}-node structural indicator ({topRing.patternType}) within {topRing.timeWindow}, with cumulative analytical flow ₹{(topRing.totalFlow / 1e6).toFixed(1)}M.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Left Filter Panel */}
        <div className="col-span-12 md:col-span-3 space-y-4">
          <Card className="p-4 space-y-4">
            <div>
              <Label className="text-xs">Search Account</Label>
              <div className="relative mt-1">
                <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ACC-1000"
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Layout</Label>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="force">Force</SelectItem>
                  <SelectItem value="hierarchical">Hierarchical</SelectItem>
                  <SelectItem value="circular">Circular</SelectItem>
                  <SelectItem value="ring">Ring Cluster</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Edge Labels</Label>
              <Select value={edgeLabelMode} onValueChange={(v) => setEdgeLabelMode(v as any)}>
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="amount">Total Amount</SelectItem>
                  <SelectItem value="count">Tx Count</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Min Risk Score: {minRisk}</Label>
              <Slider value={[minRisk]} onValueChange={([v]) => setMinRisk(v)} min={0} max={100} step={5} className="mt-2" />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Suspicious Only</Label>
              <Switch checked={suspiciousOnly} onCheckedChange={setSuspiciousOnly} />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Labels</Label>
              <Switch checked={showLabels} onCheckedChange={setShowLabels} />
            </div>

            {/* Network selector */}
            <div>
              <Label className="text-xs">Focus Network</Label>
              <Select value={selectedRingId ?? "all"} onValueChange={(v) => selectRing(v === "all" ? null : v)}>
                <SelectTrigger className="h-8 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {rings.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.id} ({r.riskScore})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Legend */}
            <Card className="p-3 bg-muted/50">
              <p className="text-[10px] font-semibold mb-1.5">Legend</p>
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-risk-high" /> High risk (≥70)</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-risk-medium" /> Medium (40–69)</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-risk-low" /> Low (&lt;40)</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-muted-foreground" /> Transaction flow →</div>
              </div>
            </Card>
          </Card>
        </div>

        {/* Center Graph */}
        <div className="col-span-12 md:col-span-6">
          <Card className="p-2 overflow-hidden shadow-md relative group">
            <GraphCanvas
              accounts={search ? accounts.filter((a) => a.id.toLowerCase().includes(search.toLowerCase())) : accounts}
              edges={edges}
              selectedAccountId={selectedAccountId}
              selectedRingId={selectedRingId}
              onSelectAccount={selectAccount}
              layout={layout}
              showLabels={showLabels}
              edgeLabelMode={edgeLabelMode}
              suspiciousOnly={suspiciousOnly}
              minRisk={minRisk}
              aggregateEdges={true}
              ringFocusMode={ringFocusMode}
            />

            {/* Floating Ring Summary Card */}
            {ringFocusMode && selectedRing && (
              <div className="absolute bottom-4 left-4 z-10 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700">
                <Card className="p-3 w-56 shadow-2xl border-primary/30 bg-card/95 backdrop-blur-sm space-y-2.5">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-tight text-primary">Ring Summary</p>
                    <Network size={12} className="text-primary" />
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between font-medium">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{selectedRing.patternType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Members:</span>
                      <span>{selectedRing.members.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Primary Sender:</span>
                      <span className="font-mono text-[10px]">{selectedRing.members[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Primary Receiver:</span>
                      <span className="font-mono text-[10px]">{selectedRing.members[selectedRing.members.length - 1]}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5 mt-1.5 font-bold">
                      <span className="text-muted-foreground">Analytical Flow:</span>
                      <span className="text-primary">₹{(selectedRing.totalFlow / 1e6).toFixed(1)}M</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </Card>
        </div>

        {/* Right Detail Panel */}
        <div className="col-span-12 md:col-span-3 space-y-4">
          {selectedAccount ? (
            <Card className="p-4 space-y-4">
              <div className="pb-3 border-b">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-1">Target Account</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-lg font-bold">{selectedAccount.id}</p>
                  <RiskBadge level={getRiskLevel(selectedAccount.riskScore)} score={selectedAccount.riskScore} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Detected Patterns</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAccount.patterns.length > 0 ? (
                      selectedAccount.patterns.map((p) => (
                        <Badge key={p} variant="secondary" className="text-[10px] capitalize bg-primary/10 text-primary border-none">
                          {p.replace("-", " ")}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No patterns identified</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-muted/40 rounded-md border">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Structural Role</p>
                    <p className="font-bold mt-0.5 truncate">
                      {selectedAccount.inDegree > selectedAccount.outDegree ? "Concentration" : selectedAccount.outDegree > selectedAccount.inDegree ? "Distribution" : "Intermediary"}
                    </p>
                  </div>
                  <div className="p-2 bg-muted/40 rounded-md border">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Network ID</p>
                    <p className="font-mono font-bold mt-0.5">{selectedAccount.ringId || "None"}</p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-xs h-9" onClick={() => openWhyPanel(selectedAccount.id)}>
                    <Info size={14} /> Why was this flagged?
                  </Button>
                  {selectedAccount.ringId && (
                    <Button variant="outline" className="w-full text-xs h-9" onClick={() => selectRing(selectedAccount.ringId)}>
                      Focus Network Members
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ) : selectedRing ? (
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm font-semibold">{selectedRing.id}</p>
                <RiskBadge level={getRiskLevel(selectedRing.riskScore)} score={selectedRing.riskScore} />
              </div>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between"><span className="text-muted-foreground">Confidence</span><span>{selectedRing.confidence}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pattern</span><Badge variant="secondary" className="text-[10px]">{selectedRing.patternType}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cycle Length</span><span>{selectedRing.cycleLength}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg Tx Size</span><span>₹{(selectedRing.avgTxSize / 1000).toFixed(0)}K</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Flow</span><span>₹{(selectedRing.totalFlow / 1e6).toFixed(1)}M</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time Window</span><span>{selectedRing.timeWindow}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Members</span><span>{selectedRing.members.length}</span></div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Members</p>
                <div className="flex flex-wrap gap-1">
                  {selectedRing.members.map((m) => (
                    <Badge key={m} variant="outline" className="text-[10px] font-mono cursor-pointer" onClick={() => selectAccount(m)}>{m}</Badge>
                  ))}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => selectRing(null)}>Clear Ring Filter</Button>
            </Card>
          ) : (
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Click a node or select a ring to view details</p>
            </Card>
          )}

          {/* Dynamic Layout Info Card */}
          <Card key={layout} className="p-4 space-y-3 animate-in fade-in slide-in-from-right-4 duration-300 border-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Layout: {layoutInfo[layout].title}</h3>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-primary hover:text-primary hover:bg-primary/10">Learn more</Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 shadow-xl border-primary/20">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <p className="text-[10px] font-bold uppercase">{layoutInfo[layout].title} Visual</p>
                      <Info size={12} className="text-primary" />
                    </div>
                    <div className="flex justify-center py-2 bg-muted/30 rounded">
                      {layoutInfo[layout].diagram}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {layoutInfo[layout].desc}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground italic">
              {layoutInfo[layout].desc}
            </p>

            <div className="pt-2 border-t">
              <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1.5 tracking-tight">When to use:</p>
              <ul className="space-y-1">
                {layoutInfo[layout].bullets.map((b) => (
                  <li key={b} className="text-[10px] flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary/40" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TransactionGraph;
