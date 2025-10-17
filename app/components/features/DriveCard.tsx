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
      className={`w-full p-6 text-left transition-all duration-200 ${
        isSelected
          ? "card-blue"
          : "card-flat hover:bg-gray-50 dark:hover:bg-gray-700"
      }`}
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-10 h-10 bg-blue-500 flex items-center justify-center">
          <HardDrive className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-display font-bold text-lg text-gray-900 dark:text-white">
            {drive.name}
          </div>
          <div className="text-sm font-body text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {window.electronAPI.formatBytes(drive.totalSize)}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm font-body">
          <span className="text-gray-600 dark:text-gray-400 uppercase tracking-wide">Used:</span>
          <span className="text-gray-900 dark:text-white font-bold">
            {window.electronAPI.formatBytes(drive.usedSpace)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-gray-600 dark:text-gray-400 uppercase tracking-wide">Free:</span>
          <span className="text-gray-900 dark:text-white font-bold">
            {window.electronAPI.formatBytes(drive.freeSpace)}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs font-body text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
            <span>Usage</span>
            <span className="font-bold">{getDriveUsagePercentage(drive)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 h-3">
            <div
              className={`h-3 transition-all duration-300 ${
                parseFloat(getDriveUsagePercentage(drive)) > 90
                  ? "bg-red-500"
                  : parseFloat(getDriveUsagePercentage(drive)) > 70
                  ? "bg-orange-500"
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
