import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Lightbulb, ListChecks, ChevronRight } from "lucide-react";
import type { InvestigationRecommendation } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

interface InvestigationGuideProps {
  recommendations: InvestigationRecommendation[];
  compact?: boolean;
}

const InvestigationGuide = ({ recommendations, compact = false }: InvestigationGuideProps) => {
  if (compact) {
    const highPriority = recommendations.filter(r => r.priority === "high");
    return (
      <Card className="p-3 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-2">
          <AlertCircle size={14} className="text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold">Investigation Recommendations</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {highPriority.length > 0 
                ? `${highPriority.length} high-priority action${highPriority.length > 1 ? 's' : ''}`
                : `${recommendations.length} recommendation${recommendations.length > 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const groupedByPriority = {
    high: recommendations.filter(r => r.priority === "high"),
    medium: recommendations.filter(r => r.priority === "medium"),
    low: recommendations.filter(r => r.priority === "low"),
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="high" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger className="text-xs" value="high">
            High ({groupedByPriority.high.length})
          </TabsTrigger>
          <TabsTrigger className="text-xs" value="medium">
            Medium ({groupedByPriority.medium.length})
          </TabsTrigger>
          <TabsTrigger className="text-xs" value="low">
            Low ({groupedByPriority.low.length})
          </TabsTrigger>
        </TabsList>

        {(['high', 'medium', 'low'] as const).map(priority => (
          <TabsContent key={priority} value={priority} className="space-y-2 mt-4">
            {groupedByPriority[priority].length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No {priority}-priority recommendations
              </div>
            ) : (
              groupedByPriority[priority].map((rec, idx) => (
                <Card key={idx} className={cn(
                  "p-4 space-y-2.5",
                  priority === "high" && "border-destructive/20 bg-destructive/5",
                  priority === "medium" && "border-warning/20 bg-warning/5",
                  priority === "low" && "border-muted/50 bg-muted/20"
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Lightbulb size={14} className={
                          priority === "high" ? "text-destructive" :
                          priority === "medium" ? "text-warning" :
                          "text-muted-foreground"
                        } />
                        {rec.action}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">{rec.rationale}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0 capitalize">
                      {priority}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 bg-background/50 rounded p-2.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Expected Findings</p>
                    <p className="text-sm">{rec.expectedFindings}</p>
                  </div>

                  <div className="space-y-1.5 bg-background/50 rounded p-2.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight flex items-center gap-1">
                      <ListChecks size={12} /> Suggested Approach
                    </p>
                    <p className="text-sm">{rec.suggestedApproach}</p>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default InvestigationGuide;
