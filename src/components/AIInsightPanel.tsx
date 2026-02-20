import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Lightbulb, Zap, BookOpen, X } from "lucide-react";
import PatternExplanation from "./PatternExplanation";
import RiskBreakdown from "./RiskBreakdown";
import InvestigationGuide from "./InvestigationGuide";
import type { PatternInterpretation, RiskExplanation, InvestigationRecommendation } from "@/lib/ai/types";
import { useState } from "react";

interface AIInsightPanelProps {
  patterns: Map<string, PatternInterpretation>;
  riskExplanations: Map<string, RiskExplanation>;
  recommendations: InvestigationRecommendation[];
  onClose?: () => void;
  panelOpen?: boolean;
}

const AIInsightPanel = ({
  patterns,
  riskExplanations,
  recommendations,
  onClose,
  panelOpen = true,
}: AIInsightPanelProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const patternArray = Array.from(patterns.values());
  const riskArray = Array.from(riskExplanations.values());

  return (
    <Sheet open={panelOpen} onOpenChange={(open) => !open && onClose?.()}>
      <SheetContent side="right" className="w-full sm:w-[500px] max-w-none overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Lightbulb size={18} className="text-primary" />
            AI Insights & Interpretations
          </SheetTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Natural language explanations of detected patterns and risk factors
          </p>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger className="text-xs" value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="patterns">
              Patterns ({patternArray.length})
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="recommendations">
              Recommendations
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-3 mt-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex gap-2 mb-2">
                <Lightbulb size={16} className="text-primary mt-0.5 shrink-0" />
                <h4 className="font-semibold text-sm">AI Analysis Summary</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This panel provides natural language explanations generated from deterministic pattern detection.
                All insights are derived from the graph-based analysis engine and risk scores remain unchanged.
              </p>
            </Card>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Quick Stats</p>
              <div className="grid grid-cols-3 gap-2">
                <Card className="p-2.5 text-center">
                  <p className="text-lg font-bold text-primary">{patternArray.length}</p>
                  <p className="text-[10px] text-muted-foreground">Patterns</p>
                </Card>
                <Card className="p-2.5 text-center">
                  <p className="text-lg font-bold text-primary">{riskArray.length}</p>
                  <p className="text-[10px] text-muted-foreground">Accounts</p>
                </Card>
                <Card className="p-2.5 text-center">
                  <p className="text-lg font-bold text-primary">{recommendations.length}</p>
                  <p className="text-[10px] text-muted-foreground">Recommendations</p>
                </Card>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Top Priority Actions</p>
                <div className="space-y-1.5">
                  {recommendations.slice(0, 3).map((rec, idx) => (
                    <Card key={idx} className="p-2.5 bg-muted/30 border-muted/50">
                      <div className="flex gap-2 items-start">
                        <Zap size={12} className="text-primary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-2">{rec.action}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{rec.rationale}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-3 mt-4">
            {patternArray.length === 0 ? (
              <Card className="p-4 text-center text-muted-foreground text-sm">
                No patterns detected in current analysis
              </Card>
            ) : (
              patternArray.map((pattern, idx) => (
                <PatternExplanation key={idx} interpretation={pattern} />
              ))
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-3 mt-4">
            {recommendations.length === 0 ? (
              <Card className="p-4 text-center text-muted-foreground text-sm">
                No investigations recommendations at this time
              </Card>
            ) : (
              <InvestigationGuide recommendations={recommendations} compact={false} />
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <p className="text-[10px] text-muted-foreground text-center">
            All insights are explanatory only. Risk scores and detection remain unchanged.
            Human review required for any investigative actions.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AIInsightPanel;
