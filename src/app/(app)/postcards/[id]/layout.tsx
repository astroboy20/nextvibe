/**
 * Layout override for /postcards/:id
 *
 * Overrides the parent (app) MobileOnlyGate so desktop visitors reaching
 * this public page from /discover can view postcards without being blocked.
 */
export default function PostcardDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
