import { KpiRow } from "@/components/overview/kpi-row";
import { FleetChart } from "@/components/overview/fleet-chart";
import { AlertsPanel } from "@/components/overview/alerts-panel";
import { HostGrid } from "@/components/overview/host-grid";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <KpiRow />
      <div className="grid gap-4 lg:grid-cols-3">
        <FleetChart className="lg:col-span-2" />
        <AlertsPanel />
      </div>
      <HostGrid />
    </div>
  );
}
