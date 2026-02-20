import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { useMemo } from "react";

const ActivityHeatmap = () => {
  const { accounts } = useAppStore();

  const data = useMemo(() => {
    // Generate time-series activity data from accounts
    const hourlyActivity: Record<string, { hour: number; transactionCount: number; uniqueAccounts: number; totalAmount: number }> = {};

    for (let i = 0; i < 24; i++) {
      hourlyActivity[i] = {
        hour: i,
        transactionCount: 0,
        uniqueAccounts: 0,
        totalAmount: 0,
      };
    }

    accounts.forEach(account => {
      if (account.activityHours) {
        account.activityHours.forEach(hour => {
          if (hourlyActivity[hour]) {
            hourlyActivity[hour].transactionCount += 1;
            hourlyActivity[hour].uniqueAccounts += 1;
          }
        });
      }
    });

    return Object.values(hourlyActivity);
  }, [accounts]);

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="text-sm">Activity Timeline</CardTitle>
        <CardDescription>Transaction volume by hour of day</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="hour" 
              label={{ value: "Hour of Day", position: "insideBottomRight", offset: -5 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: "Activity Count", angle: -90, position: "insideLeft" }}
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
            <Line 
              type="monotone" 
              dataKey="transactionCount" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="Transactions"
            />
            <Line 
              type="monotone" 
              dataKey="uniqueAccounts" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="Unique Accounts"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
