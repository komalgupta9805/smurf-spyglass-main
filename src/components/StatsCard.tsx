import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tooltip?: string;
  trend?: string;
  className?: string;
}

const StatsCard = ({ label, value, icon: Icon, tooltip, trend, className }: StatsCardProps) => (
  <Card className={cn("p-4 flex items-start gap-3 card-elevated border hover:scale-105 transition-all duration-300", className)}>
    <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-2.5 text-primary group-hover:from-primary/30">
      <Icon size={20} className="transition-transform duration-300 group-hover:scale-110" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">{label}</p>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle size={12} className="text-muted-foreground/60 shrink-0 hover:text-primary transition-colors" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-52 text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight mt-1 animate-fade-in">{value}</p>
      {trend && <p className="text-xs text-muted-foreground mt-1 font-medium">{trend}</p>}
    </div>
  </Card>
);

export default StatsCard;
