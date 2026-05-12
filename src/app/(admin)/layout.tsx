"use client";

import { Sidebar } from "@/components/admin-sidebar";
import { Header } from "@/components/navbar/admin-navbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
