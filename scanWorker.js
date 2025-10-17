const { parentPort, workerData } = require("worker_threads");
const fs = require("fs").promises;
const path = require("path");

// Skip system directories that are usually not relevant
const skipDirs = [
  ".git", ".svn", "node_modules", ".DS_Store", "Thumbs.db",
  ".hg", ".bzr", "__pycache__", ".pytest_cache", ".coverage",
  "*.pyc", "*.pyo", "*.pyd", ".Python", "env", "pip-log.txt",
  "pip-delete-this-directory.txt", ".tox", ".eggs", ".mypy_cache",
  ".dmypy.json", "dmypy.json", ".pyre", ".pytype", ".cprofile",
  ".profile", ".coverage.*", "nosetests.xml", "coverage.xml",
  "*.cover", "*.log", ".cache", ".pytest_cache", ".mypy_cache",
  ".hypothesis", ".coverage", "htmlcov", ".tox", ".venv", "env",
  "venv", "ENV", "env.bak", "venv.bak", ".spyderproject",
  ".spyproject", ".ropeproject", "/.idea", "/.vscode", "/.DS_Store",
  "/Thumbs.db", "/desktop.ini", "/$RECYCLE.BIN", "/System Volume Information",
  "/$Recycle.Bin", "/RECYCLER"
];

// Add found.* directories (Windows file recovery)
for (let i = 0; i < 100; i++) {
  skipDirs.push(`/found.${i.toString().padStart(3, '0')}`);
}

class StaggeredScanner {
  constructor() {
    this.isScanning = false;
    this.scanQueue = [];
    this.scannedPaths = new Set();
    this.batchSize = 50; // Process directories in batches
    this.delayBetweenBatches = 10; // ms delay between batches
    this.allResults = []; // Store all scanned results
    this.rootPath = null;
  }

  async scanDirectoryStaggered(dirPath, options = {}) {
    const {
      maxDepth = 10,
      immediateDepth = 2, // How deep to scan immediately
      backgroundDepth = 10, // How deep to scan in background
      onProgress = () => {},
      onDirectoryScanned = () => {}
    } = options;

    this.isScanning = true;
    this.scannedPaths.clear();
    this.allResults = [];
    this.rootPath = dirPath;
    
    try {
      // Phase 1: Immediate scan of root and immediate children
      const immediateResults = await this.scanImmediate(dirPath, immediateDepth, onProgress);
      
      // Send immediate results
      parentPort.postMessage({
        type: "immediate_results",
        data: immediateResults,
        path: dirPath
      });

      // Phase 2: Background scanning of deeper levels
      if (backgroundDepth > immediateDepth) {
        await this.scanBackground(dirPath, immediateDepth, backgroundDepth, onProgress, onDirectoryScanned);
      }

      // Final results - use the immediate results as the base and merge with background results
      const finalResults = {
        path: dirPath,
        items: immediateResults.items || [],
        totalSize: immediateResults.totalSize || 0,
        itemCount: immediateResults.itemCount || 0
      };
      
      parentPort.postMessage({
        type: "scan_complete",
        data: finalResults,
        path: dirPath
      });

    } catch (error) {
      parentPort.postMessage({
        type: "scan_error",
        error: error.message,
        path: dirPath
      });
    } finally {
      this.isScanning = false;
    }
  }

  async scanImmediate(dirPath, maxDepth, onProgress) {
    const results = await this.scanDirectoryRecursive(dirPath, 0, maxDepth, true);
    const totalSize = results.reduce((sum, item) => sum + (item.size || 0), 0);
    const itemCount = results.length;
    
    onProgress({
      phase: "immediate",
      currentPath: dirPath,
      scannedFiles: this.countFiles(results),
      scannedDirectories: this.countDirectories(results)
    });
    
    return {
      path: dirPath,
      items: results,
      totalSize,
      itemCount
    };
  }

  async scanBackground(dirPath, startDepth, maxDepth, onProgress, onDirectoryScanned) {
    // Get all directories that need deeper scanning
    const directoriesToScan = await this.getDirectoriesForBackgroundScan(dirPath, startDepth, maxDepth);
    
    // Process directories in batches
    for (let i = 0; i < directoriesToScan.length; i += this.batchSize) {
      const batch = directoriesToScan.slice(i, i + this.batchSize);
      
      // Process batch in parallel
      const batchPromises = batch.map(async (dirPath) => {
        if (this.scannedPaths.has(dirPath)) return null;
        
        try {
          const results = await this.scanDirectoryRecursive(dirPath, 0, maxDepth, false);
          this.scannedPaths.add(dirPath);
          
          onDirectoryScanned({
            path: dirPath,
            results: results,
            phase: "background"
          });
          
          return results;
        } catch (error) {
          console.warn(`Failed to scan ${dirPath}:`, error.message);
          return null;
        }
      });

      await Promise.allSettled(batchPromises);
      
      // Small delay between batches to prevent overwhelming the system
      if (i + this.batchSize < directoriesToScan.length) {
        await new Promise(resolve => setTimeout(resolve, this.delayBetweenBatches));
      }
    }
  }

  async getDirectoriesForBackgroundScan(rootPath, startDepth, maxDepth) {
    const directories = [];
    
    const scanForDirectories = async (currentPath, currentDepth) => {
      if (currentDepth >= startDepth) {
        directories.push(currentPath);
      }
      
      if (currentDepth < maxDepth) {
        try {
          const entries = await fs.readdir(currentPath, { withFileTypes: true });
          
          for (const entry of entries) {
            if (entry.isDirectory() && !skipDirs.includes(entry.name)) {
              const fullPath = path.join(currentPath, entry.name);
              await scanForDirectories(fullPath, currentDepth + 1);
            }
          }
        } catch (error) {
          // Skip inaccessible directories
        }
      }
    };
    
    await scanForDirectories(rootPath, 0);
    return directories;
  }

