"use client";

import { useState, useMemo } from "react";
import {
  FileType,
  BarChart3,
  PieChart,
  TrendingUp,
  AlertTriangle,
  Info,
  Filter,
  Search,
} from "lucide-react";
import {
  getFileTypeStats,
  getCategoryInfo,
  getAllCategories,
  isSystemFile,
  isTemporary,
  isBackup,
} from "../../lib/fileTypes";

interface FileTypeAnalysisProps {
  data: any[];
}

interface AnalysisInsight {
  type: "warning" | "info" | "success";
  title: string;
  description: string;
  icon: any;
  value?: string;
}

export function FileTypeAnalysis({ data }: FileTypeAnalysisProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fileTypeStats = useMemo(() => {
    return getFileTypeStats(data);
  }, [data]);

  const insights = useMemo(() => {
    const insights: AnalysisInsight[] = [];
    const totalFiles = data.filter((item) => item.type === "file").length;
    const totalSize = data.reduce((sum, item) => sum + item.size, 0);

    // System files insight
    const systemFiles = data.filter(
      (item) =>
        item.type === "file" && item.extension && isSystemFile(item.extension)
    );
    if (systemFiles.length > 0) {
      const systemSize = systemFiles.reduce((sum, item) => sum + item.size, 0);
      insights.push({
        type: "warning",
        title: "System Files Detected",
        description: `${systemFiles.length} system files found`,
        icon: AlertTriangle,
        value: `${window.electronAPI.formatBytes(systemSize)} (${(
          (systemSize / totalSize) *
          100
        ).toFixed(1)}%)`,
      });
    }

    // Temporary files insight
    const tempFiles = data.filter(
      (item) =>
        item.type === "file" && item.extension && isTemporary(item.extension)
    );
    if (tempFiles.length > 0) {
      const tempSize = tempFiles.reduce((sum, item) => sum + item.size, 0);
      insights.push({
        type: "info",
        title: "Temporary Files",
        description: `${tempFiles.length} temporary files found`,
        icon: Info,
        value: `${window.electronAPI.formatBytes(tempSize)} (${(
          (tempSize / totalSize) *
          100
        ).toFixed(1)}%)`,
      });
    }

    // Backup files insight
    const backupFiles = data.filter(
      (item) =>
        item.type === "file" && item.extension && isBackup(item.extension)
    );
    if (backupFiles.length > 0) {
      const backupSize = backupFiles.reduce((sum, item) => sum + item.size, 0);
      insights.push({
        type: "info",
        title: "Backup Files",
        description: `${backupFiles.length} backup files found`,
        icon: Info,
        value: `${window.electronAPI.formatBytes(backupSize)} (${(
          (backupSize / totalSize) *
          100
        ).toFixed(1)}%)`,
      });
    }

    // Large file types
    const largeCategories = fileTypeStats.filter(
      (stat) => stat.totalSize > 100 * 1024 * 1024 // > 100MB
    );
    if (largeCategories.length > 0) {
      insights.push({
        type: "warning",
        title: "Large File Categories",
        description: `${largeCategories.length} categories using significant space`,
        icon: TrendingUp,
        value: largeCategories
          .map((cat) => getCategoryInfo(cat.category).name)
          .join(", "),
      });
    }

    return insights;
  }, [data, fileTypeStats]);

  const filteredStats = useMemo(() => {
    let filtered = fileTypeStats;

    if (selectedCategory) {
      filtered = filtered.filter((stat) => stat.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (stat) =>
          getCategoryInfo(stat.category)
            .name.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          stat.extensions.some((ext) =>
            ext.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    return filtered;
  }, [fileTypeStats, selectedCategory, searchTerm]);

  const categories = getAllCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileType className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            File Type Analysis
          </h2>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {fileTypeStats.length} categories •{" "}
          {data.filter((item) => item.type === "file").length} files
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === "warning"
                    ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                    : insight.type === "info"
                    ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                    : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Icon
                    className={`w-5 h-5 mt-0.5 ${
                      insight.type === "warning"
                        ? "text-yellow-600"
                        : insight.type === "info"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {insight.description}
                    </p>
                    {insight.value && (
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                        {insight.value}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.name} value={category.name.toLowerCase()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories or extensions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
          />
        </div>
      </div>

      {/* File Type Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <PieChart className="w-5 h-5" />
            <span>Category Breakdown</span>
          </h3>

          <div className="space-y-3">
            {filteredStats.map((stat) => {
              const categoryInfo = getCategoryInfo(stat.category);
              const percentage = (
                (stat.totalSize /
                  data.reduce((sum, item) => sum + item.size, 0)) *
                100
              ).toFixed(1);

              return (
                <div
                  key={stat.category}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${categoryInfo.color.replace(
                        "text-",
                        "bg-"
                      )}`}
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {categoryInfo.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.count} files • {stat.extensions.length} types
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {window.electronAPI.formatBytes(stat.totalSize)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Extension Details */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Extension Details</span>
          </h3>

          <div className="space-y-3">
            {filteredStats.slice(0, 10).map((stat) => (
              <div key={stat.category} className="space-y-2">
                <div className="font-medium text-gray-900 dark:text-white">
                  {getCategoryInfo(stat.category).name}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {stat.extensions.slice(0, 6).map((ext) => {
                    const filesWithExt = data.filter(
                      (item) => item.type === "file" && item.extension === ext
                    );
                    const extSize = filesWithExt.reduce(
                      (sum, item) => sum + item.size,
                      0
                    );

                    return (
                      <div
                        key={ext}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                      >
                        <span className="font-mono text-gray-600 dark:text-gray-400">
                          {ext}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {filesWithExt.length} files
                        </span>
                      </div>
                    );
                  })}
                  {stat.extensions.length > 6 && (
                    <div className="text-sm text-gray-500 dark:text-gray-500 col-span-2">
                      +{stat.extensions.length - 6} more extensions
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
