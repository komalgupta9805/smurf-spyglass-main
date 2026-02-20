import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { RiskExplanation } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

interface RiskBreakdownProps {
  explanation: RiskExplanation;
  showDetails?: boolean;
}

const RiskBreakdown = ({ explanation, showDetails = true }: RiskBreakdownProps) => {
  const getRiskIcon = () => {
    if (explanation.level === "high") return <AlertTriangle className="text-destructive" size={18} />;
    if (explanation.level === "medium") return <AlertTriangle className="text-warning" size={18} />;
    return <CheckCircle2 className="text-success" size={18} />;
  };

  const getRiskColor = () => {
    if (explanation.level === "high") return "text-destructive";
    if (explanation.level === "medium") return "text-warning";
    return "text-success";
  };

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <Card className="p-4 border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getRiskIcon()}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Risk Score</p>
              <p className={cn("text-2xl font-bold", getRiskColor())}>
                {explanation.score}
              </p>
            </div>
          </div>
          <Badge className={cn(
            explanation.level === "high" ? "bg-destructive/10 text-destructive border-destructive/30" :
            explanation.level === "medium" ? "bg-warning/10 text-warning border-warning/30" :
            "bg-success/10 text-success border-success/30"
          )}>
            {explanation.level.charAt(0).toUpperCase() + explanation.level.slice(1)} Risk
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{explanation.summary}</p>
      </Card>

      {showDetails && explanation.mainFactors.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">Contributing Factors</h4>
          <div className="space-y-3">
            {explanation.mainFactors.map((factor) => (
              <div key={factor.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="text-xs font-medium text-muted-foreground cursor-help flex items-center gap-1">
                        {factor.name}
                        <Info size={12} className="opacity-50" />
                      </label>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="space-y-1.5 text-xs">
                        <p className="font-semibold">{factor.name}</p>
                        <p>{factor.contribution}</p>
                        <div className="pt-1.5 border-t text-muted-foreground space-y-0.5">
                          {factor.examples.map((ex, i) => (
                            <p key={i}>• {ex}</p>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-xs font-bold text-primary">{factor.weight}%</span>
                </div>
                <Progress value={factor.weight} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {explanation.contextualNotes && (
        <Card className="p-3 bg-muted/30 border-muted/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-tight mb-2">Context</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{explanation.contextualNotes}</p>
        </Card>
      )}
    </div>
  );
};

export default RiskBreakdown;
