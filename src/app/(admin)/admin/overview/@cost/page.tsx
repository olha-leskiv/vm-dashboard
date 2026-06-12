import type { LucideIcon } from "lucide-react";
import { CalendarDays, Clock, Info, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { cachedGetFleetOverview } from "@/lib/api/cached";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function formatMoney(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function CostMetric({
  icon: Icon,
  label,
  subtitle,
  valueClassName,
  children,
}: {
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  valueClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col ">
      <div className="flex gap-3 items-center mb-7">
        <div className="rounded-lg bg-zinc-800 flex size-12 shrink-0 items-center justify-center text-zinc-400">
          <Icon className="size-5" strokeWidth={1.2} aria-hidden />
        </div>

      </div>
      <p
        className={cn(
          "mt-auto font-mono text-3xl font-medium tabular-nums tracking-tight sm:text-3xl",
          valueClassName
        )}
      >
        {children}
      </p>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="font-medium text-base leading-snug text-muted-foreground">{label}</p>
          {subtitle ? (
            <Tooltip>
              <TooltipTrigger>
                <Info className="size-3.5 shrink-0 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>{subtitle}</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default async function CostPage() {
  const { data: fleet } = await cachedGetFleetOverview();

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle>Cost Summary</CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>Current and projected spend based on running VM costs</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-stretch sm:gap-4">
          <CostMetric icon={Clock} label="Total Hourly Cost">
            {formatMoney(fleet.totalHourlyCost)}
          </CostMetric>
          <CostMetric icon={CalendarDays} label="Month-to-Date Cost">
            {formatMoney(fleet.monthToDateCost)}
          </CostMetric>
          <CostMetric
            icon={TrendingUp}
            label="Projected Monthly Cost"
            subtitle="Based on current usage"
            valueClassName="text-emerald-400"
          >
            {formatMoney(fleet.projectedMonthlyCost)}
          </CostMetric>
        </div>
      </CardContent>
    </Card>
  );
}
