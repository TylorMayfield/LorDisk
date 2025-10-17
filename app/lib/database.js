const fs = require("fs").promises;
const path = require("path");

class FileSystemCache {
  constructor() {
    this.cacheDir = null;
  }

  async initialize() {
    try {
      // Store cache in user data directory
      const { app } = require("electron");
      const userDataPath = app.getPath("userData");
      this.cacheDir = path.join(userDataPath, "lordisk_cache");

      // Create cache directory if it doesn't exist
      try {
        await fs.mkdir(this.cacheDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      console.log("File cache initialized successfully");
    } catch (error) {
      console.error("Failed to initialize file cache:", error);
      throw error;
    }
  }

  getCacheFilePath(rootPath) {
    // Create a safe filename from the root path
    const safePath = rootPath.replace(/[<>:"/\\|?*]/g, '_');
    return path.join(this.cacheDir, `${safePath}.json`);
  }

  async cacheDirectoryScan(rootPath, files, totalSize, fileCount, directoryCount) {
    try {
      const cacheData = {
        rootPath,
        files,
        totalSize,
        fileCount,
        directoryCount,
        timestamp: new Date().toISOString(),
      };

      const cacheFile = this.getCacheFilePath(rootPath);
      await fs.writeFile(cacheFile, JSON.stringify(cacheData, null, 2));
      
      console.log(`Cached ${files.length} files for ${rootPath}`);
    } catch (error) {
      console.error("Error caching directory scan:", error);
      throw error;
    }
  }

  async getCachedScan(rootPath, maxAgeHours = 24) {
    try {
      const cacheFile = this.getCacheFilePath(rootPath);
      
      try {
        const data = await fs.readFile(cacheFile, 'utf8');
        const cacheData = JSON.parse(data);
        
        // Check if cache is still valid
        const cacheTime = new Date(cacheData.timestamp);
        const maxAge = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
        
        if (cacheTime < maxAge) {
          return null; // Cache is too old
        }
        
        return cacheData.files;
      } catch (error) {
        // Cache file doesn't exist or is corrupted
        return null;
      }
    } catch (error) {
      console.error("Error getting cached scan:", error);
      return null;
    }
  }

  async getFileStats(rootPath) {
    try {
      const cacheFile = this.getCacheFilePath(rootPath);
      
      try {
        const data = await fs.readFile(cacheFile, 'utf8');
        const cacheData = JSON.parse(data);
        
        return {
          totalSize: cacheData.totalSize || 0,
          fileCount: cacheData.fileCount || 0,
          directoryCount: cacheData.directoryCount || 0,
          lastScan: cacheData.timestamp || null,
        };
      } catch (error) {
        return { totalSize: 0, fileCount: 0, directoryCount: 0, lastScan: null };
      }
    } catch (error) {
      console.error("Error getting file stats:", error);
      return { totalSize: 0, fileCount: 0, directoryCount: 0, lastScan: null };
    }
  }

  async searchFiles(rootPath, query, filters = {}) {
    try {
      const files = await this.getCachedScan(rootPath);
      if (!files) return [];

      let filteredFiles = files;

      if (query) {
        filteredFiles = filteredFiles.filter(file => 
          file.name.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (filters.minSize) {
        filteredFiles = filteredFiles.filter(file => file.size >= filters.minSize);
      }

      if (filters.maxSize) {
        filteredFiles = filteredFiles.filter(file => file.size <= filters.maxSize);
      }

      if (filters.type) {
        filteredFiles = filteredFiles.filter(file => file.type === filters.type);
      }

      if (filters.extension) {
        filteredFiles = filteredFiles.filter(file => file.extension === filters.extension);
      }

      return filteredFiles.slice(0, 1000); // Limit results
    } catch (error) {
      console.error("Error searching files:", error);
      return [];
    }
  }

  async getLargeFiles(rootPath, minSize) {
    try {
      const files = await this.getCachedScan(rootPath);
      if (!files) return [];

      return files
        .filter(file => file.type === 'file' && file.size >= minSize)
        .sort((a, b) => b.size - a.size)
        .slice(0, 100);
    } catch (error) {
      console.error("Error getting large files:", error);
      return [];
    }
  }

  async getOldFiles(rootPath, daysOld) {
    try {
      const files = await this.getCachedScan(rootPath);
      if (!files) return [];

      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      return files
        .filter(file => {
          if (file.type !== 'file') return false;
          const modifiedDate = new Date(file.modified);
          return modifiedDate < cutoffDate;
        })
        .sort((a, b) => new Date(a.modified) - new Date(b.modified))
        .slice(0, 100);
    } catch (error) {
      console.error("Error getting old files:", error);
      return [];
    }
  }

  async getFileTypeStats(rootPath) {
    try {
      const files = await this.getCachedScan(rootPath);
      if (!files) return [];

      const typeStats = {};
      
      files.forEach(file => {
        if (file.type === 'file' && file.extension) {
          if (!typeStats[file.extension]) {
            typeStats[file.extension] = {
              extension: file.extension,
              count: 0,
              totalSize: 0
            };
          }
          typeStats[file.extension].count++;
          typeStats[file.extension].totalSize += file.size;
        }
      });

      return Object.values(typeStats)
        .sort((a, b) => b.totalSize - a.totalSize)
        .slice(0, 20);
    } catch (error) {
      console.error("Error getting file type stats:", error);
      return [];
    }
  }

  async clearCache(rootPath) {
    try {
      const cacheFile = this.getCacheFilePath(rootPath);
      try {
        await fs.unlink(cacheFile);
        console.log(`Cleared cache for ${rootPath}`);
      } catch (error) {
        // File might not exist
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
      throw error;
    }
  }

  async getCacheSize() {
    try {
      const files = await fs.readdir(this.cacheDir);
      return files.length;
    } catch (error) {
      console.error("Error getting cache size:", error);
      return 0;
    }
  }

  async close() {
    // No persistent connections to close for file-based cache
  }
}

// Create singleton instance
const fileSystemCache = new FileSystemCache();

module.exports = { fileSystemCache };