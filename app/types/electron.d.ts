declare global {
  interface Window {
    electronAPI: {
      // Drive operations
      getDrives: () => Promise<
        Array<{
          path: string;
          name: string;
          freeSpace: number;
          totalSize: number;
          usedSpace: number;
        }>
      >;

      // Directory scanning
      scanDirectory: (path: string) => Promise<{
        path: string;
        items: Array<{
          name: string;
          path: string;
          size: number;
          type: "file" | "directory";
          extension?: string;
          modified: Date;
          created: Date;
          children?: any[];
        }>;
        totalSize: number;
        itemCount: number;
      }>;
      rescanDirectory: (path: string) => Promise<{
        path: string;
        items: Array<{
          name: string;
          path: string;
          size: number;
          type: "file" | "directory";
          extension?: string;
          modified: Date;
          created: Date;
          children?: any[];
        }>;
        totalSize: number;
        itemCount: number;
      }>;
      getScanProgress: () => Promise<{
        currentDirectory: string;
        scannedFiles: number;
        scannedDirectories: number;
        totalItems: number;
        isScanning: boolean;
      }>;

      // File operations
      deleteFile: (
        path: string
      ) => Promise<{ success: boolean; error?: string }>;
      deleteDirectory: (
        path: string
      ) => Promise<{ success: boolean; error?: string }>;
      openFolder: (
        path: string
      ) => Promise<{ success: boolean; error?: string }>;

      // Dialog operations
      selectFolder: () => Promise<{
        success: boolean;
        path?: string;
        canceled?: boolean;
        error?: string;
      }>;

      // Database operations
      getCacheStats: (rootPath: string) => Promise<{
        totalSize: number;
        fileCount: number;
        directoryCount: number;
        lastScan: Date | null;
      }>;
      searchFiles: (
        rootPath: string,
        query: string,
        filters?: {
          type?: "file" | "directory";
          minSize?: number;
          maxSize?: number;
          extensions?: string[];
        }
      ) => Promise<
        Array<{
          path: string;
          name: string;
          size: number;
          type: "file" | "directory";
          extension?: string;
          modified: Date;
          created: Date;
        }>
      >;
      getLargeFiles: (
        rootPath: string,
        minSize?: number
      ) => Promise<
        Array<{
          path: string;
          name: string;
          size: number;
          type: "file" | "directory";
          extension?: string;
          modified: Date;
          created: Date;
        }>
      >;
      getOldFiles: (
        rootPath: string,
        daysOld?: number
      ) => Promise<
        Array<{
          path: string;
          name: string;
          size: number;
          type: "file" | "directory";
          extension?: string;
          modified: Date;
          created: Date;
        }>
      >;
      getFileTypeStats: (rootPath: string) => Promise<
        Array<{
          extension: string;
          count: number;
          totalSize: number;
        }>
      >;
      clearCache: (
        rootPath?: string
      ) => Promise<{ success: boolean; error?: string }>;
      getCacheSize: () => Promise<number>;

      // Platform info
      platform: string;

      // Utility functions
      formatBytes: (bytes: number) => string;
      getFileIcon: (extension: string) => string;
      generateCategoryColor: (extension: string) => string;
    };
  }
}

export {};
