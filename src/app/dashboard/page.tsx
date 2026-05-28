import Dashboard from "./container/dashboard";
import { DashboardShell } from "@/components/dashboard-shell";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <Dashboard />
    </DashboardShell>
  );
}
