import { useAppStore } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import RiskBadge from "@/components/RiskBadge";
import { getRiskLevel } from "@/lib/types";
import { Download, FileText, FileJson, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { jsPDF } from "jspdf";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const PatternVisualizer = ({ type }: { type: string }) => {
  const isType = (t: string) => type.toLowerCase().includes(t);

  return (
    <div className="w-full aspect-square bg-muted/20 rounded-xl border border-dashed flex items-center justify-center relative overflow-hidden">
      <svg width="240" height="240" viewBox="0 0 240 240" className="drop-shadow-sm">
        {/* Cycle Pattern */}
        {isType("cycle") && (
          <g className="animate-in fade-in zoom-in duration-700">
            <circle cx="120" cy="60" r="10" fill="hsl(var(--primary))" />
            <circle cx="180" cy="120" r="10" fill="hsl(var(--primary))" />
            <circle cx="120" cy="180" r="10" fill="hsl(var(--primary))" />
            <circle cx="60" cy="120" r="10" fill="hsl(var(--primary))" />
            <path d="M128 65 L172 115" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M180 130 L128 175" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M112 175 L68 125" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M60 110 L112 65" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrow)" />
          </g>
        )}

        {/* Fan-In Pattern */}
        {isType("fan-in") && (
          <g className="animate-in fade-in slide-in-from-left duration-700">
            <circle cx="180" cy="120" r="12" fill="hsl(var(--risk-high))" />
            <circle cx="60" cy="60" r="8" fill="hsl(var(--primary))" />
            <circle cx="60" cy="100" r="8" fill="hsl(var(--primary))" />
            <circle cx="60" cy="140" r="8" fill="hsl(var(--primary))" />
            <circle cx="60" cy="180" r="8" fill="hsl(var(--primary))" />
            <path d="M70 65 L168 112" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow)" />
            <path d="M70 105 L168 118" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow)" />
            <path d="M70 135 L168 122" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow)" />
            <path d="M70 175 L168 128" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow)" />
          </g>
        )}

        {/* Fan-Out Pattern */}
        {isType("fan-out") && (
          <g className="animate-in fade-in slide-in-from-right duration-700">
            <circle cx="60" cy="120" r="12" fill="hsl(var(--primary))" />
            <circle cx="180" cy="60" r="8" fill="hsl(var(--risk-medium))" />
            <circle cx="180" cy="100" r="8" fill="hsl(var(--risk-medium))" />
            <circle cx="180" cy="140" r="8" fill="hsl(var(--risk-medium))" />
            <circle cx="180" cy="180" r="8" fill="hsl(var(--risk-medium))" />
            <path d="M72 112 L168 65" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow)" />
            <path d="M72 118 L168 105" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow)" />
            <path d="M72 122 L168 135" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow)" />
            <path d="M72 128 L168 175" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow)" />
          </g>
        )}

        {/* Layering Pattern */}
        {isType("layering") && (
          <g className="animate-in fade-in slide-in-from-top duration-700">
            <circle cx="40" cy="120" r="10" fill="hsl(var(--primary))" />
            <circle cx="90" cy="120" r="8" fill="hsl(var(--muted-foreground))" />
            <circle cx="140" cy="120" r="8" fill="hsl(var(--muted-foreground))" />
            <circle cx="190" cy="120" r="10" fill="hsl(var(--risk-high))" />
            <path d="M50 120 L80 120" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M100 120 L130 120" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M150 120 L180 120" stroke="hsl(var(--primary))" strokeWidth="2" markerEnd="url(#arrow)" />
          </g>
        )}

        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

