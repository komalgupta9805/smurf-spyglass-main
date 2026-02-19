import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Info, ArrowRight, Bot } from "lucide-react";
import type { Account, GraphEdge } from "@/lib/types";

interface FanInOutGraphProps {
    accounts: Account[];
    edges: GraphEdge[];
}

const FanInOutGraph = ({ accounts, edges }: FanInOutGraphProps) => {
    // Find top fan-in hubs (high in-degree)
    const fanInHubs = useMemo(() => {
        return accounts
            .filter((a) => a.inDegree >= 5)
            .sort((a, b) => b.inDegree - a.inDegree)
            .slice(0, 5);
    }, [accounts]);

    // Find top fan-out hubs (high out-degree)
    const fanOutHubs = useMemo(() => {
        return accounts
            .filter((a) => a.outDegree >= 5)
            .sort((a, b) => b.outDegree - a.outDegree)
            .slice(0, 5);
    }, [accounts]);

    const renderHub = (hub: Account, type: "in" | "out") => {
        const hubEdges = edges.filter((e) => (type === "in" ? e.to === hub.id : e.from === hub.id));
        const counterparties = Array.from(new Set(hubEdges.map((e) => (type === "in" ? e.from : e.to))));

        return (
            <Card key={hub.id} className="p-4 bg-background/50 border-dashed relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Badge variant={type === "in" ? "default" : "secondary"} className="h-5 px-1.5 text-[10px] uppercase">
                            {type === "in" ? "Fan-In Hub" : "Fan-Out Hub"}
                        </Badge>
                        <span className="font-mono text-xs font-bold">{hub.id}</span>
                    </div>
                    <div className="text-xs font-semibold text-primary">
                        {type === "in" ? hub.inDegree : hub.outDegree} sources
                    </div>
                </div>

                <div className="flex items-center justify-center py-6 relative">
                    {/* Central Hub */}
                    <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center z-10 animate-pulse-slow">
                        <span className="text-[10px] font-bold">{hub.riskScore}</span>
                    </div>

                    {/* Spokes */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {counterparties.slice(0, 8).map((_, i) => {
                            const angle = (i * 360) / Math.min(counterparties.length, 8);
                            const rad = (angle * Math.PI) / 180;
                            const x1 = 50 + 15 * Math.cos(rad);
                            const y1 = 50 + 15 * Math.sin(rad);
                            const x2 = 50 + 40 * Math.cos(rad);
                            const y2 = 50 + 40 * Math.sin(rad);
                            return (
                                <line
                                    key={i}
                                    x1={`${x1}%`}
                                    y1={`${y1}%`}
                                    x2={`${x2}%`}
                                    y2={`${y2}%`}
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className={type === "in" ? "text-primary/30" : "text-secondary/50"}
                                    strokeDasharray="4 2"
                                />
                            );
                        })}
                    </svg>

                    {/* Peripheral nodes (dots) */}
                    {counterparties.slice(0, 8).map((cp, i) => {
                        const angle = (i * 360) / Math.min(counterparties.length, 8);
                        const rad = (angle * Math.PI) / 180;
                        const x = 50 + 40 * Math.cos(rad);
                        const y = 50 + 40 * Math.sin(rad);
                        return (
                            <Tooltip key={cp}>
                                <TooltipTrigger asChild>
                                    <div
                                        className="absolute w-2.5 h-2.5 rounded-full bg-muted-foreground/30 hover:bg-primary transition-colors cursor-help"
                                        style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                                    />
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">{cp}</TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold">
                    <span>Total Flow</span>
                    <span className="text-foreground">₹{((type === "in" ? hub.totalIn : hub.totalOut) / 1e6).toFixed(2)}M</span>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <Bot size={16} className="text-primary" /> Structural Motif Analysis
                    </h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-1">
                        Aggregators (Fan-In) & Distributors (Fan-Out) detected in-network
                    </p>
                </div>
                <div className="flex gap-4 text-[10px]">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Fan-In</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary" /> Fan-Out</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fanInHubs.map((hub) => renderHub(hub, "in"))}
                {fanOutHubs.map((hub) => renderHub(hub, "out"))}

                {(fanInHubs.length === 0 && fanOutHubs.length === 0) && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground text-sm">No significant fan-in or fan-out patterns detected.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FanInOutGraph;
