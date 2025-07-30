"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";

interface TreemapChartProps {
  data: any[];
  onItemSelect?: (item: any) => void;
  selectedItem?: any;
}

interface TreemapData {
  name: string;
  size: number;
  path: string;
  type: string;
  children?: TreemapData[];
  [key: string]: any; // Add index signature for Recharts compatibility
}

export function TreemapChart({
  data,
  onItemSelect,
  selectedItem,
}: TreemapChartProps) {
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  // Transform data for Recharts Treemap
  const transformData = (items: any[]): TreemapData[] => {
    return items.map((item) => ({
      name: item.name,
      size: item.size || 0,
      path: item.path,
      type: item.type,
      children: item.children ? transformData(item.children) : undefined,
    }));
  };

  const treemapData = transformData(data);

  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, name, size, path, type } = props;

    const isDirectory = type === "directory";
    const isSelected = selectedItem?.path === path;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: isSelected ? "#3b82f6" : isDirectory ? "#f3f4f6" : "#e5e7eb",
            stroke: isSelected ? "#1d4ed8" : "#d1d5db",
            strokeWidth: isSelected ? 2 : 1,
            cursor: "pointer",
          }}
          onClick={() => onItemSelect?.(props)}
        />
        {width > 50 && height > 20 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            fill={isSelected ? "#ffffff" : "#374151"}
            fontSize={12}
            fontWeight={isSelected ? "bold" : "normal"}
          >
            {name.length > 15 ? name.substring(0, 15) + "..." : name}
          </text>
        )}
        {width > 80 && height > 30 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 15}
            textAnchor="middle"
            fill={isSelected ? "#ffffff" : "#6b7280"}
            fontSize={10}
          >
            {window.electronAPI.formatBytes(size)}
          </text>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">
            {data.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Size: {window.electronAPI.formatBytes(data.size)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Type: {data.type}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
            {data.path}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full">
      {currentPath.length > 0 && (
        <div className="mb-4 card p-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Current path: {currentPath.join(" / ")}
          </span>
          <button
            onClick={() => setCurrentPath([])}
            className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:underline hover-scale"
          >
            Reset
          </button>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
