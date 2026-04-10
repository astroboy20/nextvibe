import DashboardNavbar from "@/components/navbar/dashboard-navbar";
import Dashboard from "./container/dashboard";
import BottomNav from "@/components/navbar/bottom-navbar";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col  ">
      <DashboardNavbar />
      <section className="px-4 py-6 sm:px-6">
        <Dashboard />
      </section>
      <BottomNav />
    </main>
  );
}
