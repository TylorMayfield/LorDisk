const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Drive operations
  getDrives: () => ipcRenderer.invoke("get-drives"),

  // Directory scanning
  scanDirectory: (path) => ipcRenderer.invoke("scan-directory", path),
  rescanDirectory: (path) => ipcRenderer.invoke("rescan-directory", path),
  getScanProgress: () => ipcRenderer.invoke("get-scan-progress"),

  // File operations
  deleteFile: (path) => ipcRenderer.invoke("delete-file", path),
  deleteDirectory: (path) => ipcRenderer.invoke("delete-directory", path),
  openFolder: (path) => ipcRenderer.invoke("open-folder", path),

  // Dialog operations
  selectFolder: () => ipcRenderer.invoke("select-folder"),

  // Database operations
  getCacheStats: (rootPath) => ipcRenderer.invoke("get-cache-stats", rootPath),
  searchFiles: (rootPath, query, filters) =>
    ipcRenderer.invoke("search-files", rootPath, query, filters),
  getLargeFiles: (rootPath, minSize) =>
    ipcRenderer.invoke("get-large-files", rootPath, minSize),
  getOldFiles: (rootPath, daysOld) =>
    ipcRenderer.invoke("get-old-files", rootPath, daysOld),
  getFileTypeStats: (rootPath) =>
    ipcRenderer.invoke("get-file-type-stats", rootPath),
  clearCache: (rootPath) => ipcRenderer.invoke("clear-cache", rootPath),
  getCacheSize: () => ipcRenderer.invoke("get-cache-size"),

  // Platform info
  platform: process.platform,

  // Utility functions
  formatBytes: (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  getFileIcon: (extension) => {
    // Import the file type system
    const { getFileTypeIcon } = require("./app/lib/fileTypes");
    return getFileTypeIcon(extension);
  },

  generateCategoryColor: (extension) => {
    // Import the color utility system
    const { generateCategoryColor } = require("./app/lib/colorUtils");
    return generateCategoryColor(extension);
  },
});
