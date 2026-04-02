"use client"
import { useUserLocation } from "@/hooks/get-location";
import Discover from "./container/discover";

export default function DiscoverPage() {
  const { location, loading, error } = useUserLocation(); 

  if (loading) return <p>Detecting your location...</p>;
  if (error) return <p>{error}</p>;
  console.log("User location:", location);
  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-10 w-full 2xl:max-w-7xl 2xl:mx-auto ">
      <Discover />
    </div>
  );
}
