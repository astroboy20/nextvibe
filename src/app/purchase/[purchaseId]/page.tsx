import { Suspense } from "react";
import PurchaseConfirmation from "./purchase-confirmation";

export default async function PurchaseConfirmationPage({
  params,
}: {
  params: Promise<{ purchaseId: string }>;
}) {
  const { purchaseId } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PurchaseConfirmation purchaseId={purchaseId} />
    </Suspense>
  );
}
