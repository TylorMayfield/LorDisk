"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun, HardDrive } from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white/90 dark:bg-gray-800/90 border-b border-gray-200/60 dark:border-gray-700/60 backdrop-blur-md px-8 py-4 slide-in-down">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-7 h-7 text-blue-600 hover-scale" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
              LorDisk
            </h1>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Disk Space Analyzer
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 transition-all duration-200 focus-ring"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
