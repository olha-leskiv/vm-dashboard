"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useVmMetrics } from "@/lib/query/hooks";
import type { VmMetricTrendPoint } from "@/types";

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
      <div className="text-muted-foreground mb-1.5">{label}</div>
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

function Chart({ trend }: { trend: VmMetricTrendPoint[] }) {
  const data = trend.map((p) => ({
    time: formatHour(p.timestamp),
    CPU: p.cpuPercent,
    Memory: p.memoryPercent,
  }));

  return (
    <div className="space-y-2">
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#38bdf8]" />
          CPU
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#a78bfa]" />
          Memory
        </span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="linear"
            dataKey="CPU"
            stroke="#38bdf8"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: "#38bdf8", strokeWidth: 0 }}
          />
          <Line
            type="linear"
            dataKey="Memory"
            stroke="#a78bfa"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: "#a78bfa", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VmUtilizationChart({ vmId }: { vmId: string }) {
  const { data, isPending, isError } = useVmMetrics(vmId);

  if (isPending) return <Skeleton className="h-[140px] w-full rounded-lg" />;
  if (isError) return <p className="text-xs text-muted-foreground">Failed to load metrics.</p>;

  return <Chart trend={data.data} />;
}
