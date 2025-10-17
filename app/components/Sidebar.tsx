"use client";

import { useState } from "react";
import { RefreshCw, FolderOpen, HardDrive } from "lucide-react";
import { DriveCard } from "./features/DriveCard";
import { ThemeToggle } from "./ModernThemeProvider";

interface Drive {
  path: string;
  name: string;
  freeSpace: number;
  totalSize: number;
  usedSpace: number;
}

interface SidebarProps {
  drives: Drive[];
  selectedDrive: string;
  onDriveSelect: (drivePath: string) => void;
  onFolderSelect: () => void;
  onRefresh: () => void;
}

export function Sidebar({
  drives,
  selectedDrive,
  onDriveSelect,
  onFolderSelect,
  onRefresh,
}: SidebarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <div className="w-80 sidebar p-8 overflow-y-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-500 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">
            Drives
          </h2>
        </div>

        <div className="space-y-4">
          {drives.map((drive) => (
            <DriveCard
              key={drive.path}
              drive={drive}
              isSelected={selectedDrive === drive.path}
              onSelect={onDriveSelect}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={onFolderSelect}
          className="btn btn-primary w-full flex items-center justify-center space-x-3"
        >
          <FolderOpen className="w-5 h-5" />
          <span>Select Folder</span>
        </button>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn btn-secondary w-full flex items-center justify-center space-x-3"
        >
          <RefreshCw
            className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      <div className="mt-8 space-y-6">
        {/* Theme Toggle */}
        <div className="card-flat p-6">
          <h3 className="text-sm font-display font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Appearance
          </h3>
          <ThemeToggle />
        </div>

        {/* Tips */}
        <div className="card-flat p-6">
          <h3 className="text-sm font-display font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Tips
          </h3>
          <ul className="text-sm font-body text-gray-700 dark:text-gray-300 space-y-3">
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 mt-2 flex-shrink-0"></div>
              <span>Click segments to explore folders</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 mt-2 flex-shrink-0"></div>
              <span>Hover for detailed information</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 mt-2 flex-shrink-0"></div>
              <span>Use cleanup tools to free space</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 mt-2 flex-shrink-0"></div>
              <span>Fast scan shows results immediately</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
