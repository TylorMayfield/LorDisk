const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { Worker } = require("worker_threads");
const { fileSystemCache } = require("./app/lib/database");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets", "icon.png"),
    titleBarStyle: "default",
    show: false,
  });

  // Load the Next.js app
  const isDev = process.env.NODE_ENV === "development";
  const port = process.env.PORT || 3000;
  const url = isDev
    ? `http://localhost:${port}`
    : `file://${path.join(__dirname, "out", "index.html")}`;

  mainWindow.loadURL(url);

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// App event handlers
app.whenReady().then(async () => {
  try {
    await fileSystemCache.initialize();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", async () => {
  try {
    await fileSystemCache.close();
    console.log("Database closed successfully");
  } catch (error) {
    console.error("Failed to close database:", error);
  }
});

// IPC handlers for file system operations
ipcMain.handle("get-drives", async () => {
  try {
    const drives = [];

    if (process.platform === "win32") {
      // Windows: Get drive letters
      const { exec } = require("child_process");
      const util = require("util");
      const execAsync = util.promisify(exec);

      const { stdout } = await execAsync(
        "wmic logicaldisk get size,freespace,caption"
      );
      const lines = stdout.trim().split("\n").slice(1);

      lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          const drive = parts[0];
          const freeSpace = parseInt(parts[1]);
          const totalSize = parseInt(parts[2]);

          if (freeSpace && totalSize) {
            drives.push({
              path: drive,
              name: `${drive} (${formatBytes(totalSize)})`,
              freeSpace,
              totalSize,
              usedSpace: totalSize - freeSpace,
            });
          }
        }
      });
    } else {
      // macOS and Linux: Get mounted volumes
      const { exec } = require("child_process");
      const util = require("util");
      const execAsync = util.promisify(exec);

      if (process.platform === "darwin") {
        const { stdout } = await execAsync('df -h | grep -E "^/dev/"');
        const lines = stdout.trim().split("\n");

        lines.forEach((line) => {
          const parts = line.trim().split(/\s+/);

          if (parts.length >= 9) {
            const mountPoint = parts[8];
            const totalSize = parseSize(parts[1]);
            const usedSize = parseSize(parts[2]);
            const freeSize = parseSize(parts[3]);

            if (totalSize > 0) {
              drives.push({
                path: mountPoint,
                name: `${mountPoint} (${parts[1]})`,
                freeSpace: freeSize,
                totalSize,
                usedSpace: usedSize,
              });
            }
          }
        });
      } else {
        const { stdout } = await execAsync('df -h | grep -E "^/dev/"');
        const lines = stdout.trim().split("\n");

        lines.forEach((line) => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 6) {
            const mountPoint = parts[5];
            const totalSize = parseSize(parts[1]);
            const usedSize = parseSize(parts[2]);
            const freeSize = parseSize(parts[3]);

            drives.push({
              path: mountPoint,
              name: `${mountPoint} (${parts[1]})`,
              freeSpace: freeSize,
              totalSize,
              usedSpace: usedSize,
            });
          }
        });
      }
    }

    return drives;
  } catch (error) {
    console.error("Error getting drives:", error);
    return [];
  }
});

// Progress tracking for scanning
let scanProgress = {
  currentDirectory: "",
  scannedFiles: 0,
  scannedDirectories: 0,
  totalItems: 0,
  isScanning: false,
};

ipcMain.handle("get-scan-progress", () => {
  return scanProgress;
});

