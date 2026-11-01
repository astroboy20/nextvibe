import Link from "next/link";
import { NewLogo } from "@/shared/components/logo";

/**
 * Minimal layout for the Thanksgiving landing page.
 * No full navbar or footer — every outbound link is a potential lost sale.
 */
export default function ThanksgivingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Slim header — logo only */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-sm">
        <div className="container flex h-14 max-w-7xl items-center px-4">
          <Link href="/" aria-label="NextVibe home">
            <NewLogo />
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Slim footer — legal links only, no nav maze */}
      <footer className="border-t border-border/50 bg-background py-6">
        <div className="container flex flex-col items-center gap-2 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} NextVibe. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
