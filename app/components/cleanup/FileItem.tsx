"use client";

import { FileIcon } from "../ui/FileIcon";

interface FileItemProps {
  file: any;
  onDelete: (path: string) => void;
  showDate?: boolean;
}

export function FileItem({ file, onDelete, showDate = false }: FileItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center space-x-3">
        <FileIcon type="file" extension={file.extension} className="w-5 h-5" />
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {file.name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {showDate
              ? `Modified: ${new Date(file.modified).toLocaleDateString()}`
              : window.electronAPI.formatBytes(file.size)}
          </div>
        </div>
      </div>
      <button onClick={() => onDelete(file.path)} className="btn-danger">
        Delete
      </button>
    </div>
  );
}
