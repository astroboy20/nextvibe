import { Suspense } from "react";
import VerifyEmail from "./container/verify-email";

export default function VerifyEmailPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <VerifyEmail />
      </Suspense>
    </main>
  );
}