ipcMain.handle("scan-directory", async (event, dirPath) => {
  try {
    // First, try to get cached data
    const cachedData = await fileSystemCache.getCachedScan(dirPath, 1); // 1 hour cache

    if (cachedData) {
      console.log(
        `Using cached data for ${dirPath} (${cachedData.length} files)`
      );

      // Reconstruct the directory hierarchy from cached data
      const itemsMap = new Map();
      const rootItems = [];

      // First pass: create all items
      cachedData.forEach((file) => {
        const item = {
          name: file.name,
          path: file.path,
          size: file.size,
          type: file.type,
          extension: file.extension,
          modified: file.modified,
          created: file.created,
          children: [],
        };
        itemsMap.set(file.path, item);
      });

      // Second pass: build hierarchy
      cachedData.forEach((file) => {
        const item = itemsMap.get(file.path);
        if (file.parent_path && file.parent_path !== dirPath) {
          const parent = itemsMap.get(file.parent_path);
          if (parent) {
            parent.children.push(item);
          }
        } else {
          rootItems.push(item);
        }
      });

      const totalSize = cachedData.reduce((sum, file) => sum + file.size, 0);
      return {
        path: dirPath,
        items: rootItems,
        totalSize,
        itemCount: cachedData.length,
      };
    }

    // If no cache, perform fresh scan
    console.log(`Performing parallel scan for ${dirPath}`);

    // Reset progress
    scanProgress = {
      currentDirectory: dirPath,
      scannedFiles: 0,
      scannedDirectories: 0,
      totalItems: 0,
      isScanning: true,
    };

    // Use parallel scanning for better performance
    let stats;
    try {
      stats = await scanDirectoryParallel(dirPath);
    } catch (error) {
      console.warn(
        "Parallel scanning failed, falling back to sequential scan:",
        error.message
      );
      stats = await scanDirectory(dirPath);
    }

    // Update progress when done
    scanProgress.isScanning = false;

    // Cache the results
    const fileRecords = stats.items.map((item) => ({
      path: item.path,
      name: item.name,
      size: item.size,
      type: item.type,
      extension: item.extension,
      modified: item.modified,
      created: item.created,
      parent_path:
        path.dirname(item.path) === dirPath ? null : path.dirname(item.path),
    }));

    await fileSystemCache.cacheDirectoryScan(
      dirPath,
      fileRecords,
      stats.totalSize,
      stats.items.filter((item) => item.type === "file").length,
      stats.items.filter((item) => item.type === "directory").length
    );

    return stats;
  } catch (error) {
    console.error("Error scanning directory:", error);
    throw error;
  }
});

