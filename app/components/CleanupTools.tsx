"use client";

import { useState, useMemo } from "react";
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileType,
  Clock,
  HardDrive,
  FileText,
  BarChart3,
  Presentation,
  Image,
  Music,
  Video,
  Archive,
  Settings,
  Code,
  Globe,
  Palette,
  FileJson,
} from "lucide-react";

interface DirectoryData {
  path: string;
  items: any[];
  totalSize: number;
  itemCount: number;
}

interface CleanupToolsProps {
  data: DirectoryData;
}

interface FileTypeStats {
  extension: string;
  count: number;
  totalSize: number;
  icon: string;
}

export function CleanupTools({ data }: CleanupToolsProps) {
  const [selectedFileTypes, setSelectedFileTypes] = useState<Set<string>>(
    new Set()
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fileTypeStats = useMemo(() => {
    const stats: { [key: string]: FileTypeStats } = {};

    data.items.forEach((item) => {
      if (item.type === "file" && item.extension) {
        if (!stats[item.extension]) {
          stats[item.extension] = {
            extension: item.extension,
            count: 0,
            totalSize: 0,
            icon: window.electronAPI.getFileIcon(item.extension),
          };
        }
        stats[item.extension].count++;
        stats[item.extension].totalSize += item.size;
      }
    });

    return Object.values(stats).sort((a, b) => b.totalSize - a.totalSize);
  }, [data.items]);

  const largeFiles = useMemo(() => {
    return data.items
      .filter((item) => item.type === "file" && item.size > 100 * 1024 * 1024) // > 100MB
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
  }, [data.items]);

  const oldFiles = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return data.items
      .filter((item) => {
        const modifiedDate = new Date(item.modified);
        return modifiedDate < thirtyDaysAgo;
      })
      .sort(
        (a, b) =>
          new Date(a.modified).getTime() - new Date(b.modified).getTime()
      )
      .slice(0, 10);
  }, [data.items]);

  const potentialDuplicates = useMemo(() => {
    const sizeGroups: { [key: number]: any[] } = {};

    data.items
      .filter((item) => item.type === "file" && item.size > 1024 * 1024) // > 1MB
      .forEach((item) => {
        if (!sizeGroups[item.size]) {
          sizeGroups[item.size] = [];
        }
        sizeGroups[item.size].push(item);
      });

    return Object.values(sizeGroups)
      .filter((group) => group.length > 1)
      .flat()
      .slice(0, 10);
  }, [data.items]);

  const handleFileTypeToggle = (extension: string) => {
    const newSelected = new Set(selectedFileTypes);
    if (newSelected.has(extension)) {
      newSelected.delete(extension);
    } else {
      newSelected.add(extension);
    }
    setSelectedFileTypes(newSelected);
  };

  const handleDeleteFileTypes = async () => {
    if (selectedFileTypes.size === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete all files of the selected types?\n\nThis will permanently delete:\n${Array.from(
        selectedFileTypes
      ).join(", ")}\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const filesToDelete = data.items.filter(
        (item) => item.type === "file" && selectedFileTypes.has(item.extension)
      );

      for (const file of filesToDelete) {
        try {
          await window.electronAPI.deleteFile(file.path);
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }

      setSelectedFileTypes(new Set());
      alert(`Successfully deleted ${filesToDelete.length} files.`);
    } catch (error) {
      alert("Error deleting files. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this file? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await window.electronAPI.deleteFile(filePath);
      alert("File deleted successfully.");
    } catch (error) {
      alert("Error deleting file. Please try again.");
    }
  };

  const getFileTypeCategory = (extension: string) => {
    const categories = {
      image: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"],
      video: [".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm"],
      audio: [".mp3", ".wav", ".flac", ".aac", ".ogg", ".wma"],
      document: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"],
      archive: [".zip", ".rar", ".7z", ".tar", ".gz"],
      code: [".js", ".ts", ".py", ".java", ".cpp", ".c", ".html", ".css"],
    };

    for (const [category, extensions] of Object.entries(categories)) {
      if (extensions.includes(extension.toLowerCase())) {
        return category;
      }
    }
    return "other";
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      FileText: FileText,
      BarChart3: BarChart3,
      Presentation: Presentation,
      Image: Image,
      Music: Music,
      Video: Video,
      Archive: Archive,
      Settings: Settings,
      Code: Code,
      Globe: Globe,
      Palette: Palette,
      FileJson: FileJson,
    };
    return iconMap[iconName] || FileText;
  };

  const getFileIcon = (file: any) => {
    const iconName = window.electronAPI.getFileIcon(file.extension);
    const IconComponent = getIconComponent(iconName);
    return <IconComponent className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="space-y-6">
        {/* File Type Analysis */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <FileType className="w-5 h-5" />
              <span>File Type Analysis</span>
            </h3>
            {selectedFileTypes.size > 0 && (
              <button
                onClick={handleDeleteFileTypes}
                disabled={isDeleting}
                className="btn-danger flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected Types ({selectedFileTypes.size})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fileTypeStats.map((stat) => (
              <div
                key={stat.extension}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedFileTypes.has(stat.extension)
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                onClick={() => handleFileTypeToggle(stat.extension)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const iconName = stat.icon;
                      const IconComponent = getIconComponent(iconName);
                      return (
                        <IconComponent className="w-5 h-5 text-gray-600" />
                      );
                    })()}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stat.extension}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedFileTypes.has(stat.extension)}
                    onChange={() => handleFileTypeToggle(stat.extension)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.count} files •{" "}
                  {window.electronAPI.formatBytes(stat.totalSize)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Large Files */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <HardDrive className="w-5 h-5" />
            <span>Large Files ({">"}100MB)</span>
          </h3>

          <div className="space-y-2">
            {largeFiles.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {window.electronAPI.formatBytes(file.size)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFile(file.path)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            ))}
            {largeFiles.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No large files found
              </p>
            )}
          </div>
        </div>

        {/* Old Files */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Old Files ({">"}30 days)</span>
          </h3>

          <div className="space-y-2">
            {oldFiles.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Modified: {new Date(file.modified).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFile(file.path)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            ))}
            {oldFiles.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No old files found
              </p>
            )}
          </div>
        </div>

        {/* Potential Duplicates */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Potential Duplicates</span>
          </h3>

          <div className="space-y-2">
            {potentialDuplicates.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {window.electronAPI.formatBytes(file.size)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFile(file.path)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            ))}
            {potentialDuplicates.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No potential duplicates found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
