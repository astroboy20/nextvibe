import DashboardNavbar from "@/components/navbar/dashboard-navbar";
import Create from "../container/create/create";
import BottomNav from "@/components/navbar/bottom-navbar";

export default function CreateEventPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <DashboardNavbar />
      <Create />
      <BottomNav />
    </div>
  );
}
