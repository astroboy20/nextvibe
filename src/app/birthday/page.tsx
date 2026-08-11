import { Suspense } from "react";
import BirthdayFunnel from "./container/birthday";

export default function BirthdayPage() {
  return (
    <Suspense fallback={null}>
      <BirthdayFunnel />
    </Suspense>
  );
}