  async scanDirectoryRecursive(currentPath, currentDepth, maxDepth, isImmediate) {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      const items = [];
      const subDirectories = [];
      let scannedFiles = 0;
      let scannedDirectories = 0;

      // Filter out system directories and separate files from directories
      for (const entry of entries) {
        if (skipDirs.includes(entry.name)) continue;

        const fullPath = path.join(currentPath, entry.name);

        try {
          const stats = await fs.stat(fullPath);

          if (entry.isDirectory()) {
            scannedDirectories++;
            
            if (currentDepth < maxDepth) {
              subDirectories.push({ path: fullPath, name: entry.name, stats });
            } else {
              // Add as placeholder if we've reached max depth
              items.push({
                name: entry.name,
                path: fullPath,
                size: 0,
                type: "directory",
                children: [],
                modified: stats.mtime,
                created: stats.birthtime,
                isPlaceholder: true
              });
            }
          } else {
            scannedFiles++;
            const fileSize = stats.size || 0;
            
            if (fileSize < 0 || fileSize > Number.MAX_SAFE_INTEGER) {
              console.warn(`Invalid file size for ${fullPath}: ${fileSize}`);
              continue;
            }

            items.push({
              name: entry.name,
              path: fullPath,
              size: fileSize,
              type: "file",
              extension: path.extname(entry.name).toLowerCase(),
              modified: stats.mtime,
              created: stats.birthtime,
            });
          }
        } catch (error) {
          // Skip files we can't access
          continue;
        }
      }

      // Send progress update
      parentPort.postMessage({
        type: "progress",
        currentDirectory: currentPath,
        scannedFiles,
        scannedDirectories,
        phase: isImmediate ? "immediate" : "background"
      });

      // Process subdirectories
      if (currentDepth < maxDepth && subDirectories.length > 0) {
        // For immediate scanning, process all subdirectories
        // For background scanning, process in smaller batches
        const batchSize = isImmediate ? subDirectories.length : Math.min(5, subDirectories.length);
        
        for (let i = 0; i < subDirectories.length; i += batchSize) {
          const batch = subDirectories.slice(i, i + batchSize);
          
          const batchPromises = batch.map(async (dir) => {
            try {
              const children = await this.scanDirectoryRecursive(
                dir.path,
                currentDepth + 1,
                maxDepth,
                isImmediate
              );
              
              const directorySize = children.reduce((sum, item) => sum + (item.size || 0), 0);
              
              if (directorySize < 0 || directorySize > Number.MAX_SAFE_INTEGER) {
                console.warn(`Invalid directory size for ${dir.path}: ${directorySize}`);
                return {
                  name: dir.name,
                  path: dir.path,
                  size: 0,
                  type: "directory",
                  children: [],
                  modified: dir.stats.mtime,
                  created: dir.stats.birthtime,
                };
              }

              return {
                name: dir.name,
                path: dir.path,
                size: directorySize,
                type: "directory",
                children,
                modified: dir.stats.mtime,
                created: dir.stats.birthtime,
              };
            } catch (error) {
              return {
                name: dir.name,
                path: dir.path,
                size: 0,
                type: "directory",
                children: [],
                modified: dir.stats.mtime,
                created: dir.stats.birthtime,
              };
            }
          });

          const batchResults = await Promise.allSettled(batchPromises);
          const successfulResults = batchResults
            .filter(result => result.status === "fulfilled")
            .map(result => result.value);
          
          items.push(...successfulResults);
          
          // Small delay between batches for background scanning
          if (!isImmediate && i + batchSize < subDirectories.length) {
            await new Promise(resolve => setTimeout(resolve, 5));
          }
        }
      }

      return items;
    } catch (error) {
      console.error(`Error scanning ${currentPath}:`, error.message);
      return [];
    }
  }

  countFiles(items) {
    let count = 0;
    for (const item of items) {
      if (item.type === "file") {
        count++;
      } else if (item.children) {
        count += this.countFiles(item.children);
      }
    }
    return count;
  }

  countDirectories(items) {
    let count = 0;
    for (const item of items) {
      if (item.type === "directory") {
        count++;
        if (item.children) {
          count += this.countDirectories(item.children);
        }
      }
    }
    return count;
  }

  async getFinalResults(dirPath) {
    // Return the accumulated results
    return {
      path: dirPath,
      items: this.allResults,
      totalSize: this.allResults.reduce((sum, item) => sum + (item.size || 0), 0),
      itemCount: this.allResults.length
    };
  }
}

// Handle messages from main thread
parentPort.on("message", async (data) => {
  try {
    const { dirPath, options = {} } = data;
    console.log(`Worker: Starting scan for ${dirPath} with options:`, options);
    const scanner = new StaggeredScanner();
    
    await scanner.scanDirectoryStaggered(dirPath, {
      maxDepth: options.maxDepth || 10,
      immediateDepth: options.immediateDepth || 2,
      backgroundDepth: options.backgroundDepth || 10,
      onProgress: (progress) => {
        console.log(`Worker: Progress update:`, progress);
        parentPort.postMessage({
          type: "progress",
          ...progress
        });
      },
      onDirectoryScanned: (result) => {
        console.log(`Worker: Directory scanned:`, result.path);
        parentPort.postMessage({
          type: "directory_scanned",
          ...result
        });
      }
    });
  } catch (error) {
    console.error(`Worker: Scan error for ${data.dirPath}:`, error);
    parentPort.postMessage({
      type: "scan_error",
      error: error.message
    });
  }
});

// Send ready signal
parentPort.postMessage({ ready: true });