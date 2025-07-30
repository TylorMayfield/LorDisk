import { test, expect } from "@playwright/test";

test.describe("VisualChart Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should render sunburst chart with sample data", async ({ page }) => {
    // Mock sample data
    const sampleData = {
      path: "/test/path",
      items: [
        {
          name: "documents",
          size: 1024 * 1024 * 10,
          type: "file",
          path: "/test/path/documents",
        },
        {
          name: "images",
          size: 1024 * 1024 * 20,
          type: "file",
          path: "/test/path/images",
        },
        {
          name: "videos",
          size: 1024 * 1024 * 50,
          type: "file",
          path: "/test/path/videos",
        },
      ],
      totalSize: 1024 * 1024 * 80,
      itemCount: 3,
    };

    // Set the data in the app
    await page.evaluate((data) => {
      window.dispatchEvent(new CustomEvent("scan-complete", { detail: data }));
    }, sampleData);

    // Wait for chart to render
    await page.waitForTimeout(1000);

    // Check that the chart container is present
    await expect(page.locator('[data-testid="visual-chart"]')).toBeVisible();

    // Check that chart controls are available
    await expect(page.locator("text=Sunburst Chart")).toBeVisible();
    await expect(page.locator("text=Treemap")).toBeVisible();
  });

  test("should switch between sunburst and treemap views", async ({ page }) => {
    // Mock data
    const sampleData = {
      path: "/test/path",
      items: [
        {
          name: "file1.txt",
          size: 1024 * 1024,
          type: "file",
          path: "/test/path/file1.txt",
        },
      ],
      totalSize: 1024 * 1024,
      itemCount: 1,
    };

    await page.evaluate((data) => {
      window.dispatchEvent(new CustomEvent("scan-complete", { detail: data }));
    }, sampleData);

    await page.waitForTimeout(1000);

    // Initially should be on sunburst
    await expect(page.locator('button:has-text("Sunburst Chart")')).toHaveClass(
      /bg-primary-600/
    );

    // Switch to treemap
    await page.click('button:has-text("Treemap")');
    await expect(page.locator('button:has-text("Treemap")')).toHaveClass(
      /bg-primary-600/
    );

    // Switch back to sunburst
    await page.click('button:has-text("Sunburst Chart")');
    await expect(page.locator('button:has-text("Sunburst Chart")')).toHaveClass(
      /bg-primary-600/
    );
  });

  test("should handle empty data gracefully", async ({ page }) => {
    const emptyData = {
      path: "/test/path",
      items: [],
      totalSize: 0,
      itemCount: 0,
    };

    await page.evaluate((data) => {
      window.dispatchEvent(new CustomEvent("scan-complete", { detail: data }));
    }, emptyData);

    await page.waitForTimeout(1000);

    // Should show empty state or no chart
    await expect(page.locator("text=No data available")).toBeVisible();
  });

  test("should handle large datasets", async ({ page }) => {
    // Create a large dataset
    const largeData = {
      path: "/test/path",
      items: Array.from({ length: 100 }, (_, i) => ({
        name: `file${i}.txt`,
        size: 1024 * (i + 1),
        type: "file" as const,
        path: `/test/path/file${i}.txt`,
      })),
      totalSize: 1024 * 5050, // Sum of 1 to 100
      itemCount: 100,
    };

    await page.evaluate((data) => {
      window.dispatchEvent(new CustomEvent("scan-complete", { detail: data }));
    }, largeData);

    await page.waitForTimeout(2000); // Longer wait for large dataset

    // Should still render without crashing
    await expect(page.locator('[data-testid="visual-chart"]')).toBeVisible();
  });

  test("should handle nested directory structures", async ({ page }) => {
    const nestedData = {
      path: "/test/path",
      items: [
        {
          name: "folder1",
          size: 0,
          type: "directory" as const,
          path: "/test/path/folder1",
          children: [
            {
              name: "nested1.txt",
              size: 1024,
              type: "file" as const,
              path: "/test/path/folder1/nested1.txt",
            },
            {
              name: "nested2.txt",
              size: 2048,
              type: "file" as const,
              path: "/test/path/folder1/nested2.txt",
            },
          ],
        },
        {
          name: "file.txt",
          size: 1024,
          type: "file" as const,
          path: "/test/path/file.txt",
        },
      ],
      totalSize: 4096,
      itemCount: 3,
    };

    await page.evaluate((data) => {
      window.dispatchEvent(new CustomEvent("scan-complete", { detail: data }));
    }, nestedData);

    await page.waitForTimeout(1000);

    // Should render nested structure
    await expect(page.locator('[data-testid="visual-chart"]')).toBeVisible();
  });

  test("should handle chart interactions", async ({ page }) => {
    const sampleData = {
      path: "/test/path",
      items: [
        {
          name: "documents",
          size: 1024 * 1024 * 10,
          type: "file",
          path: "/test/path/documents",
        },
        {
          name: "images",
          size: 1024 * 1024 * 20,
          type: "file",
          path: "/test/path/images",
        },
      ],
      totalSize: 1024 * 1024 * 30,
      itemCount: 2,
    };

    await page.evaluate((data) => {
      window.dispatchEvent(new CustomEvent("scan-complete", { detail: data }));
    }, sampleData);

    await page.waitForTimeout(1000);

    // Test clicking on chart elements (if they exist)
    const chartElement = page.locator('[data-testid="visual-chart"] svg');
    if (await chartElement.isVisible()) {
      await chartElement.click();
      // Should not crash on interaction
      await expect(page.locator('[data-testid="visual-chart"]')).toBeVisible();
    }
  });

  test("should handle window resize", async ({ page }) => {
    const sampleData = {
      path: "/test/path",
      items: [
        {
          name: "file.txt",
          size: 1024,
          type: "file",
          path: "/test/path/file.txt",
        },
      ],
      totalSize: 1024,
      itemCount: 1,
    };

    await page.evaluate((data) => {
      window.dispatchEvent(new CustomEvent("scan-complete", { detail: data }));
    }, sampleData);

    await page.waitForTimeout(1000);

    // Test different viewport sizes
    await page.setViewportSize({ width: 800, height: 600 });
    await expect(page.locator('[data-testid="visual-chart"]')).toBeVisible();

    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid="visual-chart"]')).toBeVisible();

    await page.setViewportSize({ width: 400, height: 600 });
    await expect(page.locator('[data-testid="visual-chart"]')).toBeVisible();
  });

  test("should handle theme changes", async ({ page }) => {
    const sampleData = {
      path: "/test/path",
      items: [
        {
          name: "file.txt",
          size: 1024,
          type: "file",
          path: "/test/path/file.txt",
        },
      ],
      totalSize: 1024,
      itemCount: 1,
    };

    await page.evaluate((data) => {
      window.dispatchEvent(new CustomEvent("scan-complete", { detail: data }));
    }, sampleData);

    await page.waitForTimeout(1000);

    // Toggle theme
    const themeButton = page.locator('[data-testid="theme-toggle"]');
    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(500);

      // Chart should still be visible after theme change
      await expect(page.locator('[data-testid="visual-chart"]')).toBeVisible();
    }
  });
});
