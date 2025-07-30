import { useState, useEffect } from "react";
import { Folder, File, HardDrive } from "lucide-react";

interface ScanProgressProps {
  currentPath?: string;
  scannedFiles?: number;
  scannedDirectories?: number;
  totalItems?: number;
  currentDirectory?: string;
}

export function ScanProgress({
  currentPath = "",
  scannedFiles = 0,
  scannedDirectories = 0,
  totalItems = 0,
  currentDirectory = "",
}: ScanProgressProps) {
  const [progressBlocks, setProgressBlocks] = useState<boolean[]>([]);
  const [currentBlock, setCurrentBlock] = useState(0);

  // Create animated progress blocks
  useEffect(() => {
    const blocks = Array(20).fill(false);
    setProgressBlocks(blocks);
  }, []);

  // Animate progress blocks
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBlock((prev) => {
        const newBlocks = [...progressBlocks];
        newBlocks[prev] = true;
        setProgressBlocks(newBlocks);
        return (prev + 1) % 20;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [progressBlocks]);

  const progress =
    totalItems > 0 ? (scannedFiles + scannedDirectories) / totalItems : 0;
  const progressPercent = Math.min(progress * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <HardDrive className="w-12 h-12 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            LorDisk
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Scanning Directory Structure
        </p>
      </div>

      {/* Progress Container */}
      <div className="w-full max-w-4xl card p-8">
        {/* Current Directory */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Folder className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Currently scanning:
            </span>
          </div>
          <div className="bg-gray-100/80 dark:bg-gray-700/80 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
              {currentDirectory || currentPath || "Initializing..."}
            </p>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4 mb-6">
          {/* Overall Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overall Progress
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Files Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <File className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Files Scanned
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {scannedFiles.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${Math.min((scannedFiles / 1000) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Directories Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Folder className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Directories Scanned
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {scannedDirectories.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${Math.min((scannedDirectories / 100) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Defrag-style Block Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Scan Blocks
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {progressBlocks.filter(Boolean).length}/20
            </span>
          </div>
          <div className="grid grid-cols-20 gap-1">
            {progressBlocks.map((filled, index) => (
              <div
                key={index}
                className={`h-4 rounded transition-all duration-200 ${
                  filled
                    ? "bg-blue-600"
                    : index === currentBlock
                    ? "bg-blue-300 dark:bg-blue-400"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {scannedFiles.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Files
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {scannedDirectories.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Directories
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(scannedFiles + scannedDirectories).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Items
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(progressPercent)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Complete
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This may take a while for large directories
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Scanning recursively through all subdirectories...
        </p>
      </div>
    </div>
  );
}
