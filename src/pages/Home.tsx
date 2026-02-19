import { useAppStore } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";
import StatsCard from "@/components/StatsCard";
import RiskBadge from "@/components/RiskBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, ArrowRightLeft, AlertTriangle, Network, Clock,
  Upload, ArrowRight
} from "lucide-react";
import UploadManager from "@/components/UploadManager";

const Home = () => {
  const { hasAnalysis, currentCase, cases } = useAppStore();
  const nav = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AML Decision-Support Platform</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Evaluate behavioral indicators, explore structural relationship flags, and review non-binding risk summaries.
        </p>
      </div>

      {!hasAnalysis ? (
        <div className="space-y-8">
          <UploadManager />

          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            {[
              { step: "1", title: "Ingest", desc: "Import transaction data for behavioral assessment" },
              { step: "2", title: "Evaluate", desc: "Engine identifies structural flags and indicators" },
              { step: "3", title: "Review", desc: "Examine analytical findings and structural evidence" },
            ].map((s) => (
              <Card key={s.step} className="p-4 border-dashed">
                <div className="text-lg font-bold text-primary">{s.step}</div>
                <p className="font-semibold text-sm mt-1">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatsCard label="Total Entities" value={currentCase?.nodeCount ?? 0} icon={Users} tooltip="Unique accounts in the dataset" />
            <StatsCard label="Transactions" value={(currentCase?.txCount ?? 0).toLocaleString()} icon={ArrowRightLeft} tooltip="Total transaction count" />
            <StatsCard label="Requires Review" value={currentCase?.suspiciousCount ?? 0} icon={AlertTriangle} tooltip="Entities requiring manual compliance review" />
            <StatsCard label="Networks Flagged" value={currentCase?.ringCount ?? 0} icon={Network} tooltip="Potential networks requiring structural analysis" />
            <StatsCard label="Processing" value={`${currentCase?.processingTime ?? 0}s`} icon={Clock} tooltip="Analysis execution time" />
          </div>

          <div className="space-y-8">
            {/* Recent Runs - Full Width */}
            <section>
              <h2 className="text-sm font-semibold mb-3">Analytical Histories</h2>
              <div className="space-y-2">
                {cases && cases.length > 0 ? cases.map((c) => (
                  <Card key={c.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-mono text-sm font-semibold">{c.id}</p>
                          <p className="text-xs text-muted-foreground">{c.date} · {c.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">{c.nodeCount} entities</span>
                        {c.topPatterns && c.topPatterns.slice(0, 3).map((p) => (
                          <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                        ))}
                        <RiskBadge level={c.riskLevel} />
                        <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => nav("/analytics")}>
                          Open <ArrowRight size={12} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <p className="text-xs text-muted-foreground italic">No analytical records found.</p>
                )}
              </div>
            </section>

            {/* Network Overview - Placeholder for scale viz */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 overflow-hidden relative min-h-[200px] flex flex-col justify-center items-center bg-accent/5">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  {/* Visual background nodes for scale representation */}
                  <div className="absolute inset-0 grid grid-cols-12 gap-4 p-4">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
                    ))}
                  </div>
                </div>
                <div className="relative text-center z-10">
                  <Network size={40} className="text-primary/40 mx-auto mb-3" />
                  <h3 className="text-lg font-bold">Network Scale Overview</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                    Dataset represents {currentCase?.nodeCount} entity nodes and {currentCase?.edgeCount} behavioral links.
                  </p>
                </div>
              </Card>
            </section>

            {/* Run New Analysis - Full Width Bottom */}
            <section>
              <Card className="p-6 border-dashed bg-muted/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-semibold flex items-center gap-2">
                      <Upload size={18} className="text-primary" /> Run New Analysis
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload another CSV to detect suspicious patterns in a different dataset.
                    </p>
                  </div>
                </div>
                <div className="max-w-4xl mx-auto">
                  <UploadManager />
                </div>
              </Card>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
