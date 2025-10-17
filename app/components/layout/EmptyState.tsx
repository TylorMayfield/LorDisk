"use client";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full main-content">
      <div className="text-center card-flat p-12 max-w-lg">
        {icon && (
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h2>
        <p className="text-lg font-body text-gray-700 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
