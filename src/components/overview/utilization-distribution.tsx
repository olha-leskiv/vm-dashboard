"use client";

import Link from "next/link";
import { useState } from "react";
import { Info } from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VmMetric {
  cpu: number;
  memory: number;
}

interface Props {
  metrics: VmMetric[];
  totalVms: number;
}

const BUCKETS = [
  { label: "> 80% (High)", min: 80, max: 101, color: "#ef4444", textClass: "text-red-400" },
  { label: "50 – 80% (Elevated)", min: 50, max: 80, color: "#f97316", textClass: "text-orange-400" },
  { label: "20 – 50% (Normal)", min: 20, max: 50, color: "#34d399", textClass: "text-emerald-400" },
  { label: "< 20% (Low)", min: 0, max: 20, color: "#60a5fa", textClass: "text-blue-400" },
] as const;

type Mode = "cpu" | "memory";

export function UtilizationDistribution({ metrics, totalVms }: Props) {
  const [mode, setMode] = useState<Mode>("cpu");

  const counts = BUCKETS.map((b) => ({
    ...b,
    count: metrics.filter((m) => {
      const v = mode === "cpu" ? m.cpu : m.memory;
      return v >= b.min && v < b.max;
    }).length,
  }));

  const pieData = counts.filter((b) => b.count > 0).map((b) => ({
    name: b.label,
    value: b.count,
    color: b.color,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <CardTitle>Utilization Distribution</CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="size-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>Breakdown of VMs by resource utilization bucket</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex gap-1">
            <Button size="xs" variant={mode === "cpu" ? "secondary" : "ghost"} onClick={() => setMode("cpu")}>
              CPU
            </Button>
            <Button size="xs" variant={mode === "memory" ? "secondary" : "ghost"} onClick={() => setMode("memory")}>
              Memory
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-6">
          {/* donut */}
          <div className="relative shrink-0" style={{ width: 200, height: 200 }}>
            <PieChart width={200} height={200}>
              <Pie
                data={pieData}
                cx={95}
                cy={95}
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
              >
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold tabular-nums leading-none">{totalVms}</span>
              <span className="text-[10px] text-muted-foreground leading-none mt-1">Total VMs</span>
            </div>
          </div>

          {/* legend */}
          <div className="flex flex-col gap-2.5 flex-1 min-w-0">
            {counts.map((b) => {
              const pct = totalVms > 0 ? Math.round((b.count / totalVms) * 100) : 0;
              return (
                <div key={b.label} className="flex items-center gap-2 text-xs">
                  <span className="size-2 rounded-full shrink-0" style={{ background: b.color }} />
                  <span className="text-muted-foreground truncate">{b.label}</span>
                  <span className={`ml-auto font-semibold tabular-nums shrink-0 ${b.textClass}`}>
                    {b.count}{" "}
                    <span className="font-normal text-muted-foreground">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <span className="text-xs text-muted-foreground">High utilization VMs</span>
          <Link
            href="/admin/fleet?sort=cpuUsagePercent&dir=desc&status=running"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
