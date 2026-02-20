import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HeatmapChartProps {
  data: { day: string; hour: string; value: number }[];
}

const HeatmapChart = ({ data }: HeatmapChartProps) => {
  const days = [...new Set(data.map((d) => d.day))];
  const hours = [...new Set(data.map((d) => d.hour))];
  const max = Math.max(...data.map((d) => d.value), 1);

  const getColor = (v: number) => {
    const ratio = v / max;
    if (ratio < 0.25) return "bg-primary/15";
    if (ratio < 0.5) return "bg-primary/30";
    if (ratio < 0.75) return "bg-primary/50";
    return "bg-gradient-to-br from-primary to-primary/70";
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        {/* header */}
        <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `64px repeat(${hours.length}, 1fr)` }}>
          <div />
          {hours.map((h) => (
            <div key={h} className="text-[10px] text-muted-foreground text-center font-semibold uppercase tracking-tight">{h}</div>
          ))}
        </div>
        {/* rows */}
        {days.map((day) => (
          <div key={day} className="grid gap-1 mb-2" style={{ gridTemplateColumns: `64px repeat(${hours.length}, 1fr)` }}>
            <div className="text-xs text-muted-foreground font-semibold flex items-center uppercase tracking-tight">{day}</div>
            {hours.map((hour) => {
              const cell = data.find((d) => d.day === day && d.hour === hour);
              const v = cell?.value ?? 0;
              return (
                <Tooltip key={hour}>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "h-8 rounded-md cursor-pointer transition-all hover:shadow-md hover:shadow-primary/30 border border-border/50 hover:border-primary/50",
                      getColor(v)
                    )} />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="p-3 min-w-[140px]">
                    <div className="space-y-1.5">
                      <p className="font-bold text-xs border-b pb-1.5 mb-1.5 text-primary">{day} · {hour}</p>
                      <div className="flex justify-between gap-6">
                        <span className="text-muted-foreground text-xs">Activity</span>
                        <span className="font-mono font-semibold">{v}</span>
                      </div>
                      <div className="flex justify-between gap-6">
                        <span className="text-muted-foreground text-xs">Est. Volume</span>
                        <span className="font-mono font-semibold text-primary">${(v * 1250).toLocaleString()}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatmapChart;
