import { useAppStore } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RiskBadge from "@/components/RiskBadge";
import { TrendingUp, ArrowRight, Database, Users } from "lucide-react";
import { getRiskLevel } from "@/lib/types";

const Entities = () => {
  const { cases, hasAnalysis, accounts } = useAppStore();
  const nav = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Analytical Histories</h1>
        <p className="text-sm text-muted-foreground">Browse prior behavioral evaluations and track risk trends</p>
      </div>

      {!hasAnalysis ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4">
          <Database size={32} className="text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No analysis available. Upload and analyze a dataset first.</p>
          <Button variant="outline" onClick={() => nav("/upload")}>Upload CSV</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Session Entities */}
          <Card className="p-4 border-primary/20 bg-primary/5">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Users size={16} className="text-primary" /> Current Detected Entities ({accounts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {accounts.slice(0, 12).map((a) => (
                <Card key={a.id} className="p-3 hover:border-primary/50 cursor-pointer transition-colors" onClick={() => nav("/analytics")}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold">{a.id}</span>
                    <RiskBadge level={getRiskLevel(a.riskScore)} score={a.riskScore} size="sm" />
                  </div>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {a.patterns.map(p => <Badge key={p} variant="secondary" className="px-1 py-0 text-[9px]">{p}</Badge>)}
                  </div>
                </Card>
              ))}
            </div>
            {accounts.length > 12 && (
              <p className="text-center text-[10px] text-muted-foreground mt-4">Showing top 12 entities. See Analytics for full list.</p>
            )}
          </Card>

          {/* Past Cases */}
          {cases.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest text-[10px]">Historical Evaluations</h3>
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
            </div>
          )}

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
