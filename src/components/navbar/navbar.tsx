"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
// import { useAuthStore } from "@/shared/stores/auth.store";

import { NewLogo } from "../logo";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
// import { cn } from "@/lib/utils";

const links = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact us", href: "/contact" },
  { name: "How it works", href: "/how-it-works" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const currentPath = usePathname();
  const [isAuthenticated] = useState(false);
  //   const { isAuthenticated } = useAuthStore();

  return (
    <div className=" fixed top-0 left-0 right-0 z-50  backdrop-blur-lg glass">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-25">
          <Link href="/">
            <NewLogo />
          </Link>

      
          <nav className="hidden md:flex items-center gap-1 bg-[#5b1a57] rounded-[31px] px-12.5 py-2.5 shadow-sm border border-gray-100">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={cn(
                  " text-white py-0.5 px-3 rounded-2xl font-semibold border-5 border-transparent text-sm transition-colors duration-150",
                  currentPath === link.href
                    ? "bg-[#a1349a]"
                    : ""
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

   
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="border-[#5B1A57] text-[#5B1A57] hover:bg-[#5B1A57] hover:text-white transition-colors h-8"
                asChild
              >
                <Link href="/events">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-[#A1349A] underline underline-offset-2 hover:text-[#5b1a57] transition-colors"
                >
                  Login
                </Link>
                <Button
                  className="bg-[#5b1a57] hover:bg-[#4a1446] text-white rounded-lg px-5"
                  size="default"
                  asChild
                >
                  <Link href="/auth/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <Sheet  open={open} onOpenChange={setOpen}>
            <SheetTrigger  asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Toggle navbar">
                <Menu className="h-6 w-6 text-[#5b1a57]" />
              </Button>
            </SheetTrigger>

            <SheetContent  side="right" className="w-70 pt-10 px-6 bg-white">
              {/* Mobile Logo */}
              <div className="mb-8">
                <Link href="/" onClick={() => setOpen(false)}>
                  <NewLogo />
                </Link>
              </div>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col gap-1 mb-8">
                {links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150",
                      currentPath === link.href
                        ? "bg-[#5b1a57] text-white"
                        : "text-gray-600 hover:text-[#5b1a57] hover:bg-purple-50"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth */}
              <div className="flex flex-col gap-3">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="border-[#5B1A57] text-[#5B1A57] hover:bg-[#5B1A57] hover:text-white w-full"
                    asChild
                  >
                    <Link href="/events" onClick={() => setOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium text-[#A1349A] underline underline-offset-2 text-center hover:text-[#5b1a57] transition-colors"
                    >
                      Login
                    </Link>
                    <Button
                      className="bg-[#5b1a57] hover:bg-[#4a1446] text-white rounded-lg w-full"
                      asChild
                    >
                      <Link
                        href="/auth/register"
                        onClick={() => setOpen(false)}
                      >
                        Sign up
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
