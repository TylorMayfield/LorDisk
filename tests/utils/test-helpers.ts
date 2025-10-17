import { Page } from "@playwright/test";

export interface MockFileData {
  name: string;
  size: number;
  type: "file" | "directory";
  path: string;
  extension?: string;
  modified?: string;
  children?: MockFileData[];
}

export interface MockDirectoryData {
  path: string;
  items: MockFileData[];
  totalSize: number;
  itemCount: number;
}

export const mockFileData: MockFileData[] = [
  {
    name: "document.pdf",
    size: 1024 * 1024 * 2, // 2MB
    type: "file",
    path: "/test/path/document.pdf",
    extension: ".pdf",
    modified: new Date().toISOString(),
  },
  {
    name: "image.jpg",
    size: 1024 * 1024 * 5, // 5MB
    type: "file",
    path: "/test/path/image.jpg",
    extension: ".jpg",
    modified: new Date().toISOString(),
  },
  {
    name: "subfolder",
    size: 0,
    type: "directory",
    path: "/test/path/subfolder",
    children: [
      {
        name: "nested.txt",
        size: 1024,
        type: "file",
        path: "/test/path/subfolder/nested.txt",
        extension: ".txt",
        modified: new Date().toISOString(),
      },
    ],
  },
];

export const mockDirectoryData: MockDirectoryData = {
  path: "/test/path",
  items: mockFileData,
  totalSize: 1024 * 1024 * 7, // 7MB
  itemCount: 3,
};

export async function mockElectronAPI(
  page: Page,
  overrides: Record<string, any> = {}
) {
  await page.evaluate((overrides) => {
    window.electronAPI = {
      // Default mock implementations
      getDrives: async () => [],
      scanDirectory: async () => ({
        path: "/test/path",
        items: [],
        totalSize: 0,
        itemCount: 0,
      }),
      scanDirectoryStaggered: async () => ({
        path: "/test/path",
        items: [],
        totalSize: 0,
        itemCount: 0,
      }),
      rescanDirectory: async () => ({
        path: "/test/path",
        items: [],
        totalSize: 0,
        itemCount: 0,
      }),
      deleteFile: async () => ({ success: true }),
      deleteDirectory: async () => ({ success: true }),
      openFolder: async () => ({ success: true }),
      selectFolder: async () => ({ success: false, canceled: true }),
      getCacheStats: async () => ({
        lastScan: null,
        fileCount: 0,
        directoryCount: 0,
        totalSize: 0,
      }),
      searchFiles: async () => [],
      getLargeFiles: async () => [],
      getOldFiles: async () => [],
      getFileTypeStats: async () => [],
      clearCache: async () => ({ success: true }),
      getCacheSize: async () => 0,
      platform: "darwin",
      formatBytes: (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
      },
      getFileIcon: (extension: string) => "file",
      generateCategoryColor: (extension: string) => "hsl(0, 70%, 50%)",
      getScanProgress: async () => ({
        currentDirectory: "",
        scannedFiles: 0,
        scannedDirectories: 0,
        totalItems: 0,
        isScanning: false,
        phase: "complete",
      }),
      onScanProgressUpdate: (callback: any) => {},
      onImmediateScanResults: (callback: any) => {},
      onDirectoryScanUpdate: (callback: any) => {},
      removeAllListeners: (channel: string) => {},
      // Override with custom implementations
      ...overrides,
    };
  }, overrides);
}

export async function waitForAppLoad(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
}

export async function selectFolder(page: Page) {
  await page.click('button:has-text("Select Folder")');
  await page.waitForTimeout(1000); // Wait for dialog interaction
}

export async function navigateToTab(page: Page, tabName: string) {
  await page.click(`text=${tabName}`);
  await page.waitForTimeout(500); // Wait for tab switch
}

export async function switchChartType(
  page: Page,
  chartType: "sunburst" | "treemap"
) {
  await page.click(
    `button:has-text("${
      chartType === "sunburst" ? "Sunburst Chart" : "Treemap"
    }")`
  );
  await page.waitForTimeout(500); // Wait for chart switch
}

export async function toggleTheme(page: Page) {
  const themeButton = page.locator('[data-testid="theme-toggle"]');
  if (await themeButton.isVisible()) {
    await themeButton.click();
    await page.waitForTimeout(500); // Wait for theme switch
  }
}

export async function searchFiles(page: Page, query: string) {
  const searchInput = page.locator('[data-testid="search-input"]');
  if (await searchInput.isVisible()) {
    await searchInput.fill(query);
    await searchInput.press("Enter");
    await page.waitForTimeout(500); // Wait for search results
  }
}

export async function checkForError(page: Page) {
  const errorElement = page.locator("text=Error");
  return await errorElement.isVisible();
}

export async function checkForLoading(page: Page) {
  const loadingElement = page.locator('[data-testid="loading"]');
  return await loadingElement.isVisible();
}

export async function getCacheStatus(page: Page) {
  const cacheElement = page.locator("text=Cache Status");
  return await cacheElement.isVisible();
}

export async function verifyFileTypeCards(page: Page) {
  const fileTypeCards = page.locator('[data-testid="file-type-card"]');
  return await fileTypeCards.count();
}

export async function verifyChartControls(page: Page) {
  const sunburstButton = page.locator("text=Sunburst Chart");
  const treemapButton = page.locator("text=Treemap");

  return {
    sunburstVisible: await sunburstButton.isVisible(),
    treemapVisible: await treemapButton.isVisible(),
  };
}

export async function verifySidebarNavigation(page: Page) {
  const dashboardLink = page.locator("text=Dashboard");
  const fileAnalysisLink = page.locator("text=File Analysis");
  const cleanupToolsLink = page.locator("text=Cleanup Tools");

  return {
    dashboardVisible: await dashboardLink.isVisible(),
    fileAnalysisVisible: await fileAnalysisLink.isVisible(),
    cleanupToolsVisible: await cleanupToolsLink.isVisible(),
  };
}
