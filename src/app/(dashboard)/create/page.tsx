import BottomNav from "@/components/navbar/bottom-navbar";
import CreateEvent from "./container/create";
import DashboardNavbar from "@/components/navbar/dashboard-navbar";

export default function CreatePage() {
  return (
    <main>
      <DashboardNavbar />
      <CreateEvent />
      <BottomNav />
    </main>
  );
}
