"use client";
import { useUserLocation } from "@/hooks/get-location";
import Discover from "./container/discover";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setLocation } from "@/app/provider/slices/location-slice";

export default function DiscoverPage() {
  const dispatch = useDispatch();
  const { location } = useUserLocation();

  useEffect(() => {
    dispatch(setLocation(location));
  }, [location, dispatch]);

 
  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-10 w-full 2xl:max-w-7xl 2xl:mx-auto ">
      <Discover />
    </div>
  );
}
