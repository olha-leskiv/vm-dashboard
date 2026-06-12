"use client";

import { Info } from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  totalVms: number;
  runningVms: number;
  startingVms: number;
  stoppedVms: number;
}

const VM_SEGMENTS = [
  { key: "runningVms", label: "Running", color: "#34d399", textClass: "text-emerald-400" },
  { key: "startingVms", label: "Starting", color: "#fbbf24", textClass: "text-amber-400" },
  { key: "stoppedVms", label: "Stopped", color: "#52525b", textClass: "text-muted-foreground" },
] as const;

export function FleetStatusCard({ totalVms, runningVms, startingVms, stoppedVms }: Props) {
  const vmValues = { runningVms, startingVms, stoppedVms };
  const data = VM_SEGMENTS.map((s) => ({ name: s.label, value: vmValues[s.key], color: s.color })).filter(
    (d) => d.value > 0
  );

  return (
    <Card size="sm" className="min-w-0">
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle>VM Fleet</CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>Distribution of all VMs by current status</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-8">
        {/* donut */}
        <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
          <PieChart width={160} height={160}>
            <Pie
              data={data}
              cx={75}
              cy={75}
              innerRadius={40}
              outerRadius={70}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
          </PieChart>

        </div>

        {/* metrics */}
        <div className="flex flex-col gap-2 min-w-0 flex-1">


          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="ml-auto text-sm font-semibold tabular-nums">{totalVms}</span>
          </div>

          <div className="h-px bg-border" />

          {VM_SEGMENTS.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <span className="size-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className={`ml-auto text-sm font-semibold tabular-nums ${s.textClass}`}>
                {vmValues[s.key]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
