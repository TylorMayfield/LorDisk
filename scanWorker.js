const { parentPort, workerData } = require("worker_threads");
const fs = require("fs").promises;
const path = require("path");

// Skip system directories that are usually not relevant
const skipDirs = [
  ".git",
  ".svn",
  "node_modules",
  ".DS_Store",
  "Thumbs.db",
  "node_modules",
  ".git",
  ".svn",
  ".hg",
  ".bzr",
  "__pycache__",
  ".pytest_cache",
  ".coverage",
  "*.pyc",
  "*.pyo",
  "*.pyd",
  ".Python",
  "env",
  "pip-log.txt",
  "pip-delete-this-directory.txt",
  ".tox",
  ".eggs",
  ".mypy_cache",
  ".dmypy.json",
  "dmypy.json",
  ".pyre",
  ".pytype",
  ".cprofile",
  ".profile",
  ".coverage.*",
  "nosetests.xml",
  "coverage.xml",
  "*.cover",
  "*.log",
  ".cache",
  ".pytest_cache",
  ".mypy_cache",
  ".hypothesis",
  ".coverage",
  "htmlcov",
  ".tox",
  ".venv",
  "env",
  "venv",
  "ENV",
  "env.bak",
  "venv.bak",
  ".spyderproject",
  ".spyproject",
  ".ropeproject",
  "/.idea",
  "/.vscode",
  "/.DS_Store",
  "/Thumbs.db",
  "/desktop.ini",
  "/$RECYCLE.BIN",
  "/System Volume Information",
  "/$Recycle.Bin",
  "/RECYCLER",
  "/found.000",
  "/found.001",
  "/found.002",
  "/found.003",
  "/found.004",
  "/found.005",
  "/found.006",
  "/found.007",
  "/found.008",
  "/found.009",
  "/found.010",
  "/found.011",
  "/found.012",
  "/found.013",
  "/found.014",
  "/found.015",
  "/found.016",
  "/found.017",
  "/found.018",
  "/found.019",
  "/found.020",
  "/found.021",
  "/found.022",
  "/found.023",
  "/found.024",
  "/found.025",
  "/found.026",
  "/found.027",
  "/found.028",
  "/found.029",
  "/found.030",
  "/found.031",
  "/found.032",
  "/found.033",
  "/found.034",
  "/found.035",
  "/found.036",
  "/found.037",
  "/found.038",
  "/found.039",
  "/found.040",
  "/found.041",
  "/found.042",
  "/found.043",
  "/found.044",
  "/found.045",
  "/found.046",
  "/found.047",
  "/found.048",
  "/found.049",
  "/found.050",
  "/found.051",
  "/found.052",
  "/found.053",
  "/found.054",
  "/found.055",
  "/found.056",
  "/found.057",
  "/found.058",
  "/found.059",
  "/found.060",
  "/found.061",
  "/found.062",
  "/found.063",
  "/found.064",
  "/found.065",
  "/found.066",
  "/found.067",
  "/found.068",
  "/found.069",
  "/found.070",
  "/found.071",
  "/found.072",
  "/found.073",
  "/found.074",
  "/found.075",
  "/found.076",
  "/found.077",
  "/found.078",
  "/found.079",
  "/found.080",
  "/found.081",
  "/found.082",
  "/found.083",
  "/found.084",
  "/found.085",
  "/found.086",
  "/found.087",
  "/found.088",
  "/found.089",
  "/found.090",
  "/found.091",
  "/found.092",
  "/found.093",
  "/found.094",
  "/found.095",
  "/found.096",
  "/found.097",
  "/found.098",
  "/found.099",
];

async function scanDirectoryParallel(dirPath, maxDepth = 3, currentDepth = 0) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const items = [];
    const subDirectories = [];
    let scannedFiles = 0;
    let scannedDirectories = 0;

    // Filter out system directories and separate files from directories
    for (const entry of entries) {
      if (skipDirs.includes(entry.name)) continue;

      const fullPath = path.join(dirPath, entry.name);

      try {
        const stats = await fs.stat(fullPath);

        if (entry.isDirectory()) {
          scannedDirectories++;
          if (currentDepth < maxDepth) {
            subDirectories.push({ path: fullPath, name: entry.name, stats });
          }
        } else {
          scannedFiles++;
          // Validate file size to prevent overflow
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
      currentDirectory: dirPath,
      scannedFiles,
      scannedDirectories,
    });

    // Process subdirectories in parallel if we haven't reached max depth
    if (currentDepth < maxDepth && subDirectories.length > 0) {
      // Limit concurrent operations to prevent overwhelming the system
      const batchSize = 10;
      const batches = [];

      for (let i = 0; i < subDirectories.length; i += batchSize) {
        const batch = subDirectories.slice(i, i + batchSize);
        const batchPromises = batch.map(async (dir) => {
          try {
            const children = await scanDirectoryParallel(
              dir.path,
              maxDepth,
              currentDepth + 1
            );
            const directorySize = children.reduce(
              (sum, item) => sum + (item.size || 0),
              0
            );

            // Validate directory size
            if (directorySize < 0 || directorySize > Number.MAX_SAFE_INTEGER) {
              console.warn(
                `Invalid directory size for ${dir.path}: ${directorySize}`
              );
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
            // If we can't scan a subdirectory, return it as a simple directory
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

        batches.push(Promise.allSettled(batchPromises));
      }

      // Process all batches
      const allBatchResults = await Promise.all(batches);
      const allResults = allBatchResults.flat();
      const successfulResults = allResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      items.push(...successfulResults);
    } else {
      // Add directories as simple entries if we've reached max depth
      for (const dir of subDirectories) {
        items.push({
          name: dir.name,
          path: dir.path,
          size: 0,
          type: "directory",
          children: [],
          modified: dir.stats.mtime,
          created: dir.stats.birthtime,
        });
      }
    }

    return items;
  } catch (error) {
    console.error(`Error scanning ${dirPath}:`, error.message);
    return [];
  }
}

// Handle messages from main thread
parentPort.on("message", async (data) => {
  try {
    const { dirPath, maxDepth } = data;
    const items = await scanDirectoryParallel(dirPath, maxDepth || 3);

    // Calculate total size with validation
    const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);

    // Debug: Log size information
    console.log(`Worker scan complete for ${dirPath}:`, {
      itemsCount: items.length,
      totalSize: totalSize,
      totalSizeGB: (totalSize / (1024 * 1024 * 1024)).toFixed(2),
      sampleSizes: items.slice(0, 5).map((item) => ({
        name: item.name,
        size: item.size,
        sizeMB: ((item.size || 0) / (1024 * 1024)).toFixed(2),
      })),
    });

    // Validate total size
    if (totalSize < 0 || totalSize > Number.MAX_SAFE_INTEGER) {
      console.warn(`Invalid total size for ${dirPath}: ${totalSize}`);
    }

    // Ensure we have a proper root item
    const rootItem = {
      name: path.basename(dirPath),
      path: dirPath,
      size: Math.max(0, Math.min(totalSize, Number.MAX_SAFE_INTEGER)),
      type: "directory",
      children: items,
      modified: new Date(),
      created: new Date(),
    };

    parentPort.postMessage({
      success: true,
      items: [rootItem],
      totalSize: rootItem.size,
      itemCount: items.length + 1, // +1 for root
    });
  } catch (error) {
    parentPort.postMessage({
      success: false,
      error: error.message,
    });
  }
});

// Send ready signal
parentPort.postMessage({ ready: true });
