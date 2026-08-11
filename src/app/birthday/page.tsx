import { Suspense } from "react";
import BirthdayFunnel from "./container/birthday-new";

export default function BirthdayPage() {
  return (
    <Suspense fallback={null}>
      <BirthdayFunnel />
    </Suspense>
  );
}
