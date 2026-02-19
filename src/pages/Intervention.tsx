import { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Shield, AlertTriangle, Users, Network, ArrowRight, Zap,
    Search, Trash2, Play, CheckCircle2, RotateCcw, TrendingDown,
    Info, Lock, Ban, Ban as Blacklist, Receipt, Filter, BarChart3,
    ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import RiskBadge from "@/components/RiskBadge";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
    BarChart, Bar, Cell, Label
} from "recharts";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const RecommendationItem = ({ action, onApply, onPreview, onExplain }: any) => (
    <Card className="p-4 hover:border-primary/50 transition-colors group">
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                    action.type === "freeze" ? "bg-blue-100 text-blue-600" :
                        action.type === "blacklist" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                )}>
                    {action.type === "freeze" ? <Lock size={14} /> :
                        action.type === "blacklist" ? <Blacklist size={14} /> : <Receipt size={14} />}
                </div>
                <div>
                    <p className="text-xs font-bold font-mono">{action.targetId}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{action.type} Account</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-red-500">-{action.impactScore} risk</p>
                <p className="text-[10px] text-muted-foreground">{action.ringsAffected} rings hit</p>
            </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
            {action.reasons.map((r: string) => (
                <Badge key={r} variant="secondary" className="text-[9px] px-1.5 h-4 font-normal text-muted-foreground bg-accent/50 border-none">
                    {r}
                </Badge>
            ))}
        </div>
        <div className="flex flex-wrap grid grid-cols-2 gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={onPreview}>
                <Play size={10} /> Preview
            </Button>
            <Button size="sm" className="h-7 text-[10px] gap-1" onClick={onApply}>
                Apply
            </Button>
        </div>
    </Card>
);

