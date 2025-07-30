"use client";

import { useState } from "react";
import { TreemapChart } from "./charts/TreemapChart";
import { SimpleSunburst } from "./charts/SimpleSunburst";
import { ChartControls, ChartType } from "./charts/ChartControls";

interface DirectoryData {
  path: string;
  items: any[];
  totalSize: number;
  itemCount: number;
}

interface VisualChartProps {
  data: DirectoryData;
  onItemSelect?: (item: any) => void;
  selectedItem?: any;
}

export function VisualChart({
  data,
  onItemSelect,
  selectedItem,
}: VisualChartProps) {
  const [chartType, setChartType] = useState<ChartType>("sunburst");

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
  };

  // Clean and prepare data for visualization
  const prepareData = () => {
    if (!data || !data.items || data.items.length === 0) return [];

    const processedItems = [...data.items];

    // Handle the new structure from parallel scanning
    // If we have a single root item with children, flatten it
    if (processedItems.length === 1 && processedItems[0].children) {
      const rootItem = processedItems[0];
      const allItems = [rootItem, ...rootItem.children];
      processedItems.length = 0;
      processedItems.push(...allItems);
    }

    // Remove duplicates and normalize paths
    const uniqueItems = new Map();
    processedItems.forEach((item) => {
      const normalizedPath = item.path.replace(/\\/g, "/").replace(/\/+/g, "/");
      if (!uniqueItems.has(normalizedPath)) {
        uniqueItems.set(normalizedPath, {
          ...item,
          path: normalizedPath,
        });
      }
    });

    const cleanItems = Array.from(uniqueItems.values());

    // Ensure we have a root item
    const rootPath = data.path || "/";
    const hasRoot = cleanItems.some((item) => item.path === rootPath);

    if (!hasRoot) {
      cleanItems.unshift({
        path: rootPath,
        name: "Root",
        size: 0,
        type: "directory",
      });
    }

    return cleanItems;
  };

  const chartData = prepareData();

  return (
    <div className="h-full flex flex-col main-content">
      <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <ChartControls
          chartType={chartType}
          onChartTypeChange={handleChartTypeChange}
          selectedNode={selectedItem}
        />
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {chartType === "sunburst" ? (
          <SimpleSunburst
            data={chartData}
            onItemSelect={onItemSelect}
            selectedItem={selectedItem}
          />
        ) : (
          <TreemapChart
            data={chartData}
            onItemSelect={onItemSelect}
            selectedItem={selectedItem}
          />
        )}
      </div>
    </div>
  );
}
