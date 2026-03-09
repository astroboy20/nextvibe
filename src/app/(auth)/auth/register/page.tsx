import { Suspense } from "react";
import RegisterContent from "./container/register";

export default function RegisterPage() {
  return (
    <main>
      <Suspense fallback={null}>
      <RegisterContent />
      </Suspense>
     
    </main>
  );
}
