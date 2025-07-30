"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./components/Dashboard";
import { ScanProgress } from "./components/ScanProgress";
import { EmptyState } from "./components/layout/EmptyState";
import { HardDrive } from "lucide-react";

interface Drive {
  path: string;
  name: string;
  freeSpace: number;
  totalSize: number;
  usedSpace: number;
}

interface DirectoryData {
  path: string;
  items: any[];
  totalSize: number;
  itemCount: number;
}

export default function Home() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<string>("");
  const [directoryData, setDirectoryData] = useState<DirectoryData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [scanProgress, setScanProgress] = useState({
    currentDirectory: "",
    scannedFiles: 0,
    scannedDirectories: 0,
    totalItems: 0,
    isScanning: false,
  });

  useEffect(() => {
    loadDrives();
  }, []);

  // Poll for scan progress when scanning
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      interval = setInterval(async () => {
        try {
          const progress = await window.electronAPI.getScanProgress();
          setScanProgress(progress);
        } catch (error) {
          console.error("Error getting scan progress:", error);
        }
      }, 100); // Update every 100ms
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  const loadDrives = async () => {
    try {
      setIsLoading(true);
      setError("");
      const drivesData = await window.electronAPI.getDrives();
      setDrives(drivesData);
      if (drivesData.length > 0) {
        setSelectedDrive(drivesData[0].path);
      }
    } catch (err) {
      setError("Failed to load drives");
      console.error("Error loading drives:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDriveSelect = async (drivePath: string) => {
    try {
      setIsLoading(true);
      setError("");
      setSelectedDrive(drivePath);

      const data = await window.electronAPI.scanDirectory(drivePath);
      setDirectoryData(data);
    } catch (err) {
      setError("Failed to scan directory");
      console.error("Error scanning directory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderSelect = async () => {
    try {
      setIsLoading(true);
      setError("");

      const result = await window.electronAPI.selectFolder();
      if (result.success && result.path) {
        setSelectedDrive(result.path);
        const data = await window.electronAPI.scanDirectory(result.path);
        setDirectoryData(data);
      }
    } catch (err) {
      setError("Failed to select folder");
      console.error("Error selecting folder:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRescan = async () => {
    if (!selectedDrive) return;

    try {
      setIsLoading(true);
      setError("");

      const data = await window.electronAPI.rescanDirectory(selectedDrive);
      setDirectoryData(data);
    } catch (err) {
      setError("Failed to rescan directory");
      console.error("Error rescanning directory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !directoryData) {
    return (
      <ScanProgress
        currentPath={selectedDrive}
        scannedFiles={scanProgress.scannedFiles}
        scannedDirectories={scanProgress.scannedDirectories}
        totalItems={scanProgress.totalItems}
        currentDirectory={scanProgress.currentDirectory}
      />
    );
  }

  return (
    <AppLayout
      sidebarProps={{
        drives,
        selectedDrive,
        onDriveSelect: handleDriveSelect,
        onFolderSelect: handleFolderSelect,
        onRefresh: loadDrives,
      }}
    >
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg m-4">
          {error}
        </div>
      )}

      {directoryData ? (
        <Dashboard
          data={directoryData}
          selectedDrive={selectedDrive}
          onRescan={handleRescan}
        />
      ) : (
        <EmptyState
          title="Select a drive or folder to analyze"
          description="Choose from available drives or select a custom folder to start analyzing disk space"
          icon={<HardDrive className="w-12 h-12 text-gray-400" />}
        />
      )}
    </AppLayout>
  );
}
