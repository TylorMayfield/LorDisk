// Layout components
export { AppLayout } from "./layout/AppLayout";
export { EmptyState } from "./layout/EmptyState";

// UI components
export { FileIcon } from "./ui/FileIcon";
export { SearchBar } from "./ui/SearchBar";
export { SortableHeader } from "./ui/SortableHeader";
export { FileRow } from "./ui/FileRow";
export { CacheStatus } from "./ui/CacheStatus";

// Feature components
export { FileList } from "./features/FileList";
export { CleanupTools } from "./features/CleanupTools";
export { DriveCard } from "./features/DriveCard";
export { FileTypeAnalysis } from "./features/FileTypeAnalysis";

// Chart components
export { VisualChart } from "./VisualChart";
export { ChartControls } from "./charts/ChartControls";

// Cleanup components
export { FileTypeCard } from "./cleanup/FileTypeCard";
export { FileItem } from "./cleanup/FileItem";
export { CleanupSection } from "./cleanup/CleanupSection";

// Legacy components (for backward compatibility)
export { Header } from "./Header";
export { Sidebar } from "./Sidebar";
export { Dashboard } from "./Dashboard";
export { LoadingSpinner } from "./LoadingSpinner";

// Theme provider
export { ModernThemeProvider as ThemeProvider } from "./ModernThemeProvider";
