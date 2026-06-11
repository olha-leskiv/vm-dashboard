export default function OverviewLayout({
  children: _children,
  kpis,
  utilization,
  runningVms,
  hotVms,
  idleVms,
  cost,
}: {
  children: React.ReactNode;
  kpis: React.ReactNode;
  utilization: React.ReactNode;
  runningVms: React.ReactNode;
  hotVms: React.ReactNode;
  idleVms: React.ReactNode;
  cost: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1>Overview</h1>
        <p className="text-muted-foreground mt-0.5">Real-time summary of your infrastructure.</p>
      </div>

      {/* KPI row — each card streams independently */}
      {kpis}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {utilization}
        {runningVms}
      </div>

      {/* Distribution + cost row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {hotVms}
        {idleVms}
        {cost}
      </div>
    </div>
  );
}
