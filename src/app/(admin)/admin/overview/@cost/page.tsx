import { cachedGetFleetOverview } from "@/lib/api/cached";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  );
}
