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
import { useFleetOverview, useAllVms } from "@/lib/query/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent, utilizationColor } from "@/lib/utils/format";
import type { FleetUtilization, VMMetricSnapshot, VMStatus } from "@/types";
import { cn } from "@/lib/utils";

// ─── types ───────────────────────────────────────────────────────────────────

type Period = "live" | "24h" | "30d";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatMoney(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getChartData(fleet: FleetUtilization, period: Period) {
  const trend = fleet.utilizationTrend;
  if (period === "live") return trend.slice(-6);
  return trend;
}

// ─── KPI card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  valueClass?: string;
}

function KpiCard({ label, value, sub, valueClass }: KpiCardProps) {
  return (
    <Card size="sm" className="min-w-0">
      <CardContent>
        <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2 leading-none">
          {label}
        </div>
        <div className={cn("text-2xl font-semibold tabular-nums tracking-tight", valueClass)}>
          {value}
        </div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

// ─── chart tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
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

// ─── status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<VMStatus, string> = {
  running: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  stopped: "bg-muted text-muted-foreground border-transparent",
  starting: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  stopping: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

// ─── VM distribution row ──────────────────────────────────────────────────────

interface VmDistRowProps {
  name: string;
  cpuPercent: number;
  memoryPercent: number;
  status: VMStatus;
}

function VmDistRow({ name, cpuPercent, memoryPercent, status }: VmDistRowProps) {
  return (
    <div className="flex items-center gap-3 py-2 text-xs border-b border-border/40 last:border-0">
      <span className="font-mono flex-1 truncate text-foreground/80">{name}</span>
      <Badge
        variant="outline"
        className={cn("shrink-0 text-[10px] py-0 h-4 px-1.5", STATUS_STYLES[status])}
      >
        {status}
      </Badge>
      <span className={cn("tabular-nums w-14 text-right shrink-0", utilizationColor(cpuPercent))}>
        {formatPercent(cpuPercent)} CPU
      </span>
      <span
        className={cn("tabular-nums w-14 text-right shrink-0", utilizationColor(memoryPercent))}
      >
        {formatPercent(memoryPercent)} MEM
      </span>
    </div>
  );
}

// ─── loading skeleton ─────────────────────────────────────────────────────────

export function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── main dashboard ───────────────────────────────────────────────────────────

export function OverviewDashboard() {
  const { data: fleetRes } = useFleetOverview();
  const { data: vmsRes } = useAllVms();
  const [period, setPeriod] = useState<Period>("24h");

  const fleet = fleetRes.data;
  const vms = vmsRes.data;

  const nameById = Object.fromEntries(vms.map((v) => [v.id, v.name]));

  const chartData = getChartData(fleet, period).map((p) => ({
    time: formatHour(p.timestamp),
    CPU: p.cpuPercent,
    Memory: p.memoryPercent,
  }));

  const hotVms: VMMetricSnapshot[] = [...fleet.vmMetrics]
    .filter((m) => m.status === "running" && m.cpuPercent > 0)
    .sort((a, b) => b.cpuPercent - a.cpuPercent)
    .slice(0, 5);

  const idleVms: VMMetricSnapshot[] = [...fleet.vmMetrics]
    .filter((m) => m.status === "stopped" || m.status === "error" || m.cpuPercent <= 10)
    .sort((a, b) => a.cpuPercent - b.cpuPercent)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1>Overview</h1>
        <p className="text-muted-foreground mt-0.5">
          Infrastructure health and fleet efficiency at a glance.
        </p>
      </div>

      {/* ── KPI row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard label="Total VMs" value={fleet.totalVms} />
        <KpiCard
          label="Running"
          value={fleet.runningVms}
          valueClass="text-emerald-400"
        />
        <KpiCard
          label="Stopped"
          value={fleet.stoppedVms}
          valueClass="text-muted-foreground"
        />
        <KpiCard label="Total Users" value={fleet.totalUsers} />
        <KpiCard
          label="Avg CPU"
          value={formatPercent(fleet.avgCpuUtilizationPercent)}
          sub={`Peak ${formatPercent(fleet.peakCpuUtilizationPercent)}`}
          valueClass={utilizationColor(fleet.avgCpuUtilizationPercent)}
        />
        <KpiCard
          label="Avg Memory"
          value={formatPercent(fleet.avgMemoryUtilizationPercent)}
          sub={`Peak ${formatPercent(fleet.peakMemoryUtilizationPercent)}`}
          valueClass={utilizationColor(fleet.avgMemoryUtilizationPercent)}
        />
        <KpiCard
          label="Projected"
          value={formatMoney(fleet.projectedMonthlyCost)}
          sub="this month"
        />
      </div>

      {/* ── Fleet Utilization ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Fleet Utilization</CardTitle>
            <div className="flex gap-1">
              {(["live", "24h", "30d"] as Period[]).map((p) => (
                <Button
                  key={p}
                  size="xs"
                  variant={period === p ? "secondary" : "ghost"}
                  onClick={() => setPeriod(p)}
                >
                  {p === "live" ? "Live" : p === "24h" ? "24h" : "30 days"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No data available for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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
          <div className="flex gap-5 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#38bdf8]" />
              CPU
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#a78bfa]" />
              Memory
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Fleet Distribution ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Hot VMs</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Running VMs with highest CPU utilization
            </p>
          </CardHeader>
          <CardContent>
            {hotVms.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No running VMs.</p>
            ) : (
              hotVms.map((m) => (
                <VmDistRow
                  key={m.vmId}
                  name={nameById[m.vmId] ?? m.vmId}
                  cpuPercent={m.cpuPercent}
                  memoryPercent={m.memoryPercent}
                  status={m.status}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Idle VMs</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Stopped, errored, or CPU &le;10%
            </p>
          </CardHeader>
          <CardContent>
            {idleVms.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No idle VMs.</p>
            ) : (
              idleVms.map((m) => (
                <VmDistRow
                  key={m.vmId}
                  name={nameById[m.vmId] ?? m.vmId}
                  cpuPercent={m.cpuPercent}
                  memoryPercent={m.memoryPercent}
                  status={m.status}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Cost Summary ───────────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3">Cost Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card size="sm">
            <CardContent>
              <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2 leading-none">
                Hourly Rate
              </div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">
                ${fleet.totalHourlyCost.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">current fleet cost / hr</div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent>
              <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2 leading-none">
                Month-to-Date
              </div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">
                {formatMoney(fleet.monthToDateCost)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">accrued this month</div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent>
              <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2 leading-none">
                Projected Monthly
              </div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">
                {formatMoney(fleet.projectedMonthlyCost)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">at current usage</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
