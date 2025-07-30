# LorDisk Component Architecture

This document outlines the component structure for the LorDisk application, organized to avoid monolithic components and promote reusability.

## 📁 Directory Structure

```
app/components/
├── layout/           # Layout and structural components
│   ├── AppLayout.tsx
│   └── EmptyState.tsx
├── ui/              # Reusable UI components
│   ├── FileIcon.tsx
│   ├── SearchBar.tsx
│   ├── SortableHeader.tsx
│   └── FileRow.tsx
├── features/        # Feature-specific components
│   ├── FileList.tsx
│   ├── CleanupTools.tsx
│   └── DriveCard.tsx
├── charts/          # Visualization components
│   ├── VisualChart.tsx
│   └── ChartControls.tsx
├── cleanup/         # Cleanup tool components
│   ├── FileTypeCard.tsx
│   ├── FileItem.tsx
│   └── CleanupSection.tsx
├── Header.tsx       # Legacy components
├── Sidebar.tsx
├── Dashboard.tsx
├── LoadingSpinner.tsx
├── ThemeProvider.tsx
└── index.ts         # Component exports
```

## 🧩 Component Categories

### Layout Components (`layout/`)

- **AppLayout**: Main application layout wrapper
- **EmptyState**: Reusable empty state display

### UI Components (`ui/`)

- **FileIcon**: Displays appropriate icons for files and folders
- **SearchBar**: Reusable search input with icon
- **SortableHeader**: Sortable table headers
- **FileRow**: Individual file/folder table row

### Feature Components (`features/`)

- **FileList**: Complete file listing with search and sort
- **CleanupTools**: Main cleanup tools interface
- **DriveCard**: Individual drive display card

### Chart Components (`charts/`)

- **VisualChart**: Main chart container with D3.js integration
- **ChartControls**: Chart type selection controls

### Cleanup Components (`cleanup/`)

- **FileTypeCard**: File type analysis cards
- **FileItem**: Individual file items in cleanup lists
- **CleanupSection**: Reusable cleanup section wrapper

## 🔄 Migration Benefits

### Before (Monolithic)

- `FileList.tsx`: 323 lines
- `CleanupTools.tsx`: 368 lines
- `VisualChart.tsx`: 312 lines

### After (Modular)

- `FileList.tsx`: 150 lines (uses smaller components)
- `CleanupTools.tsx`: 180 lines (uses smaller components)
- `VisualChart.tsx`: 200 lines (uses smaller components)

## 📦 Usage Examples

```tsx
// Import specific components
import { FileList, CleanupTools, VisualChart } from "./components";

// Or import from specific categories
import { FileIcon, SearchBar } from "./components/ui";
import { DriveCard } from "./components/features";
```

## 🎯 Benefits

1. **Maintainability**: Smaller, focused components are easier to understand and modify
2. **Reusability**: UI components can be reused across different features
3. **Testability**: Smaller components are easier to unit test
4. **Performance**: Better code splitting and lazy loading opportunities
5. **Team Collaboration**: Different developers can work on different component categories
6. **Scalability**: Easy to add new features without affecting existing code

## 🔧 Development Guidelines

1. **Keep components focused**: Each component should have a single responsibility
2. **Use composition**: Build complex features from simple components
3. **Maintain consistency**: Use shared UI components for common patterns
4. **Document interfaces**: Clear TypeScript interfaces for all components
5. **Follow naming conventions**: Use descriptive, consistent names
