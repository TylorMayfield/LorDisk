"use client";

import { useState } from "react";

interface SimpleSunburstProps {
  data: any[];
  onItemSelect?: (item: any) => void;
  selectedItem?: any;
}

interface SunburstNode {
  name: string;
  size: number;
  path: string;
  type: string;
  children?: SunburstNode[];
  angle?: number;
  startAngle?: number;
  endAngle?: number;
  radius?: number;
  innerRadius?: number;
}

export function SimpleSunburst({
  data,
  onItemSelect,
  selectedItem,
}: SimpleSunburstProps) {
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  // Transform data for sunburst visualization
  const transformData = (items: any[]): SunburstNode[] => {
    return items.map((item) => ({
      name: item.name,
      size: item.size || 0,
      path: item.path,
      type: item.type,
      children: item.children ? transformData(item.children) : undefined,
    }));
  };

  const sunburstData = transformData(data);

  // Calculate angles for sunburst
  const calculateAngles = (
    nodes: SunburstNode[],
    startAngle = 0,
    radius = 200,
    innerRadius = 0
  ) => {
    const totalSize = nodes.reduce((sum, node) => sum + node.size, 0);
    let currentAngle = startAngle;

    return nodes.map((node) => {
      const angle = (node.size / totalSize) * 2 * Math.PI;
      const nodeData = {
        ...node,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        radius,
        innerRadius,
        angle,
      };
      currentAngle += angle;
      return nodeData;
    });
  };

  const renderSunburstLevel = (nodes: SunburstNode[], level = 0) => {
    const radius = 200 - level * 40;
    const innerRadius = level === 0 ? 0 : 200 - (level - 1) * 40;
    const calculatedNodes = calculateAngles(nodes, 0, radius, innerRadius);

    return calculatedNodes.map((node, index) => {
      const isDirectory = node.type === "directory";
      const isSelected = selectedItem?.path === node.path;
      const centerX = 400;
      const centerY = 300;

      // Calculate path for the arc
      const startAngleRad = node.startAngle!;
      const endAngleRad = node.endAngle!;

      const x1 = centerX + Math.cos(startAngleRad) * innerRadius;
      const y1 = centerY + Math.sin(startAngleRad) * innerRadius;
      const x2 = centerX + Math.cos(endAngleRad) * innerRadius;
      const y2 = centerY + Math.sin(endAngleRad) * innerRadius;

      const x3 = centerX + Math.cos(endAngleRad) * radius;
      const y3 = centerY + Math.sin(endAngleRad) * radius;
      const x4 = centerX + Math.cos(startAngleRad) * radius;
      const y4 = centerY + Math.sin(startAngleRad) * radius;

      const largeArcFlag = endAngleRad - startAngleRad > Math.PI ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${innerRadius} ${innerRadius} 0 0 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${radius} ${radius} 0 0 0 ${x4} ${y4}`,
        "Z",
      ].join(" ");

      return (
        <g key={`${node.path}-${level}-${index}`}>
          <path
            d={pathData}
            fill={isSelected ? "#3b82f6" : isDirectory ? "#f3f4f6" : "#e5e7eb"}
            stroke={isSelected ? "#1d4ed8" : "#d1d5db"}
            strokeWidth={isSelected ? 2 : 1}
            cursor="pointer"
            onClick={() => onItemSelect?.(node)}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          />

          {/* Add text label for larger segments */}
          {node.angle! > 0.1 && (
            <text
              x={
                centerX +
                Math.cos((startAngleRad + endAngleRad) / 2) *
                  (innerRadius + (radius - innerRadius) / 2)
              }
              y={
                centerY +
                Math.sin((startAngleRad + endAngleRad) / 2) *
                  (innerRadius + (radius - innerRadius) / 2)
              }
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isSelected ? "#ffffff" : "#374151"}
              fontSize={12}
              fontWeight={isSelected ? "bold" : "normal"}
              pointerEvents="none"
            >
              {node.name.length > 10
                ? node.name.substring(0, 10) + "..."
                : node.name}
            </text>
          )}

          {/* Render children if they exist */}
          {node.children && node.children.length > 0 && (
            <g transform={`translate(${centerX}, ${centerY})`}>
              {renderSunburstLevel(node.children, level + 1)}
            </g>
          )}
        </g>
      );
    });
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
    <div className="h-full w-full flex flex-col">
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

      <div className="flex-1 flex items-center justify-center">
        <svg width="800" height="600" className="card">
          <g>{renderSunburstLevel(sunburstData)}</g>
        </svg>
      </div>
    </div>
  );
}
