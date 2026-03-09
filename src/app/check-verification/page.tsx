import { Suspense } from "react";
import CheckVerification from "./container/verification";

export default function Verification() {
  return (
    <main>
       <Suspense fallback={null}>
       <CheckVerification />
       </Suspense>
      
    </main>
  );
}