ipcMain.handle("delete-file", async (event, filePath) => {
  try {
    const fs = require("fs").promises;
    await fs.unlink(filePath);
    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("delete-directory", async (event, dirPath) => {
  try {
    const fs = require("fs").promises;
    const path = require("path");

    async function deleteRecursive(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await deleteRecursive(fullPath);
        } else {
          await fs.unlink(fullPath);
        }
      }

      await fs.rmdir(dir);
    }

    await deleteRecursive(dirPath);
    return { success: true };
  } catch (error) {
    console.error("Error deleting directory:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("open-folder", async (event, folderPath) => {
  try {
    await shell.openPath(folderPath);
    return { success: true };
  } catch (error) {
    console.error("Error opening folder:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("select-folder", async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "Select Folder to Analyze",
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, path: result.filePaths[0] };
    }
    return { success: false, canceled: true };
  } catch (error) {
    console.error("Error selecting folder:", error);
    return { success: false, error: error.message };
  }
});

// Database operations
ipcMain.handle("get-cache-stats", async (event, rootPath) => {
  try {
    const stats = await fileSystemCache.getFileStats(rootPath);
    return stats;
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return { totalSize: 0, fileCount: 0, directoryCount: 0, lastScan: null };
  }
});

ipcMain.handle("search-files", async (event, rootPath, query, filters) => {
  try {
    const files = await fileSystemCache.searchFiles(rootPath, query, filters);
    return files;
  } catch (error) {
    console.error("Error searching files:", error);
    return [];
  }
});

ipcMain.handle("get-large-files", async (event, rootPath, minSize) => {
  try {
    const files = await fileSystemCache.getLargeFiles(rootPath, minSize);
    return files;
  } catch (error) {
    console.error("Error getting large files:", error);
    return [];
  }
});

ipcMain.handle("get-old-files", async (event, rootPath, daysOld) => {
  try {
    const files = await fileSystemCache.getOldFiles(rootPath, daysOld);
    return files;
  } catch (error) {
    console.error("Error getting old files:", error);
    return [];
  }
});

ipcMain.handle("get-file-type-stats", async (event, rootPath) => {
  try {
    const stats = await fileSystemCache.getFileTypeStats(rootPath);
    return stats;
  } catch (error) {
    console.error("Error getting file type stats:", error);
    return [];
  }
});

ipcMain.handle("clear-cache", async (event, rootPath) => {
  try {
    await fileSystemCache.clearCache(rootPath);
    return { success: true };
  } catch (error) {
    console.error("Error clearing cache:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("rescan-directory", async (event, dirPath) => {
  try {
    // Clear cache for this directory
    await fileSystemCache.clearCache(dirPath);

    // Perform fresh scan
    console.log(`Performing fresh rescan for ${dirPath}`);

    // Reset progress
    scanProgress = {
      currentDirectory: dirPath,
      scannedFiles: 0,
      scannedDirectories: 0,
      totalItems: 0,
      isScanning: true,
    };

    // Use parallel scanning for better performance
    let stats;
    try {
      stats = await scanDirectoryParallel(dirPath);
    } catch (error) {
      console.warn(
        "Parallel scanning failed, falling back to sequential scan:",
        error.message
      );
      stats = await scanDirectory(dirPath);
    }

    // Update progress when done
    scanProgress.isScanning = false;

    // Cache the results
    const fileRecords = stats.items.map((item) => ({
      path: item.path,
      name: item.name,
      size: item.size,
      type: item.type,
      extension: item.extension,
      modified: item.modified,
      created: item.created,
      parent_path:
        path.dirname(item.path) === dirPath ? null : path.dirname(item.path),
    }));

    await fileSystemCache.cacheDirectoryScan(
      dirPath,
      fileRecords,
      stats.totalSize,
      stats.items.filter((item) => item.type === "file").length,
      stats.items.filter((item) => item.type === "directory").length
    );

    return stats;
  } catch (error) {
    console.error("Error rescanning directory:", error);
    throw error;
  }
});

ipcMain.handle("get-cache-size", async () => {
  try {
    const size = await fileSystemCache.getCacheSize();
    return size;
  } catch (error) {
    console.error("Error getting cache size:", error);
    return 0;
  }
});

// Utility functions
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function parseSize(sizeStr) {
  const units = {
    K: 1024,
    M: 1024 * 1024,
    G: 1024 * 1024 * 1024,
    T: 1024 * 1024 * 1024 * 1024,
  };
  // Handle both "G" and "Gi" formats (macOS uses "Gi")
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)([KMGT])?i?$/);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2] || "";
    return Math.round(value * (units[unit] || 1));
  }
  return 0;
}

