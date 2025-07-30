"use client";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full main-content">
      <div className="text-center card p-8 max-w-md">
        {icon && <div className="mb-6 flex justify-center">{icon}</div>}
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-heading">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-body">
          {description}
        </p>
      </div>
    </div>
  );
}
