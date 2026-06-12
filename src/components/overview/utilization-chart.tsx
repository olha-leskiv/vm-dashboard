"use client";

import { useState } from "react";
import { Info } from "lucide-react";
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
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { UtilizationTrendPoint } from "@/types";

type Period = "live" | "1h" | "24h" | "7d" | "30d" | "365d";

const PERIOD_LABELS: Record<Period, string> = {
  live: "Real-time",
  "1h": "Hour",
  "24h": "Day",
  "7d": "Week",
  "30d": "Month",
  "365d": "Year",
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
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <CardTitle>Fleet Utilization</CardTitle>
            <UITooltip>
              <TooltipTrigger>
                <Info className="size-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>Average CPU and memory usage across running VMs</TooltipContent>
            </UITooltip>
          </div>
          <div className="flex gap-1">
            {(["live", "1h", "24h", "7d", "30d", "365d"] as Period[]).map((p) => (
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
                type="linear"
                dataKey="CPU"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#38bdf8",
                  stroke: "rgba(0,0,0,0.4)",
                  strokeWidth: 1,
                }}
                activeDot={{ r: 5, fill: "#38bdf8", strokeWidth: 0 }}
              />
              <Line
                type="linear"
                dataKey="Memory"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#a78bfa",
                  stroke: "rgba(0,0,0,0.4)",
                  strokeWidth: 1,
                }}
                activeDot={{ r: 5, fill: "#a78bfa", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