async function scanDirectoryParallel(dirPath) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "scanWorker.js"));

    worker.on("message", (data) => {
      if (data.ready) {
        // Worker is ready, send the scan request
        worker.postMessage({ dirPath, maxDepth: 5 });
      } else if (data.type === "progress") {
        // Update progress from worker
        scanProgress.currentDirectory = data.currentDirectory;
        scanProgress.scannedFiles += data.scannedFiles;
        scanProgress.scannedDirectories += data.scannedDirectories;
      } else if (data.success) {
        // Scan completed successfully
        worker.terminate();
        resolve({
          path: dirPath,
          items: data.items,
          totalSize: data.totalSize,
          itemCount: data.itemCount,
        });
      } else {
        // Scan failed
        worker.terminate();
        reject(new Error(data.error));
      }
    });

    worker.on("error", (error) => {
      worker.terminate();
      reject(error);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

async function scanDirectory(dirPath) {
  const fs = require("fs").promises;
  const path = require("path");

  async function scanRecursive(currentPath, depth = 0) {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      const items = [];

      // Skip system directories that are usually not relevant
      const skipDirs = [
        ".git",
        ".svn",
        "node_modules",
        ".DS_Store",
        "Thumbs.db",
      ];
      const filteredEntries = entries.filter(
        (entry) => !skipDirs.includes(entry.name)
      );

      for (const entry of filteredEntries) {
        const fullPath = path.join(currentPath, entry.name);

        try {
          const stats = await fs.stat(fullPath);

          if (entry.isDirectory()) {
            // Scan directories recursively without depth limit
            const children = await scanRecursive(fullPath, depth + 1);
            const directorySize = children.reduce(
              (sum, item) => sum + item.size,
              0
            );

            items.push({
              name: entry.name,
              path: fullPath,
              size: directorySize, // Use calculated size from children
              type: "directory",
              children,
              modified: stats.mtime,
              created: stats.birthtime,
            });
          } else {
            items.push({
              name: entry.name,
              path: fullPath,
              size: stats.size,
              type: "file",
              extension: path.extname(entry.name).toLowerCase(),
              modified: stats.mtime,
              created: stats.birthtime,
            });
          }
        } catch (error) {
          // Skip files we can't access
          console.warn(`Cannot access ${fullPath}:`, error.message);
        }
      }

      return items;
    } catch (error) {
      console.error(`Error scanning ${currentPath}:`, error);
      return [];
    }
  }

  console.log(`Starting recursive scan of ${dirPath}`);

  // Add progress tracking
  let scannedItems = 0;
  let scannedDirectories = 0;
  let currentDirectory = dirPath;

  async function scanWithProgress(currentPath, depth = 0) {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      const items = [];

      // Skip system directories that are usually not relevant
      const skipDirs = [
        ".git",
        ".svn",
        "node_modules",
        ".DS_Store",
        "Thumbs.db",
      ];
      const filteredEntries = entries.filter(
        (entry) => !skipDirs.includes(entry.name)
      );

      for (const entry of filteredEntries) {
        const fullPath = path.join(currentPath, entry.name);

        try {
          const stats = await fs.stat(fullPath);

          if (entry.isDirectory()) {
            scannedDirectories++;
            currentDirectory = fullPath;
            scanProgress.scannedDirectories = scannedDirectories;
            scanProgress.currentDirectory = fullPath;
            // Scan directories recursively without depth limit
            const children = await scanWithProgress(fullPath, depth + 1);
            const directorySize = children.reduce(
              (sum, item) => sum + item.size,
              0
            );

            items.push({
              name: entry.name,
              path: fullPath,
              size: directorySize, // Use calculated size from children
              type: "directory",
              children,
              modified: stats.mtime,
              created: stats.birthtime,
            });
          } else {
            scannedItems++;
            currentDirectory = fullPath;
            scanProgress.scannedFiles = scannedItems;
            scanProgress.currentDirectory = fullPath;
            items.push({
              name: entry.name,
              path: fullPath,
              size: stats.size,
              type: "file",
              extension: path.extname(entry.name).toLowerCase(),
              modified: stats.mtime,
              created: stats.birthtime,
            });
          }
        } catch (error) {
          // Skip files we can't access
          console.warn(`Cannot access ${fullPath}:`, error.message);
        }
      }

      return items;
    } catch (error) {
      console.error(`Error scanning ${currentPath}:`, error);
      return [];
    }
  }

  const items = await scanWithProgress(dirPath);
  const totalSize = items.reduce((sum, item) => sum + item.size, 0);
  console.log(
    `Scan complete. Found ${
      items.length
    } items (${scannedItems} files, ${scannedDirectories} directories), total size: ${formatBytes(
      totalSize
    )}`
  );

  return {
    path: dirPath,
    items,
    totalSize,
    itemCount: items.length,
  };
}
