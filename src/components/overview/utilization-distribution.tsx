"use client";

import { useRouter } from "next/navigation";
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
  {
    key: "high",
    label: "> 80% (High)",
    min: 80,
    max: 101,
    gradientId: "util-grad-high",
    gradFrom: "var(--color-red-500)",
    gradTo: "var(--color-rose-700)",
    textClass: "text-red-400",
  },
  {
    key: "elevated",
    label: "50 – 80% (Elevated)",
    min: 50,
    max: 80,
    gradientId: "util-grad-elevated",
    gradFrom: "var(--color-amber-300)",
    gradTo: "var(--color-orange-600)",
    textClass: "text-orange-400",
  },
  {
    key: "normal",
    label: "20 – 50% (Normal)",
    min: 20,
    max: 50,
    gradientId: "util-grad-normal",
    gradFrom: "var(--color-green-400)",
    gradTo: "var(--color-emerald-600)",
    textClass: "text-emerald-400",
  },
  {
    key: "low",
    label: "< 20% (Low)",
    min: 0,
    max: 20,
    gradientId: "util-grad-low",
    gradFrom: "var(--color-sky-400)",
    gradTo: "var(--color-blue-700)",
    textClass: "text-blue-400",
  },
] as const;

type Mode = "cpu" | "memory";

export function UtilizationDistribution({ metrics, totalVms }: Props) {
  const router = useRouter();
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
    gradientId: b.gradientId,
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
              <defs>
                {BUCKETS.map((b) => (
                  <linearGradient
                    key={b.key}
                    id={b.gradientId}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0%" stopColor={b.gradFrom} />
                    <stop offset="100%" stopColor={b.gradTo} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={pieData}
                cx={95}
                cy={95}
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                paddingAngle={1}
                cornerRadius={1}
              >
                {pieData.map((d, i) => (
                  <Cell key={i} fill={`url(#${d.gradientId})`} stroke="var(--color-card)" strokeWidth={1} />
                ))}
              </Pie>
            </PieChart>

          </div>

          {/* legend */}
          <div className="flex flex-col gap-2.5 flex-1 min-w-0">
            {counts.map((b) => {
              const pct = totalVms > 0 ? Math.round((b.count / totalVms) * 100) : 0;
              return (
                <div key={b.label} className="flex items-center gap-2 ">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${b.gradFrom}, ${b.gradTo})`,
                    }}
                  />
                  <p className="text-muted-foreground truncate">{b.label}</p>
                  <p className={`ml-auto font-semibold tabular-nums shrink-0 ${b.textClass}`}>
                    {b.count}{" "}
                    <span className="font-normal text-muted-foreground">/ {pct}%</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <span className="text-xs text-muted-foreground">High utilization VMs</span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              router.push("/admin/fleet?sort=cpuUsagePercent&dir=desc&status=running");
            }}
          >
            View all
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
