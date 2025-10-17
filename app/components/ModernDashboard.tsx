"use client";

import { useState, useCallback } from "react";
import { ModernTreemap } from "./charts/ModernTreemap";
import { ModernFileList } from "./features/ModernFileList";
import { CleanupTools } from "./features/CleanupTools";
import { FileTypeAnalysis } from "./features/FileTypeAnalysis";
import { CacheStatus } from "./ui/CacheStatus";
import { 
  BarChart3, 
  List, 
  Trash2, 
  FileType, 
  HardDrive, 
  Eye,
  EyeOff
} from "lucide-react";

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

interface ModernDashboardProps {
  data: DirectoryData;
  selectedDrive: string;
  onRescan?: () => void;
  isScanning?: boolean;
  scanProgress?: ScanProgressData;
  viewMode?: 'visual' | 'list' | 'split';
}

type TabType = "visual" | "list" | "analysis" | "cleanup";
type ViewMode = "split" | "full";

export function ModernDashboard({ 
  data, 
  selectedDrive, 
  onRescan, 
  isScanning = false, 
  scanProgress,
  viewMode = 'visual'
}: ModernDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>(viewMode as TabType);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(true);

  const tabs = [
    { id: "visual", label: "Visual Chart", icon: BarChart3, description: "DaisyDisk-style treemap" },
    { id: "list", label: "File List", icon: List, description: "WinDirStat-style detailed list" },
    { id: "analysis", label: "File Analysis", icon: FileType, description: "File type breakdown" },
    { id: "cleanup", label: "Cleanup Tools", icon: Trash2, description: "Find and remove files" },
  ];

  const handleItemSelect = useCallback((item: any) => {
    setSelectedItem(item);
  }, []);


  const toggleDetails = useCallback(() => {
    setShowDetails(!showDetails);
  }, [showDetails]);

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }, []);

  const formatDate = useCallback((date: Date | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  }, []);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-500 flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                  {data.path}
                </h1>
                <div className="text-sm font-body text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {data.itemCount} items • {formatBytes(data.totalSize)}
                </div>
              </div>
            </div>
            {isScanning && (
              <div className="flex items-center space-x-3 text-sm font-body text-blue-600 dark:text-blue-400">
                <div className="w-3 h-3 bg-blue-500"></div>
                <span className="font-bold uppercase tracking-wide">
                  {scanProgress?.phase === "immediate" ? "Quick Scan" : "Deep Scan"}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <CacheStatus rootPath={selectedDrive} onRefresh={onRescan} />
            
            {/* View controls */}
            <div className="flex items-center space-x-2">
              {activeTab === "visual" && (
                <button
                  onClick={toggleDetails}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={showDetails ? "Hide details" : "Show details"}
                >
                  {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2 px-8 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`btn-flat flex items-center space-x-3 px-6 py-3 font-body font-medium transition-all duration-200 relative group ${
                  activeTab === tab.id
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-body rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {tab.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "visual" && (
          <div className={`h-full flex ${viewMode === "split" && showDetails ? "flex-row" : "flex-col"}`}>
            <div className={`${viewMode === "split" && showDetails ? "flex-1" : "w-full h-full"}`}>
              <ModernTreemap
                data={data.items}
                onItemSelect={handleItemSelect}
                selectedItem={selectedItem}
                isScanning={isScanning}
                scanProgress={scanProgress}
              />
            </div>
            
            {viewMode === "split" && showDetails && selectedItem && (
              <div className="w-80 border-l border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedItem.name}
                    </h3>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 break-all">
                    {selectedItem.path}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Size:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatBytes(selectedItem.size || 0)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedItem.type}
                      </span>
                    </div>
                    
                    {selectedItem.extension && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Extension:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedItem.extension}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Modified:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedItem.modified)}
                      </span>
                    </div>
                    
                    {selectedItem.isPlaceholder && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          Still scanning...
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <button
                      onClick={() => window.electronAPI.openFolder(selectedItem.path)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Open in Finder
                    </button>
                    
                    {selectedItem.type === "file" && (
                      <button
                        onClick={() => {
                          // TODO: Implement file deletion
                          console.log("Delete file:", selectedItem.path);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Delete File
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "list" && (
          <ModernFileList
            data={data.items}
            onItemSelect={handleItemSelect}
            selectedItem={selectedItem}
            isScanning={isScanning}
            scanProgress={scanProgress}
          />
        )}
        
        {activeTab === "analysis" && <FileTypeAnalysis data={data.items} />}
        {activeTab === "cleanup" && <CleanupTools data={data} />}
      </div>
    </div>
  );
}
