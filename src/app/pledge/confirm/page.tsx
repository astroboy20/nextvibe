"use client"
import { Suspense } from "react";
import PledgeConfirm from "../container/confirm";

export default function PledgeConfirmPage() {
  return (
    <Suspense fallback={null}>
      <PledgeConfirm />
    </Suspense>
  );
}
