/**
 * The verify page is a standalone payment confirmation screen — no nav or footer.
 * This layout overrides the (marketing) group layout for this subtree.
 */
export default function ChristmasVerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
