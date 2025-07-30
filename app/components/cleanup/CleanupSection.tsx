import React from "react";
import { LucideIcon } from "lucide-react";

interface CleanupSectionProps {
  title: React.ReactNode;
  icon: LucideIcon;
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
}

export function CleanupSection({
  title,
  icon: Icon,
  isEmpty,
  emptyMessage,
  children,
}: CleanupSectionProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>

      {isEmpty ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}
