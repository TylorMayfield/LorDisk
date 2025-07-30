function generateColorFromExtension(extension) {
  if (!extension) {
    extension = "unknown";
  }

  // Create a hash from the extension
  let hash = 0;
  const cleanExtension = extension.replace(/^\./, "").toLowerCase();

  for (let i = 0; i < cleanExtension.length; i++) {
    const char = cleanExtension.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to generate HSL color
  const hue = Math.abs(hash) % 360;
  const saturation = 60 + (Math.abs(hash >> 8) % 20); // 60-80%
  const lightness = 45 + (Math.abs(hash >> 16) % 20); // 45-65%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function generateCategoryColor(extension, categoryOverride) {
  if (categoryOverride) {
    return generateColorFromExtension(categoryOverride);
  }

  // Use pure hash-based color generation - no hardcoded mappings
  return generateColorFromExtension(extension);
}

module.exports = {
  generateColorFromExtension,
  generateCategoryColor,
};
