"use client";

import { useTheme } from "./ModernThemeProvider";
import { Moon, Sun, HardDrive } from "lucide-react";

export function Header() {
  const { theme, setTheme, actualTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(actualTheme === "light" ? "dark" : "light");
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-500 flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                LorDisk
              </h1>
              <p className="text-sm font-body text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Disk Space Analyzer
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-all duration-200"
            title={`Switch to ${actualTheme === "light" ? "dark" : "light"} mode`}
          >
            {actualTheme === "light" ? (
              <Moon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
