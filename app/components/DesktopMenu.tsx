"use client";

import { useState } from "react";
import { 
  File, 
  Edit, 
  View, 
  Wrench, 
  HelpCircle, 
  ChevronDown,
  FolderOpen,
  RefreshCw,
  Settings,
  Info,
  Search,
  Trash2,
  Download
} from "lucide-react";

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action?: () => void;
  children?: MenuItem[];
}

interface DesktopMenuProps {
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
}

export function DesktopMenu({
  onFolderSelect,
  onRefresh,
  onExportReport,
  onFindFiles,
  onSelectAll,
  onDeleteSelected,
  onViewChange,
  onToggleSidebar,
  onOpenCleanupTools,
  onOpenSettings,
  onShowAbout,
  onShowShortcuts,
  currentView = 'visual',
  sidebarVisible = true
}: DesktopMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    {
      label: "File",
      children: [
        { 
          label: "Open Folder...", 
          icon: <FolderOpen className="w-4 h-4" />, 
          shortcut: "Ctrl+O", 
          action: onFolderSelect || (() => console.log("Open folder - no handler provided")) 
        },
        { 
          label: "Refresh", 
          icon: <RefreshCw className="w-4 h-4" />, 
          shortcut: "F5", 
          action: onRefresh || (() => console.log("Refresh - no handler provided")) 
        },
        { 
          label: "Export Report...", 
          icon: <Download className="w-4 h-4" />, 
          shortcut: "Ctrl+E", 
          action: onExportReport || (() => console.log("Export - no handler provided")) 
        },
        { 
          label: "Exit", 
          shortcut: "Alt+F4", 
          action: () => {
            // Since we're using native window controls, we can't programmatically close
            // The user should use Alt+F4 or the native close button
            console.log("Exit requested - please use Alt+F4 or the close button");
          }
        }
      ]
    },
    {
      label: "Edit",
      children: [
        { 
          label: "Find Files...", 
          icon: <Search className="w-4 h-4" />, 
          shortcut: "Ctrl+F", 
          action: onFindFiles || (() => console.log("Find files - no handler provided")) 
        },
        { 
          label: "Select All", 
          shortcut: "Ctrl+A", 
          action: onSelectAll || (() => console.log("Select all - no handler provided")) 
        },
        { 
          label: "Delete Selected", 
          icon: <Trash2 className="w-4 h-4" />, 
          shortcut: "Delete", 
          action: onDeleteSelected || (() => console.log("Delete - no handler provided")) 
        }
      ]
    },
    {
      label: "View",
      children: [
        { 
          label: "Visual View", 
          shortcut: "Ctrl+1", 
          action: () => onViewChange?.('visual')
        },
        { 
          label: "List View", 
          shortcut: "Ctrl+2", 
          action: () => onViewChange?.('list')
        },
        { 
          label: "Split View", 
          shortcut: "Ctrl+3", 
          action: () => onViewChange?.('split')
        },
        { 
          label: sidebarVisible ? "Hide Sidebar" : "Show Sidebar", 
          shortcut: "Ctrl+B", 
          action: onToggleSidebar || (() => console.log("Toggle sidebar - no handler provided"))
        }
      ]
    },
    {
      label: "Tools",
      children: [
        { 
          label: "Cleanup Tools", 
          icon: <Wrench className="w-4 h-4" />, 
          action: onOpenCleanupTools || (() => console.log("Cleanup tools - no handler provided"))
        },
        { 
          label: "Settings", 
          icon: <Settings className="w-4 h-4" />, 
          shortcut: "Ctrl+,", 
          action: onOpenSettings || (() => console.log("Settings - no handler provided"))
        }
      ]
    },
    {
      label: "Help",
      children: [
        { 
          label: "About LorDisk", 
          icon: <Info className="w-4 h-4" />, 
          action: onShowAbout || (() => console.log("About - no handler provided"))
        },
        { 
          label: "Keyboard Shortcuts", 
          shortcut: "F1", 
          action: onShowShortcuts || (() => console.log("Shortcuts - no handler provided"))
        }
      ]
    }
  ];

  const handleMenuClick = (menuLabel: string) => {
    setActiveMenu(activeMenu === menuLabel ? null : menuLabel);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
    }
    setActiveMenu(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-1">
      <div className="flex items-center space-x-6">
        {menuItems.map((menu) => (
          <div key={menu.label} className="relative">
            <button
              onClick={() => handleMenuClick(menu.label)}
              className={`flex items-center space-x-1 px-3 py-2 text-sm font-body font-medium transition-colors whitespace-nowrap ${
                activeMenu === menu.label
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span>{menu.label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {activeMenu === menu.label && menu.children && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                {menu.children.map((item, index) => {
                  const isCurrentView = menu.label === "View" && (
                    (item.label === "Visual View" && currentView === 'visual') ||
                    (item.label === "List View" && currentView === 'list') ||
                    (item.label === "Split View" && currentView === 'split')
                  );
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleMenuItemClick(item)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm font-body text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon && <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>}
                        <span>{item.label}</span>
                        {isCurrentView && (
                          <span className="text-blue-600 dark:text-blue-400 text-xs">✓</span>
                        )}
                      </div>
                      {item.shortcut && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
