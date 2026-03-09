import BottomNav from "@/components/navbar/bottom-navbar";
import DashboardNavbar from "@/components/navbar/dashboard-navbar";
import Social from "./container/social";

export default function SocialPage() {
  return (
    <main>
      <DashboardNavbar />
      <Social />
      <BottomNav />
    </main>
  );
}
