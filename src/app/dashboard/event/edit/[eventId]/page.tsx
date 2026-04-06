"use client";

import { useSearchParams } from "next/navigation";
import { use } from "react";
import Edit from "../container/edit";

export default function UpdateEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);

  const searchParams = useSearchParams();
  const stepParams = searchParams.get("step");
  const step = stepParams ? parseInt(stepParams) : 1;

  console.log("Event ID:", eventId);
  console.log("Current step:", step);

  return <div>
    <Edit step={step} />
  </div>;
}