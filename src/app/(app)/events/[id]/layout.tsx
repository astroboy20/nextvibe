/**
 * Layout override for /events/:id
 *
 * The parent (app) layout wraps everything in MobileOnlyGate which blocks
 * desktop visitors — a problem for this publicly-accessible event detail page.
 * This nested layout replaces it with a simple full-screen wrapper so both
 * desktop and mobile visitors can view event details.
 */
export default function EventDetailLayout({
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
