import { Suspense } from "react";
import ResetPasswordContent from "./container/reset-password";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
