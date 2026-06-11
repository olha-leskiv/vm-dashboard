"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UtilizationTrendPoint } from "@/types";

type Period = "live" | "24h" | "30d";

const PERIOD_LABELS: Record<Period, string> = {
  live: "Real-time",
  "24h": "Last 24 hours",
  "30d": "Last 30 days",
};

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <div className="text-muted-foreground mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-mono font-medium ml-auto pl-4">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

export function UtilizationChart({ trend }: { trend: UtilizationTrendPoint[] }) {
  const [period, setPeriod] = useState<Period>("24h");

  const filtered = period === "live" ? trend.slice(-6) : trend;
  const data = filtered.map((p) => ({
    time: formatHour(p.timestamp),
    CPU: p.cpuPercent,
    Memory: p.memoryPercent,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle>Fleet Utilization</CardTitle>
          <div className="flex gap-1">
            {(["live", "24h", "30d"] as Period[]).map((p) => (
              <Button
                key={p}
                size="xs"
                variant={period === p ? "secondary" : "ghost"}
                onClick={() => setPeriod(p)}
              >
                {PERIOD_LABELS[p]}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex gap-5 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#38bdf8]" />
            CPU Utilization (%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#a78bfa]" />
            Memory Utilization (%)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No data for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.07)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="CPU"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="Memory"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
