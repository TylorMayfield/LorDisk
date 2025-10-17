"use client";

import { useState, useMemo, useCallback } from "react";
import { 
  ChevronUp, 
  ChevronDown, 
  File, 
  Folder, 
  HardDrive,
  Calendar,
  Clock,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";

interface FileItem {
  name: string;
  path: string;
  size: number;
  type: "file" | "directory";
  extension?: string;
  modified?: Date;
  created?: Date;
  children?: FileItem[];
  isPlaceholder?: boolean;
}

interface ModernFileListProps {
  data: FileItem[];
  onItemSelect?: (item: FileItem | null) => void;
  selectedItem?: FileItem | null;
  isScanning?: boolean;
  scanProgress?: {
    phase: string;
    currentDirectory: string;
    scannedFiles: number;
    scannedDirectories: number;
  };
}

type SortField = "name" | "size" | "type" | "modified" | "created";
type SortDirection = "asc" | "desc";

export function ModernFileList({
  data,
  onItemSelect,
  selectedItem,
  isScanning = false,
  scanProgress
}: ModernFileListProps) {
  const [sortField, setSortField] = useState<SortField>("size");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "files" | "directories">("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Flatten the tree structure for display
  const flattenedData = useMemo(() => {
    const flatten = (items: FileItem[], level = 0, parentPath = ""): (FileItem & { level: number; parentPath: string })[] => {
      const result: (FileItem & { level: number; parentPath: string })[] = [];
      
      for (const item of items) {
        result.push({ ...item, level, parentPath });
        
        // Add children if item is expanded and has children
        if (expandedItems.has(item.path) && item.children && item.children.length > 0) {
          result.push(...flatten(item.children, level + 1, item.path));
        }
      }
      
      return result;
    };
    
    return flatten(data);
  }, [data, expandedItems]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = flattenedData.filter(item => {
      // Search filter
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filterType === "files" && item.type !== "file") return false;
      if (filterType === "directories" && item.type !== "directory") return false;
      
      return true;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "size":
          aValue = a.size || 0;
          bValue = b.size || 0;
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "modified":
          aValue = a.modified ? new Date(a.modified).getTime() : 0;
          bValue = b.modified ? new Date(b.modified).getTime() : 0;
          break;
        case "created":
          aValue = a.created ? new Date(a.created).getTime() : 0;
          bValue = b.created ? new Date(b.created).getTime() : 0;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [flattenedData, searchQuery, filterType, sortField, sortDirection]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }, [sortField, sortDirection]);

  const toggleExpanded = useCallback((path: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedItems(newExpanded);
  }, [expandedItems]);

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

  const getFileIcon = useCallback((item: FileItem) => {
    if (item.type === "directory") {
      return expandedItems.has(item.path) ? 
        <Folder className="w-4 h-4 text-blue-500" /> : 
        <Folder className="w-4 h-4 text-blue-400" />;
    }
    
    // File type icons based on extension
    const extension = item.extension?.toLowerCase() || "";
    if (extension === ".exe" || extension === ".app") {
      return <HardDrive className="w-4 h-4 text-green-500" />;
    }
    
    return <File className="w-4 h-4 text-gray-500" />;
  }, [expandedItems]);

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortDirection === "asc" ? 
            <ChevronUp className="w-3 h-3" /> : 
            <ChevronDown className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header with search and filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "all" | "files" | "directories")}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Items</option>
            <option value="files">Files Only</option>
            <option value="directories">Directories Only</option>
          </select>

          {/* Scan status */}
          {isScanning && (
            <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>{scanProgress?.phase === "immediate" ? "Quick Scan" : "Deep Scan"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              <SortableHeader field="name">Name</SortableHeader>
              <SortableHeader field="size">Size</SortableHeader>
              <SortableHeader field="type">Type</SortableHeader>
              <SortableHeader field="modified">Modified</SortableHeader>
              <SortableHeader field="created">Created</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedData.map((item, index) => (
              <tr
                key={`${item.path}-${index}`}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                  selectedItem?.path === item.path ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
                onClick={() => onItemSelect?.(item)}
                style={{ paddingLeft: `${item.level * 20}px` }}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {item.type === "directory" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(item.path);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        {expandedItems.has(item.path) ? 
                          <ChevronDown className="w-3 h-3" /> : 
                          <ChevronUp className="w-3 h-3 transform rotate-90" />
                        }
                      </button>
                    )}
                    {getFileIcon(item)}
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                      {item.name}
                    </span>
                    {item.isPlaceholder && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                        Scanning...
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatBytes(item.size || 0)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {item.type === "directory" ? "Directory" : (item.extension || "File")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(item.modified)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(item.created)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement context menu
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              {searchQuery || filterType !== "all" ? "No items match your filters" : "No items found"}
            </div>
          </div>
        )}
      </div>

      {/* Footer with summary */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            {filteredAndSortedData.length} items
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
          <div>
            Total: {formatBytes(filteredAndSortedData.reduce((sum, item) => sum + (item.size || 0), 0))}
          </div>
        </div>
      </div>
    </div>
  );
}
