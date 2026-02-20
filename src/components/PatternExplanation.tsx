import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown, Users, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PatternInterpretation } from "@/lib/ai/types";

interface PatternExplanationProps {
  interpretation: PatternInterpretation;
  compact?: boolean;
}

const PatternExplanation = ({ interpretation, compact = false }: PatternExplanationProps) => {
  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 text-xs cursor-help">
            <AlertCircle size={14} className="text-primary opacity-70" />
            <span className="text-muted-foreground">{interpretation.patternType}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2 text-xs">
            <p className="font-semibold">{interpretation.explanation}</p>
            <p className="text-muted-foreground italic">{interpretation.flowDescription}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Card className="p-4 space-y-3 border-primary/20 bg-primary/5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-sm capitalize">{interpretation.patternType} Detected</h4>
          <p className="text-xs text-muted-foreground mt-1">{interpretation.explanation}</p>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">
          {Math.round(interpretation.confidence * 100)}% confidence
        </Badge>
      </div>

      <div className="bg-background/50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Risk Indicator</p>
        <div className="flex items-start gap-2">
          <TrendingDown size={14} className="text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{interpretation.riskIndicator}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">Transaction Flow</p>
        <p className="text-sm leading-relaxed">{interpretation.flowDescription}</p>
      </div>

      {interpretation.keyAccounts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight flex items-center gap-1">
            <Users size={12} /> Key Accounts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {interpretation.keyAccounts.map(id => (
              <Badge key={id} variant="secondary" className="text-xs font-mono">
                {id.slice(0, 8)}...
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded p-2">
        <Zap size={12} className="mt-0.5 shrink-0" />
        <span>{interpretation.timeline}</span>
      </div>
    </Card>
  );
};

export default PatternExplanation;
