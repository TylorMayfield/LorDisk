import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import { app } from "electron";

interface FileRecord {
  id?: number;
  path: string;
  name: string;
  size: number;
  type: "file" | "directory";
  extension?: string;
  modified: Date;
  created: Date;
  parent_path?: string;
  scan_timestamp: Date;
}

interface ScanRecord {
  id?: number;
  root_path: string;
  scan_timestamp: Date;
  total_size: number;
  file_count: number;
  directory_count: number;
}

class FileSystemCache {
  private db: Database | null = null;
  private dbPath: string;

  constructor() {
    // Store database in user data directory
    const userDataPath = app.getPath("userData");
    this.dbPath = path.join(userDataPath, "lordisk_cache.db");
  }

  async initialize(): Promise<void> {
    try {
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

  private async createTables(): Promise<void> {
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

  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    // Indexes for better query performance
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_files_path ON files (path);
      CREATE INDEX IF NOT EXISTS idx_files_parent ON files (parent_path);
      CREATE INDEX IF NOT EXISTS idx_files_type ON files (type);
      CREATE INDEX IF NOT EXISTS idx_files_size ON files (size);
      CREATE INDEX IF NOT EXISTS idx_files_modified ON files (modified);
      CREATE INDEX IF NOT EXISTS idx_files_scan_timestamp ON files (scan_timestamp);
      CREATE INDEX IF NOT EXISTS idx_scans_root_path ON scans (root_path);
      CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON scans (scan_timestamp);
    `);
  }

  async cacheDirectoryScan(
    rootPath: string,
    files: FileRecord[],
    totalSize: number,
    fileCount: number,
    directoryCount: number
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const scanTimestamp = new Date();

    try {
      await this.db.run("BEGIN TRANSACTION");

      // Record the scan session
      await this.db.run(
        `
        INSERT INTO scans (root_path, scan_timestamp, total_size, file_count, directory_count)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          rootPath,
          scanTimestamp.toISOString(),
          totalSize,
          fileCount,
          directoryCount,
        ]
      );

      // Clear old data for this path
      await this.db.run(
        `
        DELETE FROM files 
        WHERE path LIKE ? AND scan_timestamp < ?
      `,
        [
          `${rootPath}%`,
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        ]
      ); // Keep last 24 hours

      // Insert new file records
      const insertStmt = await this.db.prepare(`
        INSERT OR REPLACE INTO files 
        (path, name, size, type, extension, modified, created, parent_path, scan_timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const file of files) {
        await insertStmt.run([
          file.path,
          file.name,
          file.size,
          file.type,
          file.extension,
          file.modified.toISOString(),
          file.created.toISOString(),
          file.parent_path,
          scanTimestamp.toISOString(),
        ]);
      }

      await insertStmt.finalize();
      await this.db.run("COMMIT");

      console.log(`Cached ${files.length} files for ${rootPath}`);
    } catch (error) {
      await this.db?.run("ROLLBACK");
      console.error("Failed to cache directory scan:", error);
      throw error;
    }
  }

  async getCachedScan(
    rootPath: string,
    maxAgeHours: number = 1
  ): Promise<FileRecord[] | null> {
    if (!this.db) throw new Error("Database not initialized");

    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

    // Check if we have recent data
    const scan = await this.db.get(
      `
      SELECT * FROM scans 
      WHERE root_path = ? AND scan_timestamp > ?
      ORDER BY scan_timestamp DESC 
      LIMIT 1
    `,
      [rootPath, cutoffTime.toISOString()]
    );

    if (!scan) {
      return null; // No recent cache
    }

    // Get all files for this scan
    const files = await this.db.all(
      `
      SELECT * FROM files 
      WHERE path LIKE ? AND scan_timestamp = ?
      ORDER BY path
    `,
      [`${rootPath}%`, scan.scan_timestamp]
    );

    // Convert back to proper format
    return files.map((file) => ({
      ...file,
      modified: new Date(file.modified),
      created: new Date(file.created),
      scan_timestamp: new Date(file.scan_timestamp),
    }));
  }

  async getFileStats(rootPath: string): Promise<{
    totalSize: number;
    fileCount: number;
    directoryCount: number;
    lastScan: Date | null;
  }> {
    if (!this.db) throw new Error("Database not initialized");

    const stats = await this.db.get(
      `
      SELECT 
        SUM(size) as total_size,
        COUNT(CASE WHEN type = 'file' THEN 1 END) as file_count,
        COUNT(CASE WHEN type = 'directory' THEN 1 END) as directory_count,
        MAX(scan_timestamp) as last_scan
      FROM files 
      WHERE path LIKE ?
    `,
      [`${rootPath}%`]
    );

    return {
      totalSize: stats?.total_size || 0,
      fileCount: stats?.file_count || 0,
      directoryCount: stats?.directory_count || 0,
      lastScan: stats?.last_scan ? new Date(stats.last_scan) : null,
    };
  }

  async searchFiles(
    rootPath: string,
    query: string,
    filters?: {
      type?: "file" | "directory";
      minSize?: number;
      maxSize?: number;
      extensions?: string[];
    }
  ): Promise<FileRecord[]> {
    if (!this.db) throw new Error("Database not initialized");

    let sql = `
      SELECT * FROM files 
      WHERE path LIKE ? AND name LIKE ?
    `;
    const params: any[] = [`${rootPath}%`, `%${query}%`];

    if (filters?.type) {
      sql += " AND type = ?";
      params.push(filters.type);
    }

    if (filters?.minSize !== undefined) {
      sql += " AND size >= ?";
      params.push(filters.minSize);
    }

    if (filters?.maxSize !== undefined) {
      sql += " AND size <= ?";
      params.push(filters.maxSize);
    }

    if (filters?.extensions && filters.extensions.length > 0) {
      const placeholders = filters.extensions.map(() => "?").join(",");
      sql += ` AND extension IN (${placeholders})`;
      params.push(...filters.extensions);
    }

    sql += " ORDER BY size DESC";

    const files = await this.db.all(sql, params);

    return files.map((file) => ({
      ...file,
      modified: new Date(file.modified),
      created: new Date(file.created),
      scan_timestamp: new Date(file.scan_timestamp),
    }));
  }

  async getLargeFiles(
    rootPath: string,
    minSize: number = 100 * 1024 * 1024
  ): Promise<FileRecord[]> {
    if (!this.db) throw new Error("Database not initialized");

    const files = await this.db.all(
      `
      SELECT * FROM files 
      WHERE path LIKE ? AND type = 'file' AND size >= ?
      ORDER BY size DESC
    `,
      [`${rootPath}%`, minSize]
    );

    return files.map((file) => ({
      ...file,
      modified: new Date(file.modified),
      created: new Date(file.created),
      scan_timestamp: new Date(file.scan_timestamp),
    }));
  }

  async getOldFiles(
    rootPath: string,
    daysOld: number = 30
  ): Promise<FileRecord[]> {
    if (!this.db) throw new Error("Database not initialized");

    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const files = await this.db.all(
      `
      SELECT * FROM files 
      WHERE path LIKE ? AND type = 'file' AND modified < ?
      ORDER BY modified ASC
    `,
      [`${rootPath}%`, cutoffDate.toISOString()]
    );

    return files.map((file) => ({
      ...file,
      modified: new Date(file.modified),
      created: new Date(file.created),
      scan_timestamp: new Date(file.scan_timestamp),
    }));
  }

  async getFileTypeStats(rootPath: string): Promise<
    {
      extension: string;
      count: number;
      totalSize: number;
    }[]
  > {
    if (!this.db) throw new Error("Database not initialized");

    const stats = await this.db.all(
      `
      SELECT 
        extension,
        COUNT(*) as count,
        SUM(size) as total_size
      FROM files 
      WHERE path LIKE ? AND type = 'file' AND extension IS NOT NULL
      GROUP BY extension
      ORDER BY total_size DESC
    `,
      [`${rootPath}%`]
    );

    return stats.map((stat) => ({
      extension: stat.extension,
      count: stat.count,
      totalSize: stat.total_size,
    }));
  }

  async clearCache(rootPath?: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    if (rootPath) {
      await this.db.run(
        `
        DELETE FROM files WHERE path LIKE ?
      `,
        [`${rootPath}%`]
      );

      await this.db.run(
        `
        DELETE FROM scans WHERE root_path = ?
      `,
        [rootPath]
      );
    } else {
      await this.db.run("DELETE FROM files");
      await this.db.run("DELETE FROM scans");
    }
  }

  async getCacheSize(): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.get(`
      SELECT COUNT(*) as count FROM files
    `);

    return result?.count || 0;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export const fileSystemCache = new FileSystemCache();
