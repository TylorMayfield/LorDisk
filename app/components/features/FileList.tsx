"use client";

import { useState, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { SearchBar } from "../ui/SearchBar";
import { SortableHeader } from "../ui/SortableHeader";
import { FileRow } from "../ui/FileRow";

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

export function FileList({ data }: FileListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("size");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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
  };

  const handleOpenFolder = async (itemPath: string) => {
    try {
      await window.electronAPI.openFolder(itemPath);
    } catch (error) {
      console.error("Error opening folder:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              className="w-64"
            />

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

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredAndSortedItems.length} of {data.items.length} items
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.size === filteredAndSortedItems.length &&
                    filteredAndSortedItems.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  label="Name"
                  field="name"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  label="Size"
                  field="size"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  label="Type"
                  field="type"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  label="Modified"
                  field="modified"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedItems.map((item) => (
              <FileRow
                key={item.path}
                item={item}
                isSelected={selectedItems.has(item.path)}
                onSelect={handleSelectItem}
                onOpenFolder={handleOpenFolder}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
