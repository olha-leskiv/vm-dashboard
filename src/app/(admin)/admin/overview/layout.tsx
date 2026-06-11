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
      <div className="flex items-start justify-between gap-4">
        <h1>Overview</h1>
        <p className="text-xs text-muted-foreground shrink-0 mt-1.5">
          Updated {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {kpis}
        {cost}
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
