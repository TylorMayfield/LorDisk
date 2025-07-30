"use client";

import { ArrowUpDown } from "lucide-react";

interface SortableHeaderProps<T extends string = string> {
  label: string;
  field: T;
  currentSort: T;
  currentDirection: "asc" | "desc";
  onSort: (field: T) => void;
}

export function SortableHeader<T extends string = string>({
  label,
  field,
  currentSort,
  currentDirection,
  onSort,
}: SortableHeaderProps<T>) {
  const isActive = currentSort === field;

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
    >
      <span>{label}</span>
      <ArrowUpDown
        className={`w-4 h-4 ${isActive ? "text-primary-600" : "text-gray-400"}`}
      />
    </button>
  );
}
