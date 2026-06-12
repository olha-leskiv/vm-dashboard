import { PageHeader } from "@/components/layout/page-header";

export default function OverviewLayout({
  children: _children,
  kpis,
  utilization,
  runningVms,
  hotVms,
  idleVms,
  actionCenter,
  cost,
}: {
  children: React.ReactNode;
  kpis: React.ReactNode;
  utilization: React.ReactNode;
  runningVms: React.ReactNode;
  hotVms: React.ReactNode;
  idleVms: React.ReactNode;
  actionCenter: React.ReactNode;
  cost: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Overview"
        actions={
          <p className="text-xs text-muted-foreground tabular-nums">
            Updated{" "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {kpis}
        <div className="col-span-2">
          {cost}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2">
          {utilization}
        </div>
        <div>
          {runningVms}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {hotVms}
        {idleVms}
        {actionCenter}
      </div>
    </div>
  );
}
