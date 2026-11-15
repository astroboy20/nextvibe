import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ChristmasVerify from "./container/christmas-verify";

interface Props {
  params: Promise<{ paymentId: string }>;
}

function VerifyLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <Skeleton className="mb-10 h-10 w-28" />
      <div className="w-full max-w-md space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col items-center gap-5 py-6">
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="w-full space-y-2 rounded-lg border border-border bg-secondary/20 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ChristmasVerifyPage({ params }: Props) {
  const { paymentId } = await params;
  return (
    <Suspense fallback={<VerifyLoading />}>
      <ChristmasVerify paymentId={paymentId} />
    </Suspense>
  );
}
