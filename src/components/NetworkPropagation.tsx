import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { useMemo } from "react";

const NetworkPropagation = () => {
  const { rings } = useAppStore();

  const data = useMemo(() => {
    // Generate time-series network propagation data
    const timePoints = Array.from({ length: 12 }, (_, i) => ({
      time: `T${i * 5}`,
      propagationSize: Math.min(rings.length * (i + 1) * 0.15 + Math.random() * 5, rings.length * 2),
      newConnections: Math.max(Math.floor((i + 1) * 2 + Math.random() * 3), 0),
      averageDistance: Math.max(5 - i * 0.3, 1.5),
    }));
    return timePoints;
  }, [rings]);

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="text-sm">Network Propagation Trend</CardTitle>
        <CardDescription>Spread of suspicious patterns over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="propagationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="connectionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time"
              label={{ value: "Time Period", position: "insideBottomRight", offset: -5 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: "Propagation Metric", angle: -90, position: "insideLeft" }}
              tick={{ fontSize: 12 }}
            />
            <RTooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="propagationSize" 
              stroke="hsl(var(--primary))" 
              fill="url(#propagationGradient)"
              name="Network Size"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="newConnections" 
              stroke="hsl(var(--chart-3))" 
              fill="url(#connectionGradient)"
              name="New Connections"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default NetworkPropagation;
