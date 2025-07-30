const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

class FileSystemCache {
  constructor() {
    this.db = null;
    this.dbPath = null;
  }

  async initialize() {
    try {
      // Store database in user data directory
      const { app } = require("electron");
      const userDataPath = app.getPath("userData");
      this.dbPath = path.join(userDataPath, "lordisk_cache.db");

      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database,
      });

      // Create tables if they don't exist
      await this.createTables();

      // Create indexes for better performance
      await this.createIndexes();

      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }

  async createTables() {
    if (!this.db) throw new Error("Database not initialized");

    // Files table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        size INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('file', 'directory')),
        extension TEXT,
        modified DATETIME NOT NULL,
        created DATETIME NOT NULL,
        parent_path TEXT,
        scan_timestamp DATETIME NOT NULL,
        FOREIGN KEY (parent_path) REFERENCES files (path)
      )
    `);

    // Scans table for tracking scan sessions
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        root_path TEXT NOT NULL,
        scan_timestamp DATETIME NOT NULL,
        total_size INTEGER NOT NULL,
        file_count INTEGER NOT NULL,
        directory_count INTEGER NOT NULL
      )
    `);

    // Cache metadata table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS cache_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async createIndexes() {
    if (!this.db) throw new Error("Database not initialized");

    // Create indexes for better query performance
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_files_path ON files (path);
      CREATE INDEX IF NOT EXISTS idx_files_parent_path ON files (parent_path);
      CREATE INDEX IF NOT EXISTS idx_files_type ON files (type);
      CREATE INDEX IF NOT EXISTS idx_files_extension ON files (extension);
      CREATE INDEX IF NOT EXISTS idx_files_size ON files (size);
      CREATE INDEX IF NOT EXISTS idx_files_modified ON files (modified);
      CREATE INDEX IF NOT EXISTS idx_scans_root_path ON scans (root_path);
      CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON scans (scan_timestamp);
    `);
  }

  async cacheDirectoryScan(
    rootPath,
    files,
    totalSize,
    fileCount,
    directoryCount
  ) {
    if (!this.db) throw new Error("Database not initialized");

    const scanTimestamp = new Date();

    try {
      await this.db.run("BEGIN TRANSACTION");

      // Clear existing data for this root path
      await this.db.run("DELETE FROM files WHERE path LIKE ?", `${rootPath}%`);
      await this.db.run("DELETE FROM scans WHERE root_path = ?", rootPath);

      // Insert new scan record
      await this.db.run(
        "INSERT INTO scans (root_path, scan_timestamp, total_size, file_count, directory_count) VALUES (?, ?, ?, ?, ?)",
        [rootPath, scanTimestamp, totalSize, fileCount, directoryCount]
      );

      // Insert file records
      for (const file of files) {
        await this.db.run(
          "INSERT INTO files (path, name, size, type, extension, modified, created, parent_path, scan_timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            file.path,
            file.name,
            file.size,
            file.type,
            file.extension || null,
            file.modified,
            file.created,
            file.parent_path || null,
            scanTimestamp,
          ]
        );
      }

      await this.db.run("COMMIT");
      console.log(`Cached ${files.length} files for ${rootPath}`);
    } catch (error) {
      await this.db.run("ROLLBACK");
      throw error;
    }
  }

  async getCachedScan(rootPath, maxAgeHours = 1) {
    if (!this.db) throw new Error("Database not initialized");

    try {
      // Check if we have recent cached data
      const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

      const scan = await this.db.get(
        "SELECT * FROM scans WHERE root_path = ? AND scan_timestamp > ? ORDER BY scan_timestamp DESC LIMIT 1",
        [rootPath, cutoffTime]
      );

      if (!scan) {
        return null;
      }

      // Get cached files
      const files = await this.db.all(
        "SELECT * FROM files WHERE path LIKE ? AND scan_timestamp = ?",
        [`${rootPath}%`, scan.scan_timestamp]
      );

      return files;
    } catch (error) {
      console.error("Error getting cached scan:", error);
      return null;
    }
  }

  async getFileStats(rootPath) {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const scan = await this.db.get(
        "SELECT * FROM scans WHERE root_path = ? ORDER BY scan_timestamp DESC LIMIT 1",
        [rootPath]
      );

      if (!scan) {
        return {
          totalSize: 0,
          fileCount: 0,
          directoryCount: 0,
          lastScan: null,
        };
      }

      return {
        totalSize: scan.total_size,
        fileCount: scan.file_count,
        directoryCount: scan.directory_count,
        lastScan: new Date(scan.scan_timestamp),
      };
    } catch (error) {
      console.error("Error getting file stats:", error);
      return {
        totalSize: 0,
        fileCount: 0,
        directoryCount: 0,
        lastScan: null,
      };
    }
  }

  async searchFiles(rootPath, query, filters = {}) {
    if (!this.db) throw new Error("Database not initialized");

    try {
      let sql = "SELECT * FROM files WHERE path LIKE ?";
      const params = [`${rootPath}%`];

      if (query) {
        sql += " AND (name LIKE ? OR path LIKE ?)";
        params.push(`%${query}%`, `%${query}%`);
      }

      if (filters.type) {
        sql += " AND type = ?";
        params.push(filters.type);
      }

      if (filters.minSize !== undefined) {
        sql += " AND size >= ?";
        params.push(filters.minSize);
      }

      if (filters.maxSize !== undefined) {
        sql += " AND size <= ?";
        params.push(filters.maxSize);
      }

      if (filters.extensions && filters.extensions.length > 0) {
        const placeholders = filters.extensions.map(() => "?").join(",");
        sql += ` AND extension IN (${placeholders})`;
        params.push(...filters.extensions);
      }

      sql += " ORDER BY size DESC";

      const files = await this.db.all(sql, params);
      return files;
    } catch (error) {
      console.error("Error searching files:", error);
      return [];
    }
  }

  async getLargeFiles(rootPath, minSize = 100 * 1024 * 1024) {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const files = await this.db.all(
        "SELECT * FROM files WHERE path LIKE ? AND type = 'file' AND size >= ? ORDER BY size DESC",
        [`${rootPath}%`, minSize]
      );

      return files;
    } catch (error) {
      console.error("Error getting large files:", error);
      return [];
    }
  }

  async getOldFiles(rootPath, daysOld = 30) {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const files = await this.db.all(
        "SELECT * FROM files WHERE path LIKE ? AND type = 'file' AND modified < ? ORDER BY modified ASC",
        [`${rootPath}%`, cutoffDate]
      );

      return files;
    } catch (error) {
      console.error("Error getting old files:", error);
      return [];
    }
  }

  async getFileTypeStats(rootPath) {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const stats = await this.db.all(
        `SELECT 
          extension,
          COUNT(*) as count,
          SUM(size) as totalSize
        FROM files 
        WHERE path LIKE ? AND type = 'file' AND extension IS NOT NULL
        GROUP BY extension
        ORDER BY totalSize DESC`,
        [`${rootPath}%`]
      );

      return stats;
    } catch (error) {
      console.error("Error getting file type stats:", error);
      return [];
    }
  }

  async clearCache(rootPath) {
    if (!this.db) throw new Error("Database not initialized");

    try {
      if (rootPath) {
        // Clear specific root path
        await this.db.run(
          "DELETE FROM files WHERE path LIKE ?",
          `${rootPath}%`
        );
        await this.db.run("DELETE FROM scans WHERE root_path = ?", rootPath);
      } else {
        // Clear all cache
        await this.db.run("DELETE FROM files");
        await this.db.run("DELETE FROM scans");
        await this.db.run("DELETE FROM cache_metadata");
      }

      console.log(`Cache cleared for ${rootPath || "all paths"}`);
    } catch (error) {
      console.error("Error clearing cache:", error);
      throw error;
    }
  }

  async getCacheSize() {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.get("SELECT COUNT(*) as count FROM files");
      return result ? result.count : 0;
    } catch (error) {
      console.error("Error getting cache size:", error);
      return 0;
    }
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

// Create and export a singleton instance
const fileSystemCache = new FileSystemCache();

module.exports = { fileSystemCache };
