"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  Folder,
  File,
  Trash2,
  ExternalLink,
  Calendar,
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
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface DirectoryData {
  path: string;
  items: any[];
  totalSize: number;
  itemCount: number;
}

interface FileListProps {
  data: DirectoryData;
}

type SortField = "name" | "size" | "type" | "modified";
type SortDirection = "asc" | "desc";

interface FileItemProps {
  item: any;
  level: number;
  searchTerm: string;
  sortField: SortField;
  sortDirection: SortDirection;
  selectedItems: Set<string>;
  onSelectItem: (itemPath: string) => void;
  onOpenFolder: (itemPath: string) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (folderPath: string) => void;
  animationDelay?: number;
}

function FileItem({
  item,
  level,
  searchTerm,
  sortField,
  sortDirection,
  selectedItems,
  onSelectItem,
  onOpenFolder,
  expandedFolders,
  onToggleFolder,
  animationDelay = 0,
}: FileItemProps) {
  const isExpanded = expandedFolders.has(item.path);
  const hasChildren = item.children && item.children.length > 0;
  const isDirectory = item.type === "directory";

  // Filter children based on search term
  const filteredChildren = useMemo(() => {
    if (!hasChildren) return [];

    let children = item.children.filter((child: any) =>
      child.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort children
    children.sort((a: any, b: any) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "size":
          aValue = a.size;
          bValue = b.size;
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "modified":
          aValue = new Date(a.modified).getTime();
          bValue = new Date(b.modified).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return children;
  }, [item.children, searchTerm, sortField, sortDirection, hasChildren]);

  const getFileIcon = (item: any) => {
    if (item.type === "directory") {
      return <Folder className="w-4 h-4 text-blue-600" />;
    }

    // Use colored block for files based on extension
    const extension = item.extension || "";
    const color = window.electronAPI.generateCategoryColor(extension);
    return (
      <div
        className="w-4 h-4 rounded-sm"
        style={{ backgroundColor: color }}
        title={extension || "Unknown file type"}
      />
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <tr
        className={`table-row ${
          selectedItems.has(item.path) ? "table-row-selected" : ""
        }`}
        style={{
          paddingLeft: `${level * 20}px`,
          animationDelay: `${animationDelay}s`,
          animation: "slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1) both",
        }}
      >
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selectedItems.has(item.path)}
            onChange={() => onSelectItem(item.path)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus-ring"
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div style={{ marginLeft: `${level * 20}px` }} />
            {isDirectory && hasChildren && (
              <button
                onClick={() => onToggleFolder(item.path)}
                className="folder-toggle p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
            {isDirectory && !hasChildren && <div className="w-6" />}
            <div className="file-icon">{getFileIcon(item)}</div>
            <span className="text-gray-900 dark:text-white font-medium text-sm">
              {item.name}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
          {window.electronAPI.formatBytes(item.size)}
        </td>
        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
          {item.type === "directory" ? "Folder" : item.extension || "File"}
        </td>
        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
          {formatDate(item.modified)}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            {item.type === "directory" && (
              <button
                onClick={() => onOpenFolder(item.path)}
                className="icon-hover p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                title="Open folder"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
      {isDirectory &&
        isExpanded &&
        filteredChildren.map((child: any) => (
          <FileItem
            key={child.path}
            item={child}
            level={level + 1}
            searchTerm={searchTerm}
            sortField={sortField}
            sortDirection={sortDirection}
            selectedItems={selectedItems}
            onSelectItem={onSelectItem}
            onOpenFolder={onOpenFolder}
            expandedFolders={expandedFolders}
            onToggleFolder={onToggleFolder}
          />
        ))}
    </>
  );
}

export function FileList({ data }: FileListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("size");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const filteredAndSortedItems = useMemo(() => {
    let filtered = data.items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "size":
          aValue = a.size;
          bValue = b.size;
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "modified":
          aValue = new Date(a.modified).getTime();
          bValue = new Date(b.modified).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data.items, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleSelectItem = (itemPath: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemPath)) {
      newSelected.delete(itemPath);
    } else {
      newSelected.add(itemPath);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(
        new Set(filteredAndSortedItems.map((item) => item.path))
      );
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedItems.size} selected item(s)?`
    );
    if (!confirmed) return;

    for (const itemPath of Array.from(selectedItems)) {
      try {
        const item = data.items.find((item) => item.path === itemPath);
        if (item?.type === "directory") {
          await window.electronAPI.deleteDirectory(itemPath);
        } else {
          await window.electronAPI.deleteFile(itemPath);
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }

    setSelectedItems(new Set());
    // Refresh the data (you might want to add a callback prop for this)
  };

  const handleOpenFolder = async (itemPath: string) => {
    try {
      await window.electronAPI.openFolder(itemPath);
    } catch (error) {
      console.error("Error opening folder:", error);
    }
  };

  const handleToggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 pr-4 w-80"
              />
            </div>

            {selectedItems.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="btn-danger flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected ({selectedItems.size})</span>
              </button>
            )}
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {filteredAndSortedItems.length} of {data.items.length} items
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="table-header sticky top-0">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.size === filteredAndSortedItems.length &&
                    filteredAndSortedItems.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus-ring"
                />
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center space-x-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150 text-sm font-medium"
                >
                  <span>Name</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("size")}
                  className="flex items-center space-x-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150 text-sm font-medium"
                >
                  <span>Size</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("type")}
                  className="flex items-center space-x-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150 text-sm font-medium"
                >
                  <span>Type</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort("modified")}
                  className="flex items-center space-x-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150 text-sm font-medium"
                >
                  <span>Modified</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
            {filteredAndSortedItems.map((item, index) => (
              <FileItem
                key={item.path}
                item={item}
                level={0}
                searchTerm={searchTerm}
                sortField={sortField}
                sortDirection={sortDirection}
                selectedItems={selectedItems}
                onSelectItem={handleSelectItem}
                onOpenFolder={handleOpenFolder}
                expandedFolders={expandedFolders}
                onToggleFolder={handleToggleFolder}
                animationDelay={index * 0.05}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