const PatternDrawer = ({ type, data }: { type: string, data?: any }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors uppercase tracking-tight">
          {type.replace("-", " ")}
        </Badge>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col h-full p-0">
        <div className="p-6 border-b shrink-0">
          <SheetHeader>
            <SheetTitle className="text-xl flex items-center gap-2">
              Pattern Analysis: <span className="capitalize text-primary">{type.replace("-", " ")}</span>
            </SheetTitle>
            <SheetDescription>
              Graphical representation and behavioral breakdown of the detected structural motif.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="space-y-8 pb-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Structural Visualization</h3>
              <PatternVisualizer type={type} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Behavioral Summary</h3>
              <div className="p-4 bg-muted/30 rounded-lg border border-border leading-relaxed text-sm">
                {type.toLowerCase().includes("cycle") && (
                  <p>This network exhibits <span className="font-bold text-primary italic underline">Circular Routing</span> behavior. Funds are transferred through multiple intermediary accounts, eventually returning to or near the starting entity. This is a classic indicator of fund recycling to obfuscate audit trails.</p>
                )}
                {type.toLowerCase().includes("fan-in") && (
                  <p>This network exhibits <span className="font-bold text-primary italic underline">Aggregation (Fan-In)</span> behavior. Multiple distinct entities are rapidly transferring funds into a central collector account. This often signals a pooling phase of illicit proceeds from disparate sources.</p>
                )}
                {type.toLowerCase().includes("fan-out") && (
                  <p>This network exhibits <span className="font-bold text-primary italic underline">Distribution (Fan-Out)</span> behavior. A single source entity is dispersing funds to numerous beneficiary accounts in a short window, often used to stay below reporting thresholds (smurfing).</p>
                )}
                {type.toLowerCase().includes("layering") && (
                  <p>This network exhibits <span className="font-bold text-primary italic underline">Sequential Layering</span> behavior. Funds move linearly through several "pass-through" accounts with minimal balance retention. This structure is designed to distance the wealth from its original source.</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Statistical Impact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-md">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Involved Entities</p>
                  <p className="text-lg font-mono font-bold">{data?.memberCount ?? "4+"}</p>
                </div>
                <div className="p-3 border rounded-md">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Node Connectivity</p>
                  <p className="text-lg font-mono font-bold">High</p>
                </div>
                <div className="p-3 border rounded-md">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Network Flow</p>
                  <p className="text-lg font-mono font-bold">₹{(data?.totalFlow / 1e6 || 1.2).toFixed(1)}M</p>
                </div>
                <div className="p-3 border rounded-md">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Risk Weight</p>
                  <p className="text-lg font-mono font-bold text-risk-high">High</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Report = () => {
  const { hasAnalysis, currentCase, accounts, rings } = useAppStore();
  const nav = useNavigate();

  if (!hasAnalysis || !currentCase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-muted-foreground text-sm">No analysis to report on. Run an analysis first.</p>
        <Button variant="outline" onClick={() => nav("/")}>Go to Home</Button>
      </div>
    );
  }

  const topAccounts = [...accounts].sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);
  const topRings = [...rings].sort((a, b) => b.riskScore - a.riskScore);

  const exportJSON = () => {
    const data = {
      case: currentCase,
      suspiciousAccounts: topAccounts,
      rings: topRings,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smurf-report-${currentCase.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 30;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(23, 37, 84); // Navy
    doc.text("SPYGLASS AML", margin, y);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Gray
    doc.text("Analytical Risk Assessment", 140, y);

    y += 10;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, 190, y);

    y += 15;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Case ID: ${currentCase.id}`, margin, y);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 140, y);

    y += 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const summary = `Behavioral evaluation of ${currentCase.txCount.toLocaleString()} transactions across ${currentCase.nodeCount} entities identified ${currentCase.suspiciousCount} flagged records organized in ${currentCase.ringCount} suspicious networks. The analytical risk exposure index is ${currentCase.riskExposure}, classified as ${currentCase.riskLevel.toUpperCase()} indicator. Findings are for decision support only.`;
    const splitSummary = doc.splitTextToSize(summary, 170);
    doc.text(splitSummary, margin, y);
    y += splitSummary.length * 6;

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Assessment Indicators", margin, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`Total Entities: ${currentCase.nodeCount}`, margin + 5, y);
    doc.text(`Suspicious Networks: ${currentCase.ringCount}`, margin + 60, y);
    doc.text(`Risk Indicator: ${currentCase.riskExposure}/100`, margin + 110, y);

    y += 15;
    doc.setFont("helvetica", "bold");
    doc.text("Priority Review Indicators", margin, y);
    y += 10;
    doc.setFontSize(9);
    doc.text("Entity ID", margin + 5, y);
    doc.text("Risk Score", margin + 60, y);
    doc.text("Behavioral Pattern", margin + 100, y);
    doc.line(margin, y + 2, 190, y + 2);

    y += 8;
    topAccounts.slice(0, 5).forEach((acc) => {
      doc.setFont("helvetica", "normal");
      doc.text(acc.id, margin + 5, y);
      doc.text(acc.riskScore.toString(), margin + 60, y);
      doc.text(acc.patterns[0] || "None", margin + 100, y);
      y += 8;
    });

    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Confidential Intelligence - Smurf Spyglass Internal Report", 105, 285, { align: "center" });

    doc.save(`smurf-report-${currentCase.id}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Investigation Report</h1>
          <p className="text-sm text-muted-foreground">Case {currentCase.id} · {currentCase.date}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportJSON} variant="outline" className="gap-1.5 text-xs h-9 border-dashed">
            <FileJson size={14} className="text-primary" /> Download JSON
          </Button>
          <Button onClick={exportPDF} variant="outline" className="gap-1.5 text-xs h-9 border-dashed">
            <FileText size={14} className="text-primary" /> PDF Report
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold mb-3">Executive Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-xs">
          <div className="space-y-1">
            <p className="text-muted-foreground uppercase font-bold text-[10px]">Transactions analyzed</p>
            <p className="font-mono font-bold text-sm">{currentCase.txCount.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground uppercase font-bold text-[10px]">Accounts involved</p>
            <p className="font-mono font-bold text-sm">{currentCase.nodeCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground uppercase font-bold text-[10px]">Suspicious networks</p>
            <p className="font-mono font-bold text-sm">{currentCase.ringCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground uppercase font-bold text-[10px]">Primary patterns</p>
            <div className="flex flex-wrap gap-1">
              {currentCase.topPatterns.map(p => (
                <PatternDrawer key={p} type={p} />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground uppercase font-bold text-[10px]">Overall risk level</p>
            <RiskBadge level={currentCase.riskLevel} size="sm" />
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground uppercase font-bold text-[10px]">Processing time</p>
            <p className="font-mono font-bold text-sm">{currentCase.processingTime}s</p>
          </div>
        </div>
      </Card>

      {/* Risk Overview */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold mb-2">Risk Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help transition-colors hover:bg-accent/50 p-1 rounded">
                <p className="text-xs text-muted-foreground flex items-center gap-1">Risk Exposure <Info size={10} /></p>
                <p className="font-semibold">{currentCase.riskExposure}/100</p>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-[11px]">
              {currentCase.riskExposure >= 60
                ? "High risk exposure due to overlapping cycle and fan-in patterns."
                : "Calculated risk index based on detected behavioral indicators."}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help transition-colors hover:bg-accent/50 p-1 rounded">
                <p className="text-xs text-muted-foreground flex items-center gap-1">Suspicious Rate <Info size={10} /></p>
                <p className="font-semibold">{((currentCase.suspiciousCount / currentCase.nodeCount) * 100).toFixed(1)}%</p>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-[11px]">
              Suspicious rate reflects percentage of accounts participating in detected rings.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help transition-colors hover:bg-accent/50 p-1 rounded">
                <p className="text-xs text-muted-foreground flex items-center gap-1">Ring Coverage <Info size={10} /></p>
                <p className="font-semibold">{rings.reduce((s, r) => s + r.members.length, 0)} accounts</p>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-[11px]">
              Ring coverage shows number of unique accounts linked to coordinated behavior.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help transition-colors hover:bg-accent/50 p-1 rounded">
                <p className="text-xs text-muted-foreground flex items-center gap-1">Time Window <Info size={10} /></p>
                <p className="font-semibold">{currentCase.timeWindow}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-[11px]">
              Analytical timeframe of the processed transaction dataset.
            </TooltipContent>
          </Tooltip>
        </div>
      </Card>

      {/* Ring Summary Table */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold mb-3">Suspicious Networks Flagged</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Ring ID</TableHead>
              <TableHead className="text-xs">Risk</TableHead>
              <TableHead className="text-xs">Confidence</TableHead>
              <TableHead className="text-xs">Pattern</TableHead>
              <TableHead className="text-xs">Members</TableHead>
              <TableHead className="text-xs">Total Flow</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topRings.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.id}</TableCell>
                <TableCell><RiskBadge level={getRiskLevel(r.riskScore)} score={r.riskScore} /></TableCell>
                <TableCell className="text-xs">{r.confidence}%</TableCell>
                <TableCell><PatternDrawer type={r.patternType} data={{ memberCount: r.members.length, totalFlow: r.totalFlow }} /></TableCell>
                <TableCell className="text-xs">{r.members.length}</TableCell>
                <TableCell className="text-xs">₹{(r.totalFlow / 1e6).toFixed(1)}M</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Top 10 Suspicious Accounts */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold mb-3">High-Priority Indicators for Review</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Account</TableHead>
              <TableHead className="text-xs">Risk</TableHead>
              <TableHead className="text-xs">Confidence</TableHead>
              <TableHead className="text-xs">Ring</TableHead>
              <TableHead className="text-xs">Patterns</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topAccounts.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-xs">{a.id}</TableCell>
                <TableCell><RiskBadge level={getRiskLevel(a.riskScore)} score={a.riskScore} /></TableCell>
                <TableCell className="text-xs">{a.confidence}%</TableCell>
                <TableCell className="text-xs font-mono">{a.ringId ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {a.patterns.map((p) => <PatternDrawer key={p} type={p} />)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Report;
