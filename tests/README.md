# LorDisk Testing Guide

This directory contains comprehensive end-to-end and component tests for the LorDisk application using Playwright.

## 🧪 Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   └── app.spec.ts        # Main application tests
├── components/             # Component-specific tests
│   └── VisualChart.spec.ts # D3.js visualization tests
├── utils/                  # Test utilities
│   └── test-helpers.ts    # Common test functions
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies (including Playwright)
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# View test report
npm run test:report
```

## 📋 Test Categories

### 1. End-to-End Tests (`e2e/app.spec.ts`)

These tests verify the complete application workflow:

- **Application Loading**: Verifies the app loads correctly
- **Navigation**: Tests sidebar navigation and tab switching
- **Folder Selection**: Tests folder selection dialog interactions
- **Chart Functionality**: Tests D3.js visualizations (sunburst/treemap)
- **File Analysis**: Tests file type analysis features
- **Cleanup Tools**: Tests cleanup interface (non-destructive)
- **Theme Switching**: Tests dark/light mode toggle
- **Cache Management**: Tests SQLite cache functionality
- **Search Functionality**: Tests file search features
- **Responsive Design**: Tests mobile/desktop layouts
- **Error Handling**: Tests graceful error states
- **Loading States**: Tests loading indicators

### 2. Component Tests (`components/VisualChart.spec.ts`)

Focused tests for the D3.js visualization component:

- **Chart Rendering**: Tests sunburst and treemap rendering
- **Data Handling**: Tests various data scenarios
- **Interactions**: Tests chart interactions and animations
- **Performance**: Tests large dataset handling
- **Responsive**: Tests chart behavior on different screen sizes

## 🛠️ Test Utilities (`utils/test-helpers.ts`)

Common functions for test setup and assertions:

```typescript
// Mock Electron API
await mockElectronAPI(page, {
  scanDirectory: async () => mockData,
  selectFolder: async () => ({ canceled: false }),
});

// Wait for app to load
await waitForAppLoad(page);

// Navigate between tabs
await navigateToTab(page, "File Analysis");

// Switch chart types
await switchChartType(page, "treemap");
```

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

- **Browsers**: Tests run on Chromium, Firefox, and WebKit
- **Parallel Execution**: Tests run in parallel for speed
- **Retries**: Automatic retries on CI for flaky tests
- **Web Server**: Automatically starts Next.js dev server
- **Reports**: HTML reports with screenshots and traces

### Environment Variables

```bash
# Run tests in CI mode (no retries, single worker)
CI=true npm run test

# Run specific browser
npx playwright test --project=chromium

# Run specific test file
npx playwright test app.spec.ts
```

## 🧪 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should do something", async ({ page }) => {
    // Arrange
    await page.click("button");

    // Act
    await page.fill("input", "value");

    // Assert
    await expect(page.locator(".result")).toBeVisible();
  });
});
```

### Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Mock external dependencies** (Electron API, file system)
3. **Test user workflows** rather than implementation details
4. **Handle async operations** with proper waits
5. **Use descriptive test names** that explain the scenario
6. **Group related tests** in describe blocks

### Mocking Electron API

```typescript
// Mock specific API calls
await page.evaluate(() => {
  window.electronAPI = {
    ...window.electronAPI,
    scanDirectory: async () => ({
      path: "/test/path",
      items: mockFileData,
      totalSize: 1024,
      itemCount: 1,
    }),
  };
});
```

## 🚨 Non-Destructive Testing

All tests are designed to be **non-destructive**:

- ✅ **Mock file operations** - No real files are accessed
- ✅ **Mock delete operations** - No files are actually deleted
- ✅ **Mock folder selection** - No real folder dialogs
- ✅ **Test UI interactions** - Only UI elements are tested
- ✅ **Safe data mocking** - All data is synthetic

## 📊 Test Reports

### HTML Report

```bash
npm run test:report
```

Opens detailed HTML report with:

- Test results and timing
- Screenshots on failure
- Video recordings
- Console logs
- Network traces

### CI Reports

GitHub Actions automatically uploads test reports as artifacts.

## 🔍 Debugging Tests

### Debug Mode

```bash
npm run test:debug
```

Opens Playwright Inspector for step-by-step debugging.

### UI Mode

```bash
npm run test:ui
```

Opens Playwright UI for interactive test development.

### Headed Mode

```bash
npm run test:headed
```

Runs tests with visible browser windows.

## 🐛 Common Issues

### Element Not Found

```typescript
// Use more specific selectors
await page.locator('[data-testid="specific-element"]').click();

// Wait for elements to be ready
await page.waitForSelector('[data-testid="element"]');
```

### Timing Issues

```typescript
// Wait for network idle
await page.waitForLoadState("networkidle");

// Wait for specific element
await page.waitForSelector(".loading", { state: "hidden" });

// Custom wait
await page.waitForTimeout(1000); // Last resort
```

### Mock Data Issues

```typescript
// Ensure mock data structure matches expected
const mockData = {
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
```

## 📈 Continuous Integration

Tests run automatically on:

- **Push to main/develop** branches
- **Pull requests** to main/develop
- **Cross-platform** (Ubuntu, macOS, Windows)

### CI Configuration

See `.github/workflows/test.yml` for detailed CI setup.

## 🎯 Test Coverage

Current test coverage includes:

- ✅ Application loading and initialization
- ✅ Navigation and routing
- ✅ D3.js chart rendering and interactions
- ✅ File analysis features
- ✅ Cleanup tools interface
- ✅ Theme switching
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ Cache management
- ✅ Search functionality

## 🤝 Contributing

When adding new features:

1. **Add corresponding tests** for new functionality
2. **Update test utilities** if needed
3. **Ensure tests are non-destructive**
4. **Use descriptive test names**
5. **Group related tests** appropriately

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [D3.js Testing Guide](https://d3js.org/)
