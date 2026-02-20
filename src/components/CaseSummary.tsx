import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, AlertTriangle, Target, CheckSquare, Zap } from "lucide-react";
import type { CaseSummary } from "@/lib/ai/types";

interface CaseSummaryProps {
  summary: CaseSummary;
  expanded?: boolean;
}

const CaseSummary = ({ summary, expanded = false }: CaseSummaryProps) => {
  return (
    <div className="space-y-4">
      {/* Title & Overview */}
      <Card className="p-4 border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="space-y-2">
          <h3 className="text-lg font-bold">{summary.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{summary.overview}</p>
        </div>
      </Card>

      {/* Risk Assessment Alert */}
      <Alert className={
        summary.riskAssessment.includes("CRITICAL") ? "border-destructive/30 bg-destructive/5" :
        summary.riskAssessment.includes("HIGH") ? "border-warning/30 bg-warning/5" :
        "border-primary/30 bg-primary/5"
      }>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {summary.riskAssessment}
        </AlertDescription>
      </Alert>

      {expanded ? (
        <Tabs defaultValue="findings" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger className="text-xs" value="findings">Findings</TabsTrigger>
            <TabsTrigger className="text-xs" value="patterns">Patterns</TabsTrigger>
            <TabsTrigger className="text-xs" value="actions">Actions</TabsTrigger>
            <TabsTrigger className="text-xs" value="next">Next Steps</TabsTrigger>
          </TabsList>

          <TabsContent value="findings" className="space-y-2 mt-4">
            {summary.keyFindings.map((finding, idx) => (
              <Card key={idx} className="p-3">
                <div className="flex gap-2.5">
                  <Zap size={16} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-sm leading-relaxed">{finding}</p>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-2 mt-4">
            {summary.suspiciousPatterns.map((pattern, idx) => (
              <Card key={idx} className="p-3 flex items-start gap-2">
                <AlertTriangle size={16} className="text-destructive mt-0.5 shrink-0" />
                <p className="text-sm">{pattern}</p>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="actions" className="space-y-2 mt-4">
            {summary.recommendedActions.map((action, idx) => (
              <Card key={idx} className="p-3 flex items-start gap-2">
                <Target size={16} className="text-primary mt-0.5 shrink-0" />
                <p className="text-sm">{action}</p>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="next" className="space-y-2 mt-4">
            {summary.nextSteps.map((step, idx) => (
              <Card key={idx} className="p-3 flex items-start gap-2 bg-primary/5 border-primary/20">
                <CheckSquare size={16} className="text-primary mt-0.5 shrink-0" />
                <p className="text-sm font-medium">{step}</p>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {/* Key Findings - Compact */}
          {summary.keyFindings.length > 0 && (
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-2.5 flex items-center gap-2">
                <BookOpen size={14} /> Key Findings
              </h4>
              <ul className="space-y-1.5">
                {summary.keyFindings.slice(0, 2).map((finding, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
                {summary.keyFindings.length > 2 && (
                  <li className="text-xs text-primary font-medium">+{summary.keyFindings.length - 2} more findings</li>
                )}
              </ul>
            </Card>
          )}

          {/* Suspicious Patterns - Compact */}
          {summary.suspiciousPatterns.length > 0 && (
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-2.5 flex items-center gap-2">
                <AlertTriangle size={14} /> Detected Patterns
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {summary.suspiciousPatterns.slice(0, 3).map((pattern, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {pattern.slice(0, 30)}...
                  </Badge>
                ))}
                {summary.suspiciousPatterns.length > 3 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{summary.suspiciousPatterns.length - 3}
                  </Badge>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default CaseSummary;
