import React, { use } from "react";
import OrganizerDashboard from "./dashboard-event-id";
import DashboardNavbar from "@/components/navbar/dashboard-navbar";
import BottomNav from "@/components/navbar/bottom-navbar";

const SingleEvent = ({ params }: { params: Promise<{ eventId: string }> }) => {
  // const { eventId } = use(params);
  return (
    <main className="min-h-screen bg-white flex flex-col  ">
      <DashboardNavbar />
      <section className="">
        <OrganizerDashboard />
      </section>
      <BottomNav />
    </main>
  );
};

export default SingleEvent;
