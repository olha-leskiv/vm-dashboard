"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useFleetOverview, useAllVms } from "@/lib/query/hooks";
import { MOCK_USERS } from "@/mocks/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent, formatRelativeTime, utilizationColor } from "@/lib/utils/format";
import type { FleetUtilization, VM, VMStatus } from "@/types";
import { cn } from "@/lib/utils";

// ─── types ───────────────────────────────────────────────────────────────────

type Period = "live" | "24h" | "30d";

interface EnrichedVm {
  vmId: string;
  name: string;
  ownerName: string;
  lastActiveAt: string;
  cpuPercent: number;
  memoryPercent: number;
  status: VMStatus;
}

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

function enrichMetrics(fleet: FleetUtilization, vms: VM[]): EnrichedVm[] {
  const vmById = Object.fromEntries(vms.map((v) => [v.id, v]));
  const userById = Object.fromEntries(MOCK_USERS.map((u) => [u.id, u.name]));
  return fleet.vmMetrics.map((m) => {
    const vm = vmById[m.vmId];
    return {
      vmId: m.vmId,
      name: vm?.name ?? m.vmId,
      ownerName: vm ? (userById[vm.ownerId] ?? vm.ownerId) : "—",
      lastActiveAt: vm?.lastActiveAt ?? "",
      cpuPercent: m.cpuPercent,
      memoryPercent: m.memoryPercent,
      status: m.status,
    };
  });
}

// ─── KPI card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}

function KpiCard({ label, value, valueClass }: KpiCardProps) {
  return (
    <Card size="sm" className="min-w-0">
      <CardContent>
        <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2 leading-none">
          {label}
        </div>
        <div className={cn("text-2xl font-semibold tabular-nums tracking-tight", valueClass)}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── chart tooltips ───────────────────────────────────────────────────────────

function UtilTooltip({ active, payload, label }: {
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

function VmsTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <div className="text-muted-foreground mb-1">{label}</div>
      <div className="font-mono font-medium">{payload[0].value} running</div>
    </div>
  );
}

// ─── CPU bar ──────────────────────────────────────────────────────────────────

function CpuBar({ value }: { value: number }) {
  const barColor =
    value >= 85 ? "bg-destructive" : value >= 70 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className={cn("tabular-nums shrink-0 w-7 text-right", utilizationColor(value))}>
        {value}%
      </span>
      <div className="flex-1 bg-muted rounded-full h-1.5 min-w-[40px]">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ─── table header row ─────────────────────────────────────────────────────────

function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("text-[11px] font-medium text-muted-foreground uppercase tracking-wider", className)}>
      {children}
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

// ─── loading skeleton ─────────────────────────────────────────────────────────

export function OverviewSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
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

  const startingCount = fleet.vmMetrics.filter((m) => m.status === "starting").length;

  const enriched = enrichMetrics(fleet, vms);

  const hotVms = [...enriched]
    .filter((m) => m.status === "running" && m.cpuPercent > 0)
    .sort((a, b) => b.cpuPercent - a.cpuPercent)
    .slice(0, 5);

  const idleVms = [...enriched]
    .filter((m) => m.status === "stopped" || m.status === "error" || m.cpuPercent <= 10)
    .sort((a, b) => a.cpuPercent - b.cpuPercent)
    .slice(0, 5);

  const trendData = getChartData(fleet, period).map((p) => ({
    time: formatHour(p.timestamp),
    CPU: p.cpuPercent,
    Memory: p.memoryPercent,
    Running: p.runningVms,
  }));

  const PERIOD_LABELS: Record<Period, string> = {
    live: "Real-time",
    "24h": "Last 24 hours",
    "30d": "Last 30 days",
  };

  return (
    <div className="space-y-5">
      {/* header */}
      <PageHeader title="Overview" />

      {/* ── KPI row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard label="Total" value={fleet.totalVms} />
        <KpiCard label="Running" value={fleet.runningVms} valueClass="text-emerald-400" />
        <KpiCard label="Starting" value={startingCount} valueClass="text-amber-400" />
        <KpiCard label="Idle" value={fleet.stoppedVms} valueClass="text-muted-foreground" />
        <KpiCard label="Total Users" value={fleet.totalUsers} />
        <KpiCard
          label="Avg CPU"
          value={formatPercent(fleet.avgCpuUtilizationPercent)}
          valueClass={utilizationColor(fleet.avgCpuUtilizationPercent)}
        />
        <KpiCard
          label="Avg Memory"
          value={formatPercent(fleet.avgMemoryUtilizationPercent)}
          valueClass={utilizationColor(fleet.avgMemoryUtilizationPercent)}
        />
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fleet Utilization */}
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
            {trendData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No data for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
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
                  <Tooltip content={<UtilTooltip />} />
                  <Line type="monotone" dataKey="CPU" stroke="#38bdf8" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="Memory" stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Running VMs Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Running VMs Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="runningGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<VmsTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Running"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#runningGrad)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hot VMs */}
        <Card>
          <CardHeader>
            <CardTitle>Top CPU Utilization (Hot VMs)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* column headers */}
            <div className="grid grid-cols-[1fr_auto_minmax(80px,1.5fr)] gap-x-3 mb-2">
              <TableHead>VM</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>CPU</TableHead>
            </div>
            {hotVms.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No hot VMs.</p>
            ) : (
              <div className="space-y-0">
                {hotVms.map((m) => (
                  <div
                    key={m.vmId}
                    className="grid grid-cols-[1fr_auto_minmax(80px,1.5fr)] gap-x-3 items-center py-2 border-b border-border/40 last:border-0 text-xs"
                  >
                    <span className="font-mono truncate">{m.name}</span>
                    <span className="text-muted-foreground whitespace-nowrap">{m.ownerName}</span>
                    <CpuBar value={m.cpuPercent} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Idle VMs */}
        <Card>
          <CardHeader>
            <CardTitle>Idle VMs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 mb-2">
              <TableHead>VM</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Last Activity</TableHead>
            </div>
            {idleVms.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No idle VMs.</p>
            ) : (
              <div className="space-y-0">
                {idleVms.map((m) => (
                  <div
                    key={m.vmId}
                    className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center py-2 border-b border-border/40 last:border-0 text-xs"
                  >
                    <span className="font-mono truncate">{m.name}</span>
                    <span className="text-muted-foreground whitespace-nowrap">{m.ownerName}</span>
                    <div className="flex items-center gap-1.5">
                      {m.lastActiveAt && (
                        <span className="text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(m.lastActiveAt)}
                        </span>
                      )}
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] py-0 h-4 px-1.5 shrink-0", STATUS_STYLES[m.status])}
                      >
                        {m.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Hourly Cost</span>
                <span className="font-mono font-semibold tabular-nums">
                  ${fleet.totalHourlyCost.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Month-to-Date Cost</span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatMoney(fleet.monthToDateCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Projected Monthly Cost</div>
                  <div className="text-xs text-muted-foreground/60 mt-0.5">Based on current usage</div>
                </div>
                <span className="font-mono font-semibold tabular-nums text-emerald-400">
                  {formatMoney(fleet.projectedMonthlyCost)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
