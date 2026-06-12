"use client";

import { Info } from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";
import { VmStatusIconChip } from "@/components/overview/vm-status-icon-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  totalVms: number;
  runningVms: number;
  startingVms: number;
  stoppedVms: number;
}

const VM_SEGMENTS = [
  {
    key: "runningVms",
    label: "Running",
    status: "running" as const,
    gradientId: "fleet-grad-running",
    gradFrom: "var(--color-emerald-500)",
    gradTo: "var(--color-emerald-600)",
    textClass: "text-emerald-400",
  },
  {
    key: "startingVms",
    label: "Starting",
    status: "starting" as const,
    gradientId: "fleet-grad-starting",
    gradFrom: "var(--color-yellow-300)",
    gradTo: "var(--color-amber-600)",
    textClass: "text-amber-400",
  },
  {
    key: "stoppedVms",
    label: "Stopped",
    status: "stopped" as const,
    gradientId: "fleet-grad-stopped",
    gradFrom: "var(--color-zinc-400)",
    gradTo: "var(--color-zinc-800)",
    textClass: "text-muted-foreground",
  },
] as const;

export function FleetStatusCard({ totalVms, runningVms, startingVms, stoppedVms }: Props) {
  const vmValues = { runningVms, startingVms, stoppedVms };
  const data = VM_SEGMENTS.map((s) => ({
    name: s.label,
    value: vmValues[s.key],
    gradientId: s.gradientId,
  })).filter((d) => d.value > 0);

  return (
    <Card className="min-w-0 h-full">
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle>VM Fleet</CardTitle>
          <Tooltip>
            <TooltipTrigger aria-label="About VM fleet">
              <Info className="size-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>Distribution of all VMs by current status</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-8">
        {/* donut */}
        <div role="img" aria-label={`Donut chart: ${runningVms} running, ${startingVms} starting, ${stoppedVms} stopped out of ${totalVms} total VMs`} className="relative shrink-0" style={{ width: 160, height: 160 }}>
          <PieChart width={160} height={160}>
            <defs>
              {VM_SEGMENTS.map((s) => (
                <linearGradient
                  key={s.key}
                  id={s.gradientId}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                  gradientUnits="objectBoundingBox"
                >
                  <stop offset="0%" stopColor={s.gradFrom} />
                  <stop offset="100%" stopColor={s.gradTo} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx={75}
              cy={75}
              innerRadius={35}
              outerRadius={70}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              paddingAngle={1}
              cornerRadius={1}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={`url(#${d.gradientId})`} stroke="var(--color-card)" strokeWidth={1} />
              ))}
            </Pie>
          </PieChart>

        </div>

        {/* metrics */}
        <div className="flex flex-col gap-2 min-w-0 flex-1">


          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Total</p>
            <p className="ml-auto text-sm font-semibold tabular-nums">{totalVms}</p>
          </div>

          <div className="h-px bg-border" />

          {VM_SEGMENTS.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <VmStatusIconChip status={s.status} size="compact" />
              <p className="text-muted-foreground">{s.label}</p>
              <p className={`ml-auto text-sm font-semibold tabular-nums ${s.textClass}`}>
                {vmValues[s.key]}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
