import { test, expect } from "@playwright/test";

test.describe("LorDisk Application", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto("/");

    // Wait for the application to load
    await page.waitForLoadState("networkidle");
  });

  test("should load the application successfully", async ({ page }) => {
    // Check that the main application loads
    await expect(page).toHaveTitle(/LorDisk/);

    // Verify the main layout components are present
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  });

  test("should display sidebar navigation", async ({ page }) => {
    // Check sidebar elements
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Verify navigation items are present
    await expect(page.locator("text=Dashboard")).toBeVisible();
    await expect(page.locator("text=File Analysis")).toBeVisible();
    await expect(page.locator("text=Cleanup Tools")).toBeVisible();
  });

  test("should show folder selection prompt when no folder is selected", async ({
    page,
  }) => {
    // Check that the folder selection prompt is displayed
    await expect(page.locator("text=Select a folder to analyze")).toBeVisible();

    // Verify the select folder button is present
    await expect(
      page.locator('button:has-text("Select Folder")')
    ).toBeVisible();
  });

  test("should handle folder selection dialog", async ({ page }) => {
    // Mock the folder selection dialog
    await page.route("**/select-folder", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ canceled: true }),
      });
    });

    // Click the select folder button
    await page.click('button:has-text("Select Folder")');

    // Verify the dialog interaction (should not crash)
    await expect(page.locator("text=Select a folder to analyze")).toBeVisible();
  });

  test("should display chart controls when data is available", async ({
    page,
  }) => {
    // Mock some sample data
    await page.evaluate(() => {
      window.electronAPI = {
        ...window.electronAPI,
        scanDirectory: async () => ({
          path: "/test/path",
          items: [
            {
              name: "test.txt",
              size: 1024,
              type: "file",
              path: "/test/path/test.txt",
              extension: ".txt",
              modified: new Date(),
              created: new Date(),
            },
          ],
          totalSize: 1024,
          itemCount: 1,
        }),
      };
    });

    // Trigger a scan (this would normally be done by selecting a folder)
    await page.evaluate(async () => {
      const data = await window.electronAPI.scanDirectory("/test/path");
      // Simulate setting the data in the app
      window.dispatchEvent(new CustomEvent("scan-complete", { detail: data }));
    });

    // Check that chart controls are available
    await expect(page.locator("text=Sunburst Chart")).toBeVisible();
    await expect(page.locator("text=Treemap")).toBeVisible();
  });

  test("should switch between chart types", async ({ page }) => {
    // Mock data for testing
    await page.evaluate(() => {
      window.electronAPI = {
        ...window.electronAPI,
        scanDirectory: async () => ({
          path: "/test/path",
          items: [
            {
              name: "test.txt",
              size: 1024,
              type: "file",
              path: "/test/path/test.txt",
              extension: ".txt",
              modified: new Date(),
              created: new Date(),
            },
          ],
          totalSize: 1024,
          itemCount: 1,
        }),
      };
    });

    // Simulate having data loaded
    await page.evaluate(async () => {
      const data = await window.electronAPI.scanDirectory("/test/path");
      window.dispatchEvent(new CustomEvent("scan-complete", { detail: data }));
    });

    // Test switching to treemap
    await page.click('button:has-text("Treemap")');
    await expect(page.locator('button:has-text("Treemap")')).toHaveClass(
      /bg-primary-600/
    );

    // Test switching back to sunburst
    await page.click('button:has-text("Sunburst Chart")');
    await expect(page.locator('button:has-text("Sunburst Chart")')).toHaveClass(
      /bg-primary-600/
    );
  });

  test("should display file analysis tab", async ({ page }) => {
    // Navigate to file analysis tab
    await page.click("text=File Analysis");

    // Check that file analysis components are present
    await expect(page.locator("text=File Type Analysis")).toBeVisible();
    await expect(page.locator("text=Large Files")).toBeVisible();
    await expect(page.locator("text=Old Files")).toBeVisible();
    await expect(page.locator("text=Potential Duplicates")).toBeVisible();
  });

  test("should display cleanup tools tab", async ({ page }) => {
    // Navigate to cleanup tools tab
    await page.click("text=Cleanup Tools");

    // Check that cleanup components are present
    await expect(page.locator("text=File Type Analysis")).toBeVisible();
    await expect(page.locator("text=Large Files")).toBeVisible();
    await expect(page.locator("text=Old Files")).toBeVisible();
    await expect(page.locator("text=Potential Duplicates")).toBeVisible();
  });

  test("should handle theme switching", async ({ page }) => {
    // Find and click the theme toggle button
    const themeButton = page.locator('[data-testid="theme-toggle"]');

    if (await themeButton.isVisible()) {
      await themeButton.click();

      // Verify theme change (check for dark mode classes)
      await expect(page.locator("html")).toHaveClass(/dark/);

      // Toggle back
      await themeButton.click();
      await expect(page.locator("html")).not.toHaveClass(/dark/);
    }
  });

  test("should display cache status when available", async ({ page }) => {
    // Mock cache stats
    await page.evaluate(() => {
      window.electronAPI = {
        ...window.electronAPI,
        getCacheStats: async () => ({
          lastScan: new Date(),
          fileCount: 100,
          directoryCount: 5,
          totalSize: 1024 * 1024 * 10, // 10MB
        }),
      };
    });

    // Trigger cache stats check
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("check-cache"));
    });

    // Check that cache status is displayed
    await expect(page.locator("text=Cache Status")).toBeVisible();
  });

  test("should handle file type analysis without destructive actions", async ({
    page,
  }) => {
    // Navigate to file analysis
    await page.click("text=File Analysis");

    // Mock file type stats
    await page.evaluate(() => {
      window.electronAPI = {
        ...window.electronAPI,
        getFileTypeStats: async () => [
          {
            extension: ".txt",
            count: 10,
            totalSize: 1024 * 1024,
          },
        ],
      };
    });

    // Check that file type cards are displayed
    await expect(page.locator("text=Documents")).toBeVisible();
  });

  test("should handle search functionality", async ({ page }) => {
    // Mock search results
    await page.evaluate(() => {
      window.electronAPI = {
        ...window.electronAPI,
        searchFiles: async () => [
          {
            name: "test.txt",
            size: 1024,
            type: "file",
            path: "/test/path/test.txt",
            extension: ".txt",
            modified: new Date(),
            created: new Date(),
          },
        ],
      };
    });

    // Find and use search input
    const searchInput = page.locator('[data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("test");
      await searchInput.press("Enter");

      // Verify search results
      await expect(page.locator("text=test.txt")).toBeVisible();
    }
  });

  test("should handle breadcrumb navigation", async ({ page }) => {
    // Mock directory structure
    await page.evaluate(() => {
      window.electronAPI = {
        ...window.electronAPI,
        scanDirectory: async () => ({
          path: "/test/path",
          items: [
            {
              name: "subfolder",
              type: "directory",
              path: "/test/path/subfolder",
              size: 0,
              modified: new Date(),
              created: new Date(),
              children: [],
            },
          ],
          totalSize: 0,
          itemCount: 1,
        }),
      };
    });

    // Simulate navigating to a subfolder
    await page.evaluate(async () => {
      const data = await window.electronAPI.scanDirectory("/test/path");
      window.dispatchEvent(new CustomEvent("scan-complete", { detail: data }));
    });

    // Check that breadcrumbs are displayed
    await expect(page.locator('[data-testid="breadcrumbs"]')).toBeVisible();
  });

  test("should handle responsive design", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify sidebar is collapsible on mobile
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(sidebar).toBeVisible();
  });

  test("should handle keyboard navigation", async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press("Tab");

    // Verify focus is on the first interactive element
    await expect(
      page.locator('button:has-text("Select Folder")')
    ).toBeFocused();
  });

  test("should display loading states", async ({ page }) => {
    // Mock a slow scan operation
    await page.evaluate(() => {
      window.electronAPI = {
        ...window.electronAPI,
        scanDirectory: async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return {
            path: "/test/path",
            items: [],
            totalSize: 0,
            itemCount: 0,
          };
        },
      };
    });

    // Trigger a scan
    await page.click('button:has-text("Select Folder")');

    // Check for loading indicator
    await expect(page.locator('[data-testid="loading"]')).toBeVisible();
  });

  test("should handle error states gracefully", async ({ page }) => {
    // Mock an error response
    await page.evaluate(() => {
      window.electronAPI = {
        ...window.electronAPI,
        scanDirectory: async () => {
          throw new Error("Access denied");
        },
      };
    });

    // Trigger a scan that will fail
    await page.click('button:has-text("Select Folder")');

    // Check that error is handled gracefully
    await expect(page.locator("text=Error")).toBeVisible();
  });
});
