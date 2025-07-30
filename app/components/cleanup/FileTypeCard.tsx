"use client";

import { FileIcon } from "../ui/FileIcon";
import { getCategoryInfo, getFileTypeIcon } from "../../lib/fileTypes";

interface FileTypeCardProps {
  category: string;
  count: number;
  totalSize: number;
  extensions: string[];
  isSelected: boolean;
  onToggle: (category: string) => void;
}

export function FileTypeCard({
  category,
  count,
  totalSize,
  extensions,
  isSelected,
  onToggle,
}: FileTypeCardProps) {
  const categoryInfo = getCategoryInfo(category);
  const primaryExtension = extensions[0] || "";
  const iconName = getFileTypeIcon(primaryExtension);

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
        isSelected
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      onClick={() => onToggle(category)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <FileIcon
            type="file"
            extension={primaryExtension}
            className="w-5 h-5"
          />
          <span className="font-medium text-gray-900 dark:text-white">
            {categoryInfo.name}
          </span>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(category)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {count} files • {window.electronAPI.formatBytes(totalSize)}
      </div>
      {extensions.length > 1 && (
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {extensions.slice(0, 3).join(", ")}
          {extensions.length > 3 && ` +${extensions.length - 3} more`}
        </div>
      )}
    </div>
  );
}
