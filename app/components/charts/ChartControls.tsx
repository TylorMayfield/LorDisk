"use client";

export type ChartType = "sunburst" | "treemap";

interface ChartControlsProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  selectedNode?: any;
}

export function ChartControls({
  chartType,
  onChartTypeChange,
  selectedNode,
}: ChartControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onChartTypeChange("sunburst")}
          className={`btn ${
            chartType === "sunburst" ? "btn-primary" : "btn-secondary"
          }`}
        >
          Sunburst Chart
        </button>
        <button
          onClick={() => onChartTypeChange("treemap")}
          className={`btn ${
            chartType === "treemap" ? "btn-primary" : "btn-secondary"
          }`}
        >
          Treemap
        </button>
      </div>

      {selectedNode && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Selected: {selectedNode.name} (
          {window.electronAPI.formatBytes(selectedNode.size)})
        </div>
      )}
    </div>
  );
}
