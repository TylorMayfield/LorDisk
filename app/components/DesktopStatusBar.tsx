"use client";

import { useState, useEffect } from "react";
import { HardDrive, Clock, Database, Zap } from "lucide-react";

interface StatusBarProps {
  selectedDrive?: string;
  scanProgress?: {
    isScanning: boolean;
    scannedFiles: number;
    scannedDirectories: number;
    phase?: string;
  };
  directoryData?: {
    itemCount: number;
    totalSize: number;
  };
}

export function DesktopStatusBar({ selectedDrive, scanProgress, directoryData }: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between text-sm font-body">
        {/* Left side - Drive and scan info */}
        <div className="flex items-center space-x-6">
          {selectedDrive && (
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <HardDrive className="w-4 h-4" />
              <span className="font-medium">{selectedDrive}</span>
            </div>
          )}
          
          {scanProgress?.isScanning && (
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <Zap className="w-4 h-4" />
              <span className="font-medium">
                {scanProgress.phase === "immediate" ? "Quick Scan" : "Deep Scan"}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                ({scanProgress.scannedFiles} files, {scanProgress.scannedDirectories} folders)
              </span>
            </div>
          )}

          {directoryData && !scanProgress?.isScanning && (
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <Database className="w-4 h-4" />
              <span className="font-medium">
                {directoryData.itemCount} items • {window.electronAPI?.formatBytes?.(directoryData.totalSize) || '0 Bytes'}
              </span>
            </div>
          )}
        </div>

        {/* Right side - Time and date */}
        <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(currentTime)}</span>
          </div>
          <div className="text-gray-500 dark:text-gray-500">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>
    </div>
  );
}
