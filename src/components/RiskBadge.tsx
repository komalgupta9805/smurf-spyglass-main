import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: "sm" | "md";
  className?: string;
}

const RiskBadge = ({ level, score, size = "sm", className }: RiskBadgeProps) => (
  <Badge
    className={cn(
      "border-0 font-semibold",
      size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1",
      level === "high" && "bg-risk-high-bg text-risk-high",
      level === "medium" && "bg-risk-medium-bg text-risk-medium",
      level === "low" && "bg-risk-low-bg text-risk-low",
      className
    )}
  >
    {score !== undefined ? score : level.charAt(0).toUpperCase() + level.slice(1)}
  </Badge>
);

export default RiskBadge;
