import { useAppStore } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RiskBadge from "@/components/RiskBadge";
import { TrendingUp, ArrowRight, Database } from "lucide-react";

const Entities = () => {
  const { cases, hasAnalysis } = useAppStore();
  const nav = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Analytical Histories</h1>
        <p className="text-sm text-muted-foreground">Browse prior behavioral evaluations and track risk trends</p>
      </div>

      {!hasAnalysis || cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4">
          <Database size={32} className="text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No cases available. Upload and analyze a dataset first.</p>
          <Button variant="outline" onClick={() => nav("/upload")}>Upload CSV</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <Card key={c.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-semibold">{c.id}</p>
                    <RiskBadge level={c.riskLevel} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.date} · {c.fileName}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="text-center"><p className="font-semibold text-foreground">{c.nodeCount}</p><p>Entities</p></div>
                  <div className="text-center"><p className="font-semibold text-foreground">{c.edgeCount}</p><p>Links</p></div>
                  <div className="text-center"><p className="font-semibold text-foreground">{c.suspiciousCount}</p><p>Review Flags</p></div>
                  <div className="text-center"><p className="font-semibold text-foreground">{c.ringCount}</p><p>Networks</p></div>
                  <div className="text-center"><p className="font-semibold text-foreground">{c.processingTime}s</p><p>Time</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 flex-wrap">
                    {c.topPatterns.map((p) => <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>)}
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => nav("/analytics")}>
                    Open <ArrowRight size={12} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Trend summary */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-primary" />
              <h3 className="text-sm font-semibold">Trend Summary</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Avg Risk Exposure</p>
                <p className="font-semibold">{(cases.reduce((s, c) => s + c.riskExposure, 0) / cases.length).toFixed(0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Processing</p>
                <p className="font-semibold">{(cases.reduce((s, c) => s + c.processingTime, 0) / cases.length).toFixed(1)}s</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Networks Identified</p>
                <p className="font-semibold">{cases.reduce((s, c) => s + c.ringCount, 0)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Entities;
