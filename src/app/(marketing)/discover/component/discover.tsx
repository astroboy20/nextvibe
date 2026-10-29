"use client";
import { useState } from "react";
import ViewToggle from "@/features/events/components/discovery/view-toggle";
import EventsView from "./events-view";
import PostcardsView from "./postcards-view";

export default function Discover() {
  const [activeView, setActiveView] = useState<"events" | "postcards">("events");

  return (
    <main className="container mx-auto px-4 pt-6 pb-12 sm:pb-16 w-full 2xl:max-w-7xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Discover
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse public events and postcards from the NextVibe community.
        </p>
      </div>

      {/* View toggle */}
      <div className="mb-6 flex justify-center">
        <ViewToggle activeView={activeView} onViewChange={setActiveView} />
      </div>

      {activeView === "events" ? <EventsView /> : <PostcardsView />}
    </main>
  );
}
