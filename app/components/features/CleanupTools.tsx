"use client";

import { useState, useMemo } from "react";
import {
  Trash2,
  AlertTriangle,
  FileType,
  Clock,
  HardDrive,
} from "lucide-react";
import { FileTypeCard } from "../cleanup/FileTypeCard";
import { FileItem } from "../cleanup/FileItem";
import { CleanupSection } from "../cleanup/CleanupSection";
import {
  getFileTypeStats,
  getCategoryInfo,
  getFileTypeCategory,
} from "../../lib/fileTypes";

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
    return getFileTypeStats(data.items);
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

  const handleFileTypeToggle = (category: string) => {
    const newSelected = new Set(selectedFileTypes);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedFileTypes(newSelected);
  };

  const handleDeleteFileTypes = async () => {
    if (selectedFileTypes.size === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete all files of the selected categories?\n\nThis will permanently delete:\n${Array.from(
        selectedFileTypes
      )
        .map((cat) => getCategoryInfo(cat).name)
        .join(", ")}\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const filesToDelete = data.items.filter((item) => {
        if (item.type !== "file" || !item.extension) return false;
        const category = getFileTypeCategory(item.extension);
        return selectedFileTypes.has(category);
      });

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
              <FileTypeCard
                key={stat.category}
                category={stat.category}
                count={stat.count}
                totalSize={stat.totalSize}
                extensions={stat.extensions}
                isSelected={selectedFileTypes.has(stat.category)}
                onToggle={handleFileTypeToggle}
              />
            ))}
          </div>
        </div>

        {/* Large Files */}
        <CleanupSection
          title={<span>Large Files ({">"}100MB)</span>}
          icon={HardDrive}
          isEmpty={largeFiles.length === 0}
          emptyMessage="No large files found"
        >
          {largeFiles.map((file) => (
            <FileItem key={file.path} file={file} onDelete={handleDeleteFile} />
          ))}
        </CleanupSection>

        {/* Old Files */}
        <CleanupSection
          title="Old Files (>30 days)"
          icon={Clock}
          isEmpty={oldFiles.length === 0}
          emptyMessage="No old files found"
        >
          {oldFiles.map((file) => (
            <FileItem
              key={file.path}
              file={file}
              onDelete={handleDeleteFile}
              showDate={true}
            />
          ))}
        </CleanupSection>

        {/* Potential Duplicates */}
        <CleanupSection
          title="Potential Duplicates"
          icon={AlertTriangle}
          isEmpty={potentialDuplicates.length === 0}
          emptyMessage="No potential duplicates found"
        >
          {potentialDuplicates.map((file) => (
            <FileItem key={file.path} file={file} onDelete={handleDeleteFile} />
          ))}
        </CleanupSection>
      </div>
    </div>
  );
}
