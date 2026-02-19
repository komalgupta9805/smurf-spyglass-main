import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapChartProps {
  data: { day: string; hour: string; value: number }[];
}

const HeatmapChart = ({ data }: HeatmapChartProps) => {
  const days = [...new Set(data.map((d) => d.day))];
  const hours = [...new Set(data.map((d) => d.hour))];
  const max = Math.max(...data.map((d) => d.value), 1);

  const getColor = (v: number) => {
    const ratio = v / max;
    if (ratio < 0.25) return "bg-accent";
    if (ratio < 0.5) return "bg-primary/20";
    if (ratio < 0.75) return "bg-primary/40";
    return "bg-primary/70";
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        {/* header */}
        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `64px repeat(${hours.length}, 1fr)` }}>
          <div />
          {hours.map((h) => (
            <div key={h} className="text-[10px] text-muted-foreground text-center font-medium">{h}</div>
          ))}
        </div>
        {/* rows */}
        {days.map((day) => (
          <div key={day} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `64px repeat(${hours.length}, 1fr)` }}>
            <div className="text-xs text-muted-foreground font-medium flex items-center">{day}</div>
            {hours.map((hour) => {
              const cell = data.find((d) => d.day === day && d.hour === hour);
              const v = cell?.value ?? 0;
              return (
                <Tooltip key={hour}>
                  <TooltipTrigger asChild>
                    <div className={`h-7 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary/30 ${getColor(v)}`} />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="p-2 min-w-[120px]">
                    <div className="space-y-1">
                      <p className="font-bold text-xs border-b pb-1 mb-1">{day} · {hour}</p>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Transactions</span>
                        <span className="font-mono">{v}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Volume</span>
                        <span className="font-mono">${(v * 1250).toLocaleString()}</span>
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
