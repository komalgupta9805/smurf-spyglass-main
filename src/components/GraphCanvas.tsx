import { useCallback, useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Account, GraphEdge, getRiskLevel } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GraphCanvasProps {
  accounts: Account[];
  edges: GraphEdge[];
  selectedAccountId: string | null;
  selectedRingId: string | null;
  onSelectAccount: (id: string) => void;
  layout: string;
  showLabels: boolean;
  edgeLabelMode: "none" | "amount" | "count";
  suspiciousOnly: boolean;
  minRisk: number;
  aggregateEdges: boolean;
  ringFocusMode?: boolean;
}

const GraphCanvas = ({
  accounts,
  edges,
  selectedAccountId,
  selectedRingId,
  onSelectAccount,
  layout,
  showLabels,
  edgeLabelMode,
  suspiciousOnly,
  minRisk,
  aggregateEdges,
  ringFocusMode = false,
}: GraphCanvasProps) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const filteredAccounts = useMemo(() => {
    let a = accounts.filter((acc) => acc.riskScore >= minRisk);
    if (suspiciousOnly) a = a.filter((acc) => acc.riskScore >= 60);
    if (selectedRingId) a = a.filter((acc) => acc.ringId === selectedRingId);
    return a;
  }, [accounts, minRisk, suspiciousOnly, selectedRingId]);

  const ids = useMemo(() => new Set(filteredAccounts.map((a) => a.id)), [filteredAccounts]);
  const filteredEdges = useMemo(() => {
    const raw = edges.filter((e) => ids.has(e.from) && ids.has(e.to));
    if (!aggregateEdges) return raw;

    // Aggregate edges between same source-target pair
    const aggMap = new Map<string, GraphEdge>();
    raw.forEach((e) => {
      const key = `${e.from}-${e.to}`;
      if (aggMap.has(key)) {
        const existing = aggMap.get(key)!;
        aggMap.set(key, {
          ...existing,
          amount: existing.amount + e.amount,
          count: existing.count + e.count,
        });
      } else {
        aggMap.set(key, { ...e });
      }
    });
    return Array.from(aggMap.values());
  }, [edges, ids, aggregateEdges]);

  const W = 700;
  const H = 500;
  const cx = W / 2;
  const cy = H / 2;

  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const n = filteredAccounts.length;
    if (n === 0) return pos;

    if (layout === "circular") {
      const r = Math.min(cx, cy) - 80;
      filteredAccounts.forEach((a, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        pos[a.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
      });
    } else if (layout === "ring") {
      // Group by risk level or ring ID for multi-ring layout
      filteredAccounts.forEach((a, i) => {
        const layer = a.riskScore > 70 ? 0 : a.riskScore > 40 ? 1 : 2;
        const r = (Math.min(cx, cy) - 60) * (0.4 + layer * 0.3);
        const layerNodes = filteredAccounts.filter(node =>
          (node.riskScore > 70 ? 0 : node.riskScore > 40 ? 1 : 2) === layer
        );
        const layerIdx = layerNodes.findIndex(node => node.id === a.id);
        const angle = (2 * Math.PI * layerIdx) / layerNodes.length;
        pos[a.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
      });
    } else if (layout === "force") {
      // Deterministic "force" (simulated with sunflower/spiral)
      const phi = (Math.sqrt(5) + 1) / 2;
      filteredAccounts.forEach((a, i) => {
        const r = 20 * Math.sqrt(i + 1);
        const theta = (2 * Math.PI * i) / (phi * phi);
        pos[a.id] = { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) };
      });
    } else {
      // hierarchical / grid
      const cols = Math.ceil(Math.sqrt(n));
      const gapX = (W - 80) / Math.max(cols, 1);
      const gapY = (H - 80) / Math.max(Math.ceil(n / cols), 1);
      filteredAccounts.forEach((a, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        pos[a.id] = { x: 40 + col * gapX + gapX / 2, y: 40 + row * gapY + gapY / 2 };
      });
    }
    return pos;
  }, [filteredAccounts, layout, cx, cy, W, H]);

  const nodeColor = useCallback(
    (a: Account) => {
      const lvl = getRiskLevel(a.riskScore);
      if (lvl === "high") return "hsl(var(--risk-high))";
      if (lvl === "medium") return "hsl(var(--risk-medium))";
      return "hsl(var(--risk-low))";
    },
    []
  );

  if (filteredAccounts.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
        No nodes match the current filters
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ minHeight: 400 }}>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="currentColor" opacity={0.7} />
        </marker>
        <marker id="arrow-hl" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="hsl(var(--primary))" opacity={0.9} />
        </marker>
        <marker id="arrow-focus" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto">
          <path d="M0,0 L10,4 L0,8" fill="hsl(var(--primary))" />
        </marker>

        {/* Glow Filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Animation for edges */}
        <style>{`
          @keyframes flow {
            from { stroke-dashoffset: 20; }
            to { stroke-dashoffset: 0; }
          }
          .animate-flow {
            stroke-dasharray: 5, 5;
            animation: flow 1s linear infinite;
          }
        `}</style>
      </defs>

      {/* Ring Hull / Visual Cluster Boundary */}
      {ringFocusMode && selectedRingId && filteredAccounts.length > 0 && (
        <g className="animate-in fade-in zoom-in duration-1000">
          <circle
            cx={cx}
            cy={cy}
            r={Math.min(cx, cy) - 50}
            fill="hsl(var(--primary)/0.02)"
            stroke="hsl(var(--primary)/0.15)"
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
          <text
            x={cx}
            y={cy - (Math.min(cx, cy) - 50) - 12}
            textAnchor="middle"
            className="fill-primary/40 text-[10px] font-bold uppercase tracking-widest"
          >
            {selectedRingId} Focus Area
          </text>
        </g>
      )}

      {/* edges */}
      {filteredEdges.map((e, i) => {
        const from = positions[e.from];
        const to = positions[e.to];
        if (!from || !to) return null;

        const isRingEdge = ringFocusMode && selectedRingId &&
          accounts.find(a => a.id === e.from)?.ringId === selectedRingId &&
          accounts.find(a => a.id === e.to)?.ringId === selectedRingId;

        const isExternalEdge = ringFocusMode && !isRingEdge;

        const isHl = hoveredNode === e.from || hoveredNode === e.to;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / len;
        const ny = dy / len;
        const r = 18;

        return (
          <g key={i}>
            <line
              x1={from.x + nx * r}
              y1={from.y + ny * r}
              x2={to.x - nx * (r + 8)}
              y2={to.y - ny * (r + 8)}
              stroke={isRingEdge ? "hsl(var(--primary))" : isHl ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
              strokeWidth={isRingEdge ? 2.5 : isHl ? 2 : 1}
              markerEnd={isRingEdge ? "url(#arrow-focus)" : isHl ? "url(#arrow-hl)" : "url(#arrow)"}
              opacity={isRingEdge ? 1 : isExternalEdge ? 0.1 : isHl ? 0.9 : 0.3}
              strokeDasharray={isExternalEdge ? "2 2" : "none"}
              className={cn(isRingEdge && "animate-flow", "transition-all duration-300")}
              style={isRingEdge ? { strokeLinecap: 'round' } : {}}
            />
            {edgeLabelMode !== "none" && !isExternalEdge && (
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 6}
                textAnchor="middle"
                className={cn("fill-muted-foreground transition-all", isRingEdge && "fill-primary font-bold")}
                fontSize={isRingEdge ? 10 : 9}
              >
                {edgeLabelMode === "amount" ? `₹${(e.amount / 1000).toFixed(0)}K` : `${e.count}tx`}
              </text>
            )}
          </g>
        );
      })}

      {/* nodes */}
      {filteredAccounts.map((a) => {
        const pos = positions[a.id];
        if (!pos) return null;

        const isRingMember = ringFocusMode && selectedRingId && a.ringId === selectedRingId;
        const isDimmed = ringFocusMode && !isRingMember;

        const isSelected = selectedAccountId === a.id;
        const isHovered = hoveredNode === a.id;

        return (
          <Tooltip key={a.id}>
            <TooltipTrigger asChild>
              <g
                className={cn("cursor-pointer transition-all duration-500", isDimmed && "opacity-15 grayscale-[0.5]")}
                onClick={() => onSelectAccount(a.id)}
                onMouseEnter={() => setHoveredNode(a.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Glow for ring members */}
                {isRingMember && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={22}
                    fill={nodeColor(a)}
                    filter="url(#glow)"
                    opacity={0.3}
                  />
                )}

                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected || isHovered || isRingMember ? 20 : 16}
                  fill={nodeColor(a)}
                  opacity={isRingMember ? 1 : 0.85}
                  stroke={isRingMember ? "hsl(var(--primary))" : isSelected ? "hsl(var(--foreground))" : isHovered ? "hsl(var(--primary))" : "transparent"}
                  strokeWidth={isRingMember ? 3 : isSelected ? 3 : 2}
                  className="transition-all duration-300"
                />
                {(showLabels || isRingMember) && (
                  <text
                    x={pos.x}
                    y={pos.y + 28}
                    textAnchor="middle"
                    className={cn("fill-foreground", isRingMember && "fill-primary font-bold")}
                    fontSize={isRingMember ? 9 : 8}
                    fontWeight={isRingMember ? 700 : 500}
                  >
                    {a.id.replace("ACC-", "")}
                  </text>
                )}
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize={isRingMember ? 10 : 9}
                  fontWeight={700}
                >
                  {a.riskScore}
                </text>
              </g>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10px] space-y-1">
              <div className="font-bold flex items-center justify-between gap-4">
                {a.id} <Badge variant="outline" className="text-[8px] h-4 py-0">{getRiskLevel(a.riskScore)}</Badge>
              </div>
              <p className="text-muted-foreground">Confidence: {a.confidence}% | Linkage: {a.inDegree} in / {a.outDegree} out</p>
              {a.patterns.length > 0 && <p className="text-primary font-medium">Patterns: {a.patterns.join(", ")}</p>}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </svg >
  );
};

export default GraphCanvas;
