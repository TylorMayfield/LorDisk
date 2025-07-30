"use client";

import { Header } from "../Header";
import { Sidebar } from "../Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  sidebarProps: any;
}

export function AppLayout({ children, sidebarProps }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <Header />

      <div className="flex h-screen">
        <Sidebar {...sidebarProps} />

        <main className="flex-1 overflow-hidden main-content">{children}</main>
      </div>
    </div>
  );
}
