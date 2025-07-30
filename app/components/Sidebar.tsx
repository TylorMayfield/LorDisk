"use client";

import { useState } from "react";
import { RefreshCw, FolderOpen, HardDrive } from "lucide-react";
import { DriveCard } from "./features/DriveCard";

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
    <div className="w-80 sidebar p-6 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <HardDrive className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Drives
          </h2>
        </div>

        <div className="space-y-3">
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

      <div className="space-y-3">
        <button
          onClick={onFolderSelect}
          className="btn btn-primary w-full flex items-center justify-center space-x-2"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Select Folder</span>
        </button>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn btn-secondary w-full flex items-center justify-center space-x-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      <div className="mt-8 card p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Tips
        </h3>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Click segments to explore folders</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Hover for detailed information</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Use cleanup tools to free space</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
