"use client";

import { HardDrive } from "lucide-react";

interface Drive {
  path: string;
  name: string;
  freeSpace: number;
  totalSize: number;
  usedSpace: number;
}

interface DriveCardProps {
  drive: Drive;
  isSelected: boolean;
  onSelect: (path: string) => void;
}

export function DriveCard({ drive, isSelected, onSelect }: DriveCardProps) {
  const getDriveUsagePercentage = (drive: Drive) => {
    return ((drive.usedSpace / drive.totalSize) * 100).toFixed(1);
  };

  return (
    <button
      onClick={() => onSelect(drive.path)}
      className={`w-full card-hover p-4 text-left ${
        isSelected
          ? "bg-blue-50/80 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600"
          : "hover:bg-gray-50/80 dark:hover:bg-gray-700/80"
      }`}
    >
      <div className="flex items-center space-x-3 mb-3">
        <HardDrive className="w-5 h-5 text-blue-600" />
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {drive.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {window.electronAPI.formatBytes(drive.totalSize)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Used:</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {window.electronAPI.formatBytes(drive.usedSpace)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Free:</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {window.electronAPI.formatBytes(drive.freeSpace)}
          </span>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Usage</span>
            <span>{getDriveUsagePercentage(drive)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                parseFloat(getDriveUsagePercentage(drive)) > 90
                  ? "bg-red-500"
                  : parseFloat(getDriveUsagePercentage(drive)) > 70
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${getDriveUsagePercentage(drive)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </button>
  );
}
