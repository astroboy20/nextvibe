"use client";
import dynamic from "next/dynamic";
import { Spinner } from "../components/ui/spinner";

const HomeContainer = dynamic(
  () => import("../app/home-container/home-container"),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex justify-center items-center bg-white rounded-2xl">
        <Spinner />
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main>
      <HomeContainer />
    </main>
  );
}
