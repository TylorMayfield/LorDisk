"use client";

import { useState, useEffect, useCallback } from "react";
import { Database, RefreshCw, Trash2, Clock } from "lucide-react";

interface CacheStatusProps {
  rootPath: string;
  onRefresh?: () => void;
}

interface CacheStats {
  totalSize: number;
  fileCount: number;
  directoryCount: number;
  lastScan: string | number | Date | null;
}

export function CacheStatus({ rootPath, onRefresh }: CacheStatusProps) {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadCacheStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsData, size] = await Promise.all([
        window.electronAPI.getCacheStats(rootPath),
        window.electronAPI.getCacheSize(),
      ]);
      setStats(statsData);
      setCacheSize(size);
    } catch (error) {
      console.error("Error loading cache stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [rootPath]);

  useEffect(() => {
    loadCacheStats();
  }, [rootPath, loadCacheStats]);

  const handleClearCache = async () => {
    if (
      !confirm(
        "Are you sure you want to clear the cache? This will remove all cached data."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await window.electronAPI.clearCache(rootPath);
      await loadCacheStats();
      onRefresh?.();
    } catch (error) {
      console.error("Error clearing cache:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (date: string | number | Date | null) => {
    if (!date) return "Never";
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid date";
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Loading cache info...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center space-x-3">
        <Database className="w-5 h-5 text-blue-600" />
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Cache Status
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {stats?.lastScan ? (
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Last scan: {formatTimeAgo(stats.lastScan)}</span>
              </span>
            ) : (
              <span>No cached data</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {stats && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {stats.fileCount} files •{" "}
            {window.electronAPI.formatBytes(stats.totalSize)}
          </div>
        )}

        <button
          onClick={onRefresh}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          title="Rescan directory"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={handleClearCache}
          className="p-1 text-red-400 hover:text-red-600"
          title="Clear cache"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
