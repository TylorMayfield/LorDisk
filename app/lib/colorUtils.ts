/**
 * Utility functions for generating consistent colors based on file extensions
 */

/**
 * Generates a consistent color hash based on file extension
 * @param extension - The file extension (e.g., "jpg", "pdf")
 * @returns HSL color string
 */
export function generateColorFromExtension(extension: string): string {
  if (!extension) return "hsl(0, 0%, 60%)"; // Gray for unknown

  // Create a hash from the extension
  let hash = 0;
  for (let i = 0; i < extension.length; i++) {
    const char = extension.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to generate consistent colors
  const hue = Math.abs(hash) % 360; // 0-359 degrees
  const saturation = 60 + (Math.abs(hash) % 20); // 60-80% saturation
  const lightness = 45 + (Math.abs(hash) % 15); // 45-60% lightness

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generates a color for file types with category-based grouping
 * @param extension - The file extension
 * @param category - Optional category override
 * @returns HSL color string
 */
export function generateCategoryColor(
  extension: string,
  categoryOverride?: string
): string {
  if (categoryOverride) {
    return generateColorFromExtension(categoryOverride);
  }

  // Use pure hash-based color generation - no hardcoded mappings
  return generateColorFromExtension(extension);
}

/**
 * Converts HSL color to hex for compatibility with older systems
 * @param hsl - HSL color string
 * @returns Hex color string
 */
export function hslToHex(hsl: string): string {
  // Extract HSL values
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return "#6B7280"; // Fallback gray

  const h = parseInt(match[1]);
  const s = parseInt(match[2]);
  const l = parseInt(match[3]);

  // Convert HSL to RGB
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;

  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((hue * 6) % 2) - 1));
  const m = lightness - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (hue < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (hue < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (hue < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (hue < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (hue < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const rHex = Math.round((r + m) * 255)
    .toString(16)
    .padStart(2, "0");
  const gHex = Math.round((g + m) * 255)
    .toString(16)
    .padStart(2, "0");
  const bHex = Math.round((b + m) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}
