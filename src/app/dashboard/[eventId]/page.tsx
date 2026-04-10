import React, { use } from "react";
import OrganizerDashboard from "./dashboard-event-id";

const SingleEvent = ({ params }: { params: Promise<{ eventId: string }> }) => {
  // const { eventId } = use(params);
  return (
    <div>
      <OrganizerDashboard />
    </div>
  );
};

export default SingleEvent;
