"use client";

import { Header } from "../Header";
import { Sidebar } from "../Sidebar";
import { DesktopMenu } from "../DesktopMenu";
import { DesktopStatusBar } from "../DesktopStatusBar";

interface AppLayoutProps {
  children: React.ReactNode;
  sidebarProps: any;
  statusBarProps?: {
    selectedDrive?: string;
    scanProgress?: any;
    directoryData?: any;
  };
  menuProps?: {
    onFolderSelect?: () => void;
    onRefresh?: () => void;
    onExportReport?: () => void;
    onFindFiles?: () => void;
    onSelectAll?: () => void;
    onDeleteSelected?: () => void;
    onViewChange?: (view: 'visual' | 'list' | 'split') => void;
    onToggleSidebar?: () => void;
    onOpenCleanupTools?: () => void;
    onOpenSettings?: () => void;
    onShowAbout?: () => void;
    onShowShortcuts?: () => void;
    currentView?: 'visual' | 'list' | 'split';
    sidebarVisible?: boolean;
  };
}

export function AppLayout({ children, sidebarProps, statusBarProps, menuProps }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <Header />
      <DesktopMenu {...menuProps} />

      <div className="flex h-screen">
        <Sidebar {...sidebarProps} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-hidden main-content">{children}</main>
          <DesktopStatusBar {...statusBarProps} />
        </div>
      </div>
    </div>
  );
}
