"use client";

import { useState } from "react";
import { FileList } from "./features/FileList";
import { VisualChart } from "./VisualChart";
import { CleanupTools } from "./features/CleanupTools";
import { FileTypeAnalysis } from "./features/FileTypeAnalysis";
import { CacheStatus } from "./ui/CacheStatus";
import { BarChart3, List, Trash2, FileType, HardDrive } from "lucide-react";

interface DirectoryData {
  path: string;
  items: any[];
  totalSize: number;
  itemCount: number;
}

interface DashboardProps {
  data: DirectoryData;
  selectedDrive: string;
  onRescan?: () => void;
}

type TabType = "visual" | "list" | "analysis" | "cleanup";

export function Dashboard({ data, selectedDrive, onRescan }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("visual");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const tabs = [
    { id: "visual", label: "Visual Chart", icon: BarChart3 },
    { id: "list", label: "File List", icon: List },
    { id: "analysis", label: "File Analysis", icon: FileType },
    { id: "cleanup", label: "Cleanup Tools", icon: Trash2 },
  ];

  return (
    <div className="h-full flex flex-col main-content">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {data.path}
              </h1>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {data.itemCount} items •{" "}
              {window.electronAPI.formatBytes(data.totalSize)}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <CacheStatus rootPath={selectedDrive} onRefresh={onRescan} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="flex space-x-1 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-gray-50 dark:bg-gray-700 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "visual" && (
          <div className="h-full flex">
            <div className="flex-1">
              <VisualChart
                data={data}
                onItemSelect={setSelectedItem}
                selectedItem={selectedItem}
              />
            </div>
            {selectedItem && (
              <div className="w-80 card border-l border-gray-200/60 dark:border-gray-700/60 p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedItem.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedItem.path}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Size:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {window.electronAPI.formatBytes(selectedItem.size)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Type:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedItem.type}
                      </span>
                    </div>
                    {selectedItem.extension && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Extension:
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedItem.extension}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Modified:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(selectedItem.modified).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() =>
                        window.electronAPI.openFolder(selectedItem.path)
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Open in Finder
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "list" && <FileList data={data} />}
        {activeTab === "analysis" && <FileTypeAnalysis data={data.items} />}
        {activeTab === "cleanup" && <CleanupTools data={data} />}
      </div>
    </div>
  );
}
