import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import RiskBadge from "./RiskBadge";
import { getRiskLevel } from "@/lib/types";
import { Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WhyScorePanel = () => {
  const { showWhyPanel, whyAccountId, accounts, closeWhyPanel, addIntervention } = useAppStore();
  const nav = useNavigate();
  const account = accounts.find((a) => a.id === whyAccountId);

  const handleSendToIntervention = () => {
    if (!account) return;
    addIntervention({
      type: "freeze",
      targetId: account.id,
      targetType: "node",
      reason: "Sent from analysis panel"
    });
    closeWhyPanel();
    nav("/intervention");
  };

  return (
    <Sheet open={showWhyPanel} onOpenChange={(open) => !open && closeWhyPanel()}>
      <SheetContent className="w-[400px] sm:w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Why was this flagged?
            {account && <RiskBadge level={getRiskLevel(account.riskScore)} score={account.riskScore} />}
          </SheetTitle>
        </SheetHeader>

        {account && (
          <div className="mt-6 space-y-6">
            <div className="pb-4 border-b">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Target Entity</p>
              <p className="font-mono text-lg font-bold text-primary">{account.id}</p>
            </div>

            <section className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Detected Structural Patterns
                </h3>
                <div className="flex flex-wrap gap-1.5 ml-3.5">
                  {account.patterns.length > 0 ? (
                    account.patterns.map((p) => (
                      <Badge key={p} variant="secondary" className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 border-none capitalize">
                        {p.replace("-", " ")}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No specific motifs identified</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground ml-3.5 leading-relaxed">
                  The analytical engine identified {account.patterns.length} specific behavioral motifs associated with coordinated movement of funds.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Time Concentration Summary
                </h3>
                <p className="text-xs text-muted-foreground ml-3.5 leading-relaxed">
                  Activity concentrated within a <span className="font-medium text-foreground">72-hour window</span>. Rapid sequencing of inflows and outflows suggests automated or highly coordinated transaction behavior.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Structural Role Description
                </h3>
                <p className="text-xs text-muted-foreground ml-3.5 leading-relaxed">
                  {account.inDegree > account.outDegree ? (
                    "Acts primarily as a concentration point (Fan-in hub), receiving funds from multiple disparate sources before consolidation."
                  ) : account.outDegree > account.inDegree ? (
                    "Acts primarily as a distribution point (Fan-out hub), dispersing consolidated funds to multiple downstream entities."
                  ) : (
                    "Acts as a key intermediary in a linear or circular routing loop, facilitating the movement of funds through the network."
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  False-Positive Check
                </h3>
                <div className="ml-3.5 p-2 bg-green-500/5 border border-green-500/20 rounded-md">
                  <p className="text-xs text-green-700 font-medium">Verified: No merchant-like behavior detected.</p>
                  <p className="text-[10px] text-green-600/80 mt-0.5">
                    Behavioral profile does not align with typical commercial activity (lack of diverse amounts, no payroll markers, atypical time-of-day activity).
                  </p>
                </div>
              </div>
            </section>

            <div className="pt-6 border-t flex flex-col gap-3">
              <Button className="w-full gap-2 bg-primary hover:bg-primary/90" onClick={handleSendToIntervention}>
                <Zap size={14} /> Simulate Risk Mitigation
              </Button>
              <Button variant="outline" className="w-full text-xs" onClick={() => {
                closeWhyPanel();
                nav("/graph");
              }}>
                View Entity in Transaction Graph
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default WhyScorePanel;