const DeltaBadge = ({ before, after, suffix = "", inverse = false }: { before: number, after: number, suffix?: string, inverse?: boolean }) => {
    const delta = after - before;
    const isPositive = delta > 0;
    const isZero = delta === 0;

    // inverse means reduction is good (risk, suspicious count)
    const isGood = inverse ? delta < 0 : delta > 0;

    if (isZero) return <span className="text-[9px] text-muted-foreground ml-1">no change</span>;

    return (
        <Badge variant="outline" className={cn(
            "text-[9px] h-4 px-1 ml-1 border-none",
            isGood ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
        )}>
            {isPositive ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
            {Math.abs(delta).toLocaleString()}{suffix}
        </Badge>
    );
};

const Intervention = () => {
    const {
        hasAnalysis, currentCase, accounts, interventionScenario, addIntervention,
        removeIntervention, previewIntervention, applyIntervention, resetIntervention,
        mitigationSummary
    } = useAppStore();

    const nav = useNavigate();
    const [searchId, setSearchId] = useState("");
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [selectedBulkRing, setSelectedBulkRing] = useState<string | null>(null);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const ringMembers = useMemo(() => {
        if (!selectedBulkRing) return [];
        // Extract members for selected ring (mock logic)
        return accounts.slice(0, 5).map(a => a.id);
    }, [selectedBulkRing, accounts]);

    const handleBulkApply = () => {
        selectedMembers.forEach(id => {
            addIntervention({
                type: "freeze",
                targetId: id,
                targetType: "node",
                reason: `Bulk ring action (${selectedBulkRing})`
            });
        });
        setIsBulkModalOpen(false);
        setSelectedMembers([]);
        previewIntervention();
    };

    const recommendations = useMemo(() => [
        { type: "freeze", targetId: "ACC-1023", impactScore: 12, ringsAffected: 2, reasons: ["High coordination detected", "Unusual velocity"], confidence: 94 },
        { type: "blacklist", targetId: "ACC-0987", impactScore: 18, ringsAffected: 3, reasons: ["Multiple structural patterns observed", "Anchor node indicator"], confidence: 88 },
        { type: "fee", targetId: "ACC-1142", value: 150, impactScore: 5, ringsAffected: 1, reasons: ["Cross-border behavioral flag"], confidence: 91 },
        { type: "freeze", targetId: "ACC-1045", impactScore: 9, ringsAffected: 2, reasons: ["Tightly connected network structure"], confidence: 85 },
    ], []);

    if (!hasAnalysis || !currentCase) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center">
                    <Zap size={32} className="text-muted-foreground" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Simulator Inactive</h2>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
                        Execute a behavioral assessment on the Home page to enable risk mitigation simulations.
                    </p>
                </div>
                <Button onClick={() => nav("/")}>Return to Home</Button>
            </div>
        );
    }

    const handleAddIntervention = (type: "freeze" | "blacklist" | "fee", id: string) => {
        addIntervention({
            type,
            targetId: id,
            targetType: "node",
            reason: "manual selection"
        });
        setSearchId("");
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <Info size={14} className="text-primary shrink-0" />
                <p className="text-[11px] font-medium text-primary/80">
                    <span className="font-bold">Simulator Environment:</span> All actions on this page are non-binding structural simulations. No real accounts are frozen or blocked.
                </p>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Intervention Simulator</h1>
                    <p className="text-sm text-muted-foreground">What-If / Mitigation Simulator for AML risk management</p>
                </div>
                <div className="flex items-center gap-2">
                    {interventionScenario.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={resetIntervention} className="text-xs h-8 text-red-500">
                            <RotateCcw size={12} className="mr-1" /> Reset Scenario
                        </Button>
                    )}
                    <Button onClick={previewIntervention} disabled={interventionScenario.length === 0} className="gap-2 h-9">
                        <Play size={14} /> Preview Impact
                    </Button>
                    <Button onClick={applyIntervention} disabled={!mitigationSummary} variant="secondary" className="gap-2 h-9 bg-primary text-primary-foreground hover:bg-primary/90">
                        <CheckCircle2 size={14} /> Commit Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: "Risk Exposure", before: mitigationSummary?.before.riskScore ?? currentCase.riskExposure, after: mitigationSummary?.after.riskScore, icon: Shield, inverse: true },
                    { label: "Suspicious", before: mitigationSummary?.before.suspiciousCount ?? currentCase.suspiciousCount, after: mitigationSummary?.after.suspiciousCount, icon: AlertTriangle, inverse: true },
                    { label: "Networks Flagged", before: mitigationSummary?.before.ringCount ?? currentCase.ringCount, after: mitigationSummary?.after.ringCount, icon: Network, inverse: true },
                    { label: "Estimated Flow", before: mitigationSummary?.before.flow ?? 12450000, after: mitigationSummary?.after.flow, icon: TrendingDown, inverse: true, suffix: "₹", fmt: (v: number) => `₹${(v / 1000000).toFixed(1)}M` },
                    { label: "Network Disruption", before: mitigationSummary?.before.disruption ?? 0, after: mitigationSummary?.after.disruption, icon: Zap, suffix: "%" }
                ].map((k) => (
                    <Card key={k.label} className="p-4 relative overflow-hidden bg-card border-accent shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                            <k.icon size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{k.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black">{k.fmt ? k.fmt(k.after ?? k.before) : (k.after ?? k.before)}{k.suffix && !k.fmt && k.suffix}</span>
                            {k.after !== undefined && <DeltaBadge before={k.before} after={k.after} suffix={k.suffix} inverse={k.inverse} />}
                        </div>
                        {k.after !== undefined && <p className="text-[9px] text-muted-foreground mt-1">Before: {k.fmt ? k.fmt(k.before) : k.before}{k.suffix && !k.fmt && k.suffix}</p>}
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2 tracking-tight"><Shield className="text-primary" size={16} /> Recommended</h2>
                    <div className="space-y-3">
                        {recommendations.map((rec) => (
                            <RecommendationItem key={rec.targetId} action={rec} onApply={() => handleAddIntervention(rec.type as any, rec.targetId)} onPreview={previewIntervention} />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <Card className="p-0 overflow-hidden border-2 border-primary/10">
                        <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
                            <h3 className="text-sm font-bold tracking-tight">Build Scenario</h3>
                            <Badge variant="secondary" className="h-5 text-[10px]">{interventionScenario.length} Actions</Badge>
                        </div>
                        <div className="p-5">
                            <Tabs defaultValue="node">
                                <TabsList className="w-full bg-accent/50 mb-6 h-9">
                                    <TabsTrigger value="node" className="flex-1 text-xs">Node Action</TabsTrigger>
                                    <TabsTrigger value="edge" className="flex-1 text-xs">Edge Action</TabsTrigger>
                                    <TabsTrigger value="bulk" className="flex-1 text-xs">Bulk Apply</TabsTrigger>
                                </TabsList>
                                <TabsContent value="node" className="space-y-4 m-0">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Search Account ID..." className="pl-9 h-9 text-xs" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Button variant="outline" className="h-20 flex-col gap-2 border-dashed hover:border-blue-500" onClick={() => handleAddIntervention("freeze", searchId || "ACC-1024")}><Lock size={18} className="text-blue-500" /><span className="text-[10px] font-bold">Freeze</span></Button>
                                        <Button variant="outline" className="h-20 flex-col gap-2 border-dashed hover:border-red-500" onClick={() => handleAddIntervention("blacklist", searchId || "ACC-1024")}><Ban size={18} className="text-red-500" /><span className="text-[10px] font-bold">Blacklist</span></Button>
                                        <Button variant="outline" className="h-20 flex-col gap-2 border-dashed hover:border-amber-500" onClick={() => handleAddIntervention("fee", searchId || "ACC-1024")}><Receipt size={18} className="text-amber-500" /><span className="text-[10px] font-bold">+Fee</span></Button>
                                    </div>
                                </TabsContent>
                                <TabsContent value="edge" className="m-0 py-8 text-center text-xs text-muted-foreground italic">Coming soon.</TabsContent>
                                <TabsContent value="bulk" className="m-0">
                                    <div className="space-y-2">
                                        {["RING-001", "RING-002", "RING-003"].map(r => (
                                            <div key={r} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent">
                                                <span className="font-mono text-xs">{r}</span>
                                                <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => { setSelectedBulkRing(r); setSelectedMembers(ringMembers); setIsBulkModalOpen(true); }}>Add Members</Button>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        <div className="border-t max-h-[240px] overflow-y-auto bg-muted/10">
                            {interventionScenario.map((action, i) => (
                                <div key={i} className="px-4 py-3 flex items-center justify-between border-b last:border-0 border-primary/5">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("h-2 w-2 rounded-full", action.type === "freeze" ? "bg-blue-500" : action.type === "blacklist" ? "bg-red-500" : "bg-amber-500")} />
                                        <div><p className="text-xs font-bold leading-none">{action.targetId}</p><p className="text-[10px] text-muted-foreground mt-1 uppercase">{action.type}</p></div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeIntervention(i)}><Trash2 size={12} /></Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-5 space-y-4">
                        <div className="flex items-center justify-between"><h3 className="text-sm font-bold tracking-tight">Risk Contribution Shift</h3><BarChart3 size={16} className="text-primary" /></div>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[{ name: 'Baseline', val: mitigationSummary?.before.riskScore ?? currentCase.riskExposure }, { name: 'Simulated', val: mitigationSummary?.after.riskScore ?? currentCase.riskExposure }]} margin={{ top: 20, right: 10, left: -20, bottom: 20 }} barSize={40}>
                                    <XAxis dataKey="name" fontSize={10} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false}><Label value="Scenario State" offset={-10} position="insideBottom" fontSize={9} fill="hsl(var(--muted-foreground))" /></XAxis>
                                    <YAxis fontSize={10} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} domain={[0, 100]}><Label value="Aggregate Risk Contribution Index" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fontSize={9} dx={10} fill="hsl(var(--muted-foreground))" /></YAxis>
                                    <RTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }} content={({ active, payload }: any) => {
                                        if (active && payload && payload.length) {
                                            const val = payload[0].value;
                                            const isSimulated = payload[0].payload.name === 'Simulated';
                                            const beforeVal = mitigationSummary?.before.riskScore ?? currentCase.riskExposure;
                                            const change = ((val - beforeVal) / beforeVal * 100).toFixed(0);
                                            return (
                                                <div className="bg-card border shadow-xl p-3 rounded-lg text-[11px] space-y-2">
                                                    <p className="font-bold border-b pb-1">{payload[0].payload.name} Assessment</p>
                                                    <div className="flex justify-between gap-4"><span className="text-muted-foreground">Total Risk:</span><span className="font-bold">{val}</span></div>
                                                    {isSimulated && mitigationSummary && (
                                                        <>
                                                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Rings Affected:</span><span className="font-bold">{mitigationSummary.before.ringCount - mitigationSummary.after.ringCount}</span></div>
                                                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Accounts Hit:</span><span className="font-bold">{mitigationSummary.before.suspiciousCount - mitigationSummary.after.suspiciousCount}</span></div>
                                                            <div className="flex justify-between gap-4 border-t pt-1"><span className="text-muted-foreground">% Change:</span><span className={cn("font-bold", parseInt(change) < 0 ? "text-green-600" : "text-red-500")}>{parseInt(change) > 0 ? "+" : ""}{change}%</span></div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }} />
                                    <Bar dataKey="val" radius={[4, 4, 0, 0]}><Cell fill="hsl(var(--muted-foreground))" opacity={0.3} /><Cell fill="hsl(var(--primary))" /></Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-[9px] text-center text-muted-foreground italic">Simulated impact based on structural pattern removal. No enforcement actions executed.</p>
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold tracking-tight">Network Cluster Change</h3><ExternalLink size={14} className="text-muted-foreground cursor-pointer" onClick={() => nav("/graph")} /></div>
                        <div className="grid grid-cols-2 gap-4 aspect-[2/1] bg-muted/20 rounded-lg p-4 relative overflow-hidden">
                            <div className="flex flex-col items-center justify-center border-r border-dashed pr-4 relative">
                                <p className="absolute top-0 left-0 text-[8px] font-bold uppercase text-muted-foreground">Before Simulation</p>
                                <svg width="60" height="60" viewBox="0 0 80 80" className="opacity-60">
                                    <circle cx="20" cy="20" r="4" fill="hsl(var(--primary))" /><circle cx="60" cy="20" r="4" fill="hsl(var(--primary))" /><circle cx="20" cy="60" r="4" fill="hsl(var(--primary))" /><circle cx="60" cy="60" r="4" fill="hsl(var(--primary))" /><circle cx="40" cy="40" r="6" fill="hsl(var(--primary))" />
                                    <path d="M25 25 L35 35" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="2 1" /><path d="M55 25 L45 35" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="2 1" /><path d="M25 55 L35 45" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="2 1" /><path d="M55 55 L45 45" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="2 1" />
                                </svg>
                                <p className="text-[10px] text-muted-foreground mt-2">6 Clusters</p>
                            </div>
                            <div className="flex flex-col items-center justify-center pl-4 relative">
                                <p className="absolute top-0 left-4 text-[8px] font-bold uppercase text-primary">After Simulation</p>
                                <svg width="60" height="60" viewBox="0 0 80 80">
                                    <circle cx="20" cy="20" r="4" fill="hsl(var(--primary))" opacity="0.3" /><circle cx="60" cy="20" r="4" fill="hsl(var(--primary))" /><circle cx="20" cy="60" r="4" fill="hsl(var(--primary))" /><circle cx="60" cy="60" r="4" fill="hsl(var(--primary))" opacity="0.3" /><circle cx="40" cy="40" r="4" fill="hsl(var(--primary))" />
                                    <path d="M55 25 L45 35" stroke="hsl(var(--primary))" strokeWidth="1" /><path d="M25 55 L35 45" stroke="hsl(var(--primary))" strokeWidth="1" />
                                </svg>
                                <p className="text-[10px] font-bold text-primary mt-2">4 Clusters</p>
                                {mitigationSummary && <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-md flex items-center justify-center pointer-events-none"><TrendingDown size={18} className="text-primary/40" /></div>}
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t pt-4">
                            <div><p className="text-[9px] text-muted-foreground uppercase font-bold">Clusters</p><p className="text-xs font-black text-red-500">-{mitigationSummary ? "2" : "0"}</p></div>
                            <div><p className="text-[9px] text-muted-foreground uppercase font-bold">Max Size</p><p className="text-xs font-black text-red-500">-{mitigationSummary ? "12%" : "0%"}</p></div>
                            <div><p className="text-[9px] text-muted-foreground uppercase font-bold">Coordination</p><p className="text-xs font-black text-red-500">-{mitigationSummary ? "18%" : "0%"}</p></div>
                        </div>
                    </Card>
                </div>
            </div>

            <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Simulated Intervention Scope</DialogTitle>
                        <DialogDescription className="text-xs">
                            Manage entities included in the <span className="font-bold text-primary">{selectedBulkRing}</span> simulation scenario.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                            {ringMembers.map(id => (
                                <div key={id} className="flex items-center justify-between p-2 rounded border bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <Checkbox id={`m-${id}`} checked={selectedMembers.includes(id)} onCheckedChange={(checked) => {
                                            if (checked) setSelectedMembers([...selectedMembers, id]);
                                            else setSelectedMembers(selectedMembers.filter(m => m !== id));
                                        }} />
                                        <label htmlFor={`m-${id}`} className="text-xs font-mono font-bold cursor-pointer">{id}</label>
                                    </div>
                                    <Badge variant="outline" className="text-[8px] h-4">Priority</Badge>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-primary/5 rounded border border-primary/20 space-y-2 text-[11px]">
                            <div className="flex justify-between"><span>Affected Nodes</span><span className="font-bold">{selectedMembers.length}</span></div>
                            <div className="flex justify-between"><span>Risk Delta</span><span className="font-bold text-green-600">-{selectedMembers.length * 1.5}%</span></div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button variant="outline" size="sm" onClick={() => setIsBulkModalOpen(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleBulkApply} disabled={selectedMembers.length === 0}>Apply to Simulation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Intervention;
