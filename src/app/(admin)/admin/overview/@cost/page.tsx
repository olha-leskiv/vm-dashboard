import { Info } from "lucide-react";
import { cachedGetFleetOverview } from "@/lib/api/cached";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function formatMoney(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
          <Separator />
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
  );
}
