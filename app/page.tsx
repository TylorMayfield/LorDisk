"use client";

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { ModernDashboard } from "./components/ModernDashboard";
import { ScanProgress } from "./components/ScanProgress";
import { EmptyState } from "./components/layout/EmptyState";
import { DesktopMenu } from "./components/DesktopMenu";
import { useKeyboardShortcuts, commonShortcuts } from "./hooks/useKeyboardShortcuts";
import { HardDrive, Zap, Search } from "lucide-react";

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

interface ScanProgressData {
  currentDirectory: string;
  scannedFiles: number;
  scannedDirectories: number;
  totalItems: number;
  isScanning: boolean;
  phase: string;
}

export default function Home() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<string>("");
  const [directoryData, setDirectoryData] = useState<DirectoryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [scanProgress, setScanProgress] = useState<ScanProgressData>({
    currentDirectory: "",
    scannedFiles: 0,
    scannedDirectories: 0,
    totalItems: 0,
    isScanning: false,
    phase: "initial",
  });
  const [useStaggeredScanning, setUseStaggeredScanning] = useState(true);
  const [viewMode, setViewMode] = useState<'visual' | 'list' | 'split'>('visual');
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    loadDrives();
  }, []);

  // Set up event listeners for staggered scanning
  useEffect(() => {
    if (typeof window !== "undefined" && window.electronAPI) {
      // Listen for scan progress updates
      window.electronAPI.onScanProgressUpdate((progress: ScanProgressData) => {
        setScanProgress(progress);
      });

      // Listen for immediate scan results
      window.electronAPI.onImmediateScanResults((data: any) => {
        console.log("Received immediate results:", data);
        setDirectoryData(data.data);
        setIsLoading(false);
      });

      // Listen for directory scan updates
      window.electronAPI.onDirectoryScanUpdate((data: any) => {
        console.log("Directory scan update:", data);
        // Update the existing data with new information
        if (directoryData && data.path) {
          // This would update the specific directory in the tree
          // For now, we'll just log it
          console.log("Updating directory:", data.path);
        }
      });

      return () => {
        // Clean up listeners
        window.electronAPI.removeAllListeners("scan-progress-update");
        window.electronAPI.removeAllListeners("immediate-scan-results");
        window.electronAPI.removeAllListeners("directory-scan-update");
      };
    }
  }, [directoryData]);

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
      setDirectoryData(null);

      if (useStaggeredScanning) {
        // Use staggered scanning for better user experience
        console.log("Starting staggered scan for:", drivePath);
        await window.electronAPI.scanDirectoryStaggered(drivePath, {
          immediateDepth: 2,
          backgroundDepth: 8,
          maxDepth: 10
        });
      } else {
        // Use traditional scanning
        const data = await window.electronAPI.scanDirectory(drivePath);
        setDirectoryData(data);
        setIsLoading(false);
      }
    } catch (err) {
      setError("Failed to scan directory");
      console.error("Error scanning directory:", err);
      setIsLoading(false);
    }
  };

  const handleFolderSelect = async () => {
    try {
      setIsLoading(true);
      setError("");
      setDirectoryData(null);

      const result = await window.electronAPI.selectFolder();
      if (result.success && result.path) {
        setSelectedDrive(result.path);
        
        if (useStaggeredScanning) {
          await window.electronAPI.scanDirectoryStaggered(result.path, {
            immediateDepth: 2,
            backgroundDepth: 8,
            maxDepth: 10
          });
        } else {
          const data = await window.electronAPI.scanDirectory(result.path);
          setDirectoryData(data);
          setIsLoading(false);
        }
      }
    } catch (err) {
      setError("Failed to select folder");
      console.error("Error selecting folder:", err);
      setIsLoading(false);
    }
  };

  const handleRescan = async () => {
    if (!selectedDrive) return;

    try {
      setIsLoading(true);
      setError("");
      setDirectoryData(null);

      if (useStaggeredScanning) {
        await window.electronAPI.scanDirectoryStaggered(selectedDrive, {
          immediateDepth: 2,
          backgroundDepth: 8,
          maxDepth: 10
        });
      } else {
        const data = await window.electronAPI.rescanDirectory(selectedDrive);
        setDirectoryData(data);
        setIsLoading(false);
      }
    } catch (err) {
      setError("Failed to rescan directory");
      console.error("Error rescanning directory:", err);
      setIsLoading(false);
    }
  };

  const toggleScanningMode = useCallback(() => {
    setUseStaggeredScanning(!useStaggeredScanning);
  }, [useStaggeredScanning]);

  // Menu handlers
  const handleExportReport = useCallback(() => {
    if (!directoryData) {
      alert("No data to export. Please scan a drive or folder first.");
      return;
    }
    
    const reportData = {
      path: directoryData.path,
      totalSize: directoryData.totalSize,
      itemCount: directoryData.itemCount,
      scanDate: new Date().toISOString(),
      items: directoryData.items
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lordisk-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [directoryData]);

  const handleFindFiles = useCallback(() => {
    const searchTerm = prompt("Enter search term:");
    if (searchTerm) {
      console.log("Searching for:", searchTerm);
      // TODO: Implement file search functionality
      alert(`Search functionality for "${searchTerm}" will be implemented soon!`);
    }
  }, []);

  const handleSelectAll = useCallback(() => {
    console.log("Select all files");
    // TODO: Implement select all functionality
    alert("Select all functionality will be implemented soon!");
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (confirm("Are you sure you want to delete the selected files? This action cannot be undone.")) {
      console.log("Delete selected files");
      // TODO: Implement delete functionality
      alert("Delete functionality will be implemented soon!");
    }
  }, []);

  const handleViewChange = useCallback((view: 'visual' | 'list' | 'split') => {
    setViewMode(view);
    console.log("View changed to:", view);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarVisible(!sidebarVisible);
    console.log("Sidebar toggled:", !sidebarVisible);
  }, [sidebarVisible]);

  const handleOpenCleanupTools = useCallback(() => {
    console.log("Opening cleanup tools");
    // TODO: Implement cleanup tools modal/panel
    alert("Cleanup tools will be implemented soon!");
  }, []);

  const handleOpenSettings = useCallback(() => {
    console.log("Opening settings");
    // TODO: Implement settings modal
    alert("Settings will be implemented soon!");
  }, []);

  const handleShowAbout = useCallback(() => {
    alert(`LorDisk v1.0.0\n\nA modern disk space analyzer with visual folder mapping and cleanup tools.\n\nBuilt with Next.js, React, and Electron.`);
  }, []);

  const handleShowShortcuts = useCallback(() => {
    const shortcuts = [
      "Ctrl+O - Open Folder",
      "F5 - Refresh",
      "Ctrl+E - Export Report",
      "Ctrl+F - Find Files",
      "Ctrl+A - Select All",
      "Delete - Delete Selected",
      "Ctrl+1 - Visual View",
      "Ctrl+2 - List View", 
      "Ctrl+3 - Split View",
      "Ctrl+B - Toggle Sidebar",
      "Ctrl+, - Settings",
      "F1 - Help"
    ].join('\n');
    
    alert(`Keyboard Shortcuts:\n\n${shortcuts}`);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    commonShortcuts.openFolder(handleFolderSelect),
    commonShortcuts.refresh(loadDrives),
    commonShortcuts.help(handleShowShortcuts),
    { key: 'e', ctrlKey: true, action: handleExportReport, description: 'Export Report' },
    { key: 'f', ctrlKey: true, action: handleFindFiles, description: 'Find Files' },
    { key: 'a', ctrlKey: true, action: handleSelectAll, description: 'Select All' },
    { key: 'Delete', action: handleDeleteSelected, description: 'Delete Selected' },
    { key: '1', ctrlKey: true, action: () => handleViewChange('visual'), description: 'Visual View' },
    { key: '2', ctrlKey: true, action: () => handleViewChange('list'), description: 'List View' },
    { key: '3', ctrlKey: true, action: () => handleViewChange('split'), description: 'Split View' },
    { key: 'b', ctrlKey: true, action: handleToggleSidebar, description: 'Toggle Sidebar' },
    { key: ',', ctrlKey: true, action: handleOpenSettings, description: 'Settings' },
  ]);

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
      statusBarProps={{
        selectedDrive,
        scanProgress,
        directoryData,
      }}
      menuProps={{
        onFolderSelect: handleFolderSelect,
        onRefresh: loadDrives,
        onExportReport: handleExportReport,
        onFindFiles: handleFindFiles,
        onSelectAll: handleSelectAll,
        onDeleteSelected: handleDeleteSelected,
        onViewChange: handleViewChange,
        onToggleSidebar: handleToggleSidebar,
        onOpenCleanupTools: handleOpenCleanupTools,
        onOpenSettings: handleOpenSettings,
        onShowAbout: handleShowAbout,
        onShowShortcuts: handleShowShortcuts,
        currentView: viewMode,
        sidebarVisible,
      }}
    >
      {error && (
        <div className="card-red p-6 m-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-red-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <span className="font-body text-red-700 dark:text-red-400 font-medium">
              {error}
            </span>
          </div>
        </div>
      )}

      {/* Scanning mode toggle */}
      <div className="p-8 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              Disk Analysis
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleScanningMode}
                className={`btn-flat flex items-center space-x-3 ${
                  useStaggeredScanning
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
              >
                <Zap className="w-5 h-5" />
                <span>Fast Scan</span>
              </button>
              <div className="text-sm font-body text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {useStaggeredScanning 
                  ? "Shows results immediately, then fills in details" 
                  : "Traditional full scan before showing results"
                }
              </div>
            </div>
          </div>
          
          {directoryData && (
            <div className="flex items-center space-x-3 text-sm font-body text-gray-700 dark:text-gray-300">
              <div className="w-6 h-6 bg-blue-500 flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">
                {directoryData.itemCount} items • {window.electronAPI.formatBytes(directoryData.totalSize)}
              </span>
            </div>
          )}
        </div>
      </div>

      {directoryData ? (
        <ModernDashboard
          data={directoryData}
          selectedDrive={selectedDrive}
          onRescan={handleRescan}
          isScanning={scanProgress.isScanning}
          scanProgress={scanProgress}
          viewMode={viewMode}
        />
      ) : (
        <EmptyState
          title="Select a drive or folder to analyze"
          description={
            useStaggeredScanning
              ? "Choose from available drives or select a custom folder to start analyzing disk space with fast, progressive scanning"
              : "Choose from available drives or select a custom folder to start analyzing disk space"
          }
          icon={<HardDrive className="w-12 h-12 text-gray-400" />}
        />
      )}
    </AppLayout>
  );
}