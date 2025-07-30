"use client";

import { ExternalLink } from "lucide-react";
import { FileIcon } from "./FileIcon";

interface FileRowProps {
  item: any;
  isSelected: boolean;
  onSelect: (path: string) => void;
  onOpenFolder: (path: string) => void;
}

export function FileRow({
  item,
  isSelected,
  onSelect,
  onOpenFolder,
}: FileRowProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(item.path)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <FileIcon type={item.type} extension={item.extension} />
          <span className="text-gray-900 dark:text-white font-medium">
            {item.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
        {window.electronAPI.formatBytes(item.size)}
      </td>
      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
        {item.type === "directory" ? "Folder" : item.extension || "File"}
      </td>
      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
        {formatDate(item.modified)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          {item.type === "directory" && (
            <button
              onClick={() => onOpenFolder(item.path)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Open folder"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
