"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

interface TreemapData {
  name: string;
  path: string;
  size: number;
  type: "file" | "directory";
  extension?: string;
  modified?: Date;
  created?: Date;
  children?: TreemapData[];
  isPlaceholder?: boolean;
}

interface ModernTreemapProps {
  data: TreemapData[];
  onItemSelect?: (item: TreemapData | null) => void;
  selectedItem?: TreemapData | null;
  width?: number;
  height?: number;
  isScanning?: boolean;
  scanProgress?: {
    phase?: string;
    currentDirectory?: string;
    scannedFiles?: number;
    scannedDirectories?: number;
  };
}

export function ModernTreemap({
  data,
  onItemSelect,
  selectedItem,
  width = 800,
  height = 600,
  isScanning = false,
  scanProgress
}: ModernTreemapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredItem, setHoveredItem] = useState<TreemapData | null>(null);
  const [animationPhase, setAnimationPhase] = useState<"initial" | "scanning" | "complete">("initial");

  // Color scheme inspired by DaisyDisk
  const colorScale = d3.scaleOrdinal()
    .domain(["directory", "file", "placeholder"])
    .range([
      "hsl(210, 100%, 85%)", // Light blue for directories
      "hsl(120, 60%, 70%)",  // Light green for files
      "hsl(0, 0%, 90%)"      // Light gray for placeholders
    ]);

  const getFileTypeColor = useCallback((item: TreemapData) => {
    if (item.isPlaceholder) return colorScale("placeholder");
    if (item.type === "directory") return colorScale("directory");
    
    // Generate color based on file extension
    const extension = item.extension || "unknown";
    const hue = (extension.charCodeAt(0) * 137.5) % 360;
    return `hsl(${hue}, 60%, 70%)`;
  }, [colorScale]);

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }, []);

  const createTreemap = useCallback(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set up the treemap layout
    const treemap = d3.treemap<TreemapData>()
      .size([width, height])
      .padding(2)
      .round(true);

    // Prepare data hierarchy
    const root = d3.hierarchy({ name: "root", children: data } as any)
      .sum(d => d.size || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const nodes = treemap(root).leaves();

    // Create groups for each rectangle
    const groups = svg.selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Add rectangles with smooth animations
    const rects = groups.append("rect")
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("fill", (d: any) => getFileTypeColor(d.data) as string)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("rx", 4)
      .attr("ry", 4)
      .style("cursor", "pointer")
      .style("transition", "all 0.2s ease")
      .on("mouseenter", function(event: any, d: any) {
        setHoveredItem(d.data);
        d3.select(this)
          .attr("stroke", "#333")
          .attr("stroke-width", 2)
          .style("filter", "brightness(1.1)");
      })
      .on("mouseleave", function(event: any, d: any) {
        setHoveredItem(null);
        d3.select(this)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .style("filter", "brightness(1)");
      })
      .on("click", function(event: any, d: any) {
        onItemSelect?.(d.data);
      });

    // Add text labels for larger rectangles
    const labels = groups.append("text")
      .attr("x", (d: any) => (d.x1 - d.x0) / 2)
      .attr("y", (d: any) => (d.y1 - d.y0) / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", (d: any) => {
        const area = (d.x1 - d.x0) * (d.y1 - d.y0);
        return Math.min(Math.max(Math.sqrt(area) / 8, 8), 14) + "px";
      })
      .style("font-weight", "500")
      .style("fill", "#333")
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 2px rgba(255,255,255,0.8)")
      .text((d: any) => {
        const area = (d.x1 - d.x0) * (d.y1 - d.y0);
        if (area < 200) return ""; // Don't show text for very small rectangles
        return d.data.name.length > 15 ? d.data.name.substring(0, 15) + "..." : d.data.name;
      });

    // Add size labels for medium-sized rectangles
    const sizeLabels = groups.append("text")
      .attr("x", (d: any) => (d.x1 - d.x0) / 2)
      .attr("y", (d: any) => (d.y1 - d.y0) / 2 + 12)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "10px")
      .style("font-weight", "400")
      .style("fill", "#666")
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 2px rgba(255,255,255,0.8)")
      .text((d: any) => {
        const area = (d.x1 - d.x0) * (d.y1 - d.y0);
        if (area < 400) return ""; // Don't show size for small rectangles
        return formatBytes(d.data.size || 0);
      });

    // Animate rectangles in
    rects
      .attr("width", 0)
      .attr("height", 0)
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0);

    // Animate labels in
    labels
      .style("opacity", 0)
      .transition()
      .delay(400)
      .duration(400)
      .style("opacity", 1);

    sizeLabels
      .style("opacity", 0)
      .transition()
      .delay(600)
      .duration(400)
      .style("opacity", 1);

  }, [data, width, height, getFileTypeColor, formatBytes, onItemSelect]);

  // Update animation phase based on scanning state
  useEffect(() => {
    if (isScanning) {
      setAnimationPhase("scanning");
    } else if (data.length > 0) {
      setAnimationPhase("complete");
    }
  }, [isScanning, data.length]);

  // Recreate treemap when data changes
  useEffect(() => {
    createTreemap();
  }, [createTreemap]);

  return (
    <div className="relative w-full h-full">
      {/* Main treemap */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
        style={{ background: "transparent" }}
      />

      {/* Scanning overlay */}
      {isScanning && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {scanProgress?.phase === "immediate" ? "Quick Scan" : "Deep Scan"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {scanProgress?.currentDirectory || "Scanning..."}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {scanProgress?.scannedFiles ?? 0} files, {scanProgress?.scannedDirectories ?? 0} directories
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredItem && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs z-10">
          <div className="space-y-1">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
              {hoveredItem.name}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatBytes(hoveredItem.size || 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {hoveredItem.type} • {hoveredItem.extension || "no extension"}
            </p>
            {hoveredItem.isPlaceholder && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Still scanning...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: colorScale("directory") as string }}></div>
              <span className="text-gray-600 dark:text-gray-400">Directories</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: colorScale("file") as string }}></div>
              <span className="text-gray-600 dark:text-gray-400">Files</span>
            </div>
            {isScanning && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: colorScale("placeholder") as string }}></div>
                <span className="text-gray-600 dark:text-gray-400">Scanning...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
