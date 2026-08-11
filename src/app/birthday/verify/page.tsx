import { Suspense } from "react";
import BirthdayVerify from "./container/birthday-verify";

export default function BirthdayVerifyPage() {
  return (
    <Suspense fallback={null}>
      <BirthdayVerify />
    </Suspense>
  );
}
