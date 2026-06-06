"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DashboardOrdersChart({
  data,
}: {
  data: Array<{
    day: string;
    orders: number;
  }>;
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(20,34,29,0.08)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(20,34,29,0.68)", fontSize: 12 }}
          />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(219,164,93,0.12)" }}
            contentStyle={{
              borderRadius: 20,
              border: "1px solid rgba(212,200,182,0.8)",
              background: "rgba(255,253,249,0.96)",
            }}
          />
          <Bar dataKey="orders" fill="var(--primary)" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

