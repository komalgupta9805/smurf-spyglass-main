import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: "sm" | "md";
  className?: string;
  animated?: boolean;
}

const RiskBadge = ({ level, score, size = "sm", className, animated }: RiskBadgeProps) => (
  <Badge
    className={cn(
      "border font-semibold transition-all duration-300 hover:scale-110",
      size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1",
      level === "high" && "bg-risk-high-bg text-risk-high border-risk-high/30 hover:shadow-md hover:shadow-risk-high/20",
      level === "medium" && "bg-risk-medium-bg text-risk-medium border-risk-medium/30 hover:shadow-md hover:shadow-risk-medium/20",
      level === "low" && "bg-risk-low-bg text-risk-low border-risk-low/30 hover:shadow-md hover:shadow-risk-low/20",
      animated && "animate-pulse-glow",
      className
    )}
  >
    {score !== undefined ? score : level.charAt(0).toUpperCase() + level.slice(1)}
  </Badge>
);

export default RiskBadge;
