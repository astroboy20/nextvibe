import Dashboard from "./container/dashboard";
import { DashboardShell } from "@/features/layout/components/dashboard-shell";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <Dashboard />
    </DashboardShell>
  );
}
