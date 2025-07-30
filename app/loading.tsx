import { LoadingSpinner } from "./components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading LorDisk...
        </p>
      </div>
    </div>
  );
}
