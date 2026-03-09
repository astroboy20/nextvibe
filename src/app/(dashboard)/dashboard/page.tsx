import BottomNav from "@/components/navbar/bottom-navbar";
import DashboardNavbar from "@/components/navbar/dashboard-navbar";
import OrganizerDashboard from "./container/dashboard";

export default function SocialPage() {
  return (
    <main>
      <DashboardNavbar />
      <OrganizerDashboard/>
      <BottomNav />
    </main>
  );
}
