import Messages from "./container/messages";
import { Suspense } from "react";

export default function SocialPage() {
  return (
    <main>
      <Suspense fallback={null}>
      <Messages />
      </Suspense>
    </main>
  );
}
