"use client"
import { Suspense } from "react";
import LoginContent from "./container/login";

export default function LoginPage() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="flex justify-center items-center">
            Loading Auth Page
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </main>
  );
}
