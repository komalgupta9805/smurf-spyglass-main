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
  <Card className={cn("p-4 flex items-start gap-3 hover:shadow-md transition-shadow border", className)}>
    <div className="rounded-lg bg-accent p-2.5 text-primary">
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1">
        <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle size={12} className="text-muted-foreground/60 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-52 text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="text-xl font-bold tracking-tight mt-0.5">{value}</p>
      {trend && <p className="text-xs text-muted-foreground mt-0.5">{trend}</p>}
    </div>
  </Card>
);

export default StatsCard;
