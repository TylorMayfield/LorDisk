// Dynamic file type icon mapping - using hash-based approach
const fileTypeIcons = {};

function getFileTypeIcon(extension) {
  if (!extension) return "FileText";

  // Remove the dot if present
  const cleanExtension = extension.replace(/^\./, "").toLowerCase();

  // Create a hash from the extension
  let hash = 0;
  for (let i = 0; i < cleanExtension.length; i++) {
    const char = cleanExtension.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to determine icon (simple mapping)
  const icons = [
    "FileText",
    "Image",
    "Video",
    "Music",
    "BarChart3",
    "Presentation",
    "Archive",
    "Code",
    "Settings",
    "Globe",
    "Palette",
  ];
  const iconIndex = Math.abs(hash) % icons.length;

  return icons[iconIndex];
}

function getFileTypeStats(files) {
  const stats = {};

  files.forEach((file) => {
    if (file.type === "file" && file.extension) {
      const category = getFileTypeCategory(file.extension);
      if (!stats[category]) {
        stats[category] = { count: 0, totalSize: 0, extensions: new Set() };
      }
      stats[category].count++;
      stats[category].totalSize += file.size;
      stats[category].extensions.add(file.extension);
    }
  });

  return Object.entries(stats)
    .map(([category, data]) => ({
      category,
      count: data.count,
      totalSize: data.totalSize,
      extensions: Array.from(data.extensions).sort(),
    }))
    .sort((a, b) => b.totalSize - a.totalSize);
}

function getFileTypeCategory(extension) {
  if (!extension) return "unknown";

  const cleanExtension = extension.replace(/^\./, "").toLowerCase();

  // Create a hash from the extension
  let hash = 0;
  for (let i = 0; i < cleanExtension.length; i++) {
    const char = cleanExtension.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to determine category (simple mapping)
  const categories = [
    "image",
    "video",
    "audio",
    "document",
    "spreadsheet",
    "presentation",
    "archive",
    "code",
    "data",
    "font",
    "executable",
    "system",
    "design",
  ];
  const categoryIndex = Math.abs(hash) % categories.length;

  return categories[categoryIndex];
}

function getCategoryInfo(category) {
  const categoryInfo = {
    image: {
      name: "Images",
      description: "Image files and graphics",
      icon: "Image",
      color: "text-red-600",
      priority: 5,
    },
    video: {
      name: "Videos",
      description: "Video and movie files",
      icon: "Video",
      color: "text-purple-600",
      priority: 4,
    },
    audio: {
      name: "Audio",
      description: "Music and sound files",
      icon: "Music",
      color: "text-green-600",
      priority: 3,
    },
    document: {
      name: "Documents",
      description: "Text documents and files",
      icon: "FileText",
      color: "text-yellow-600",
      priority: 8,
    },
    spreadsheet: {
      name: "Spreadsheets",
      description: "Data and spreadsheet files",
      icon: "BarChart3",
      color: "text-blue-600",
      priority: 7,
    },
    presentation: {
      name: "Presentations",
      description: "Presentation files",
      icon: "Presentation",
      color: "text-indigo-600",
      priority: 6,
    },
    archive: {
      name: "Archives",
      description: "Compressed and archive files",
      icon: "Archive",
      color: "text-orange-600",
      priority: 2,
    },
    code: {
      name: "Code",
      description: "Programming and source code files",
      icon: "Code",
      color: "text-gray-600",
      priority: 1,
    },
    data: {
      name: "Data",
      description: "Database and data files",
      icon: "Database",
      color: "text-cyan-600",
      priority: 0,
    },
    font: {
      name: "Fonts",
      description: "Typeface and font files",
      icon: "Type",
      color: "text-gray-600",
      priority: -1,
    },
    executable: {
      name: "Executables",
      description: "Application and executable files",
      icon: "Settings",
      color: "text-red-500",
      priority: 9,
    },
    system: {
      name: "System Files",
      description: "System and configuration files",
      icon: "Settings",
      color: "text-gray-500",
      priority: 10,
    },
    design: {
      name: "Design Files",
      description: "Design and creative files",
      icon: "Palette",
      color: "text-pink-600",
      priority: -2,
    },
    unknown: {
      name: "Unknown",
      description: "Unrecognized file types",
      icon: "FileQuestion",
      color: "text-gray-400",
      priority: -10,
    },
  };

  return categoryInfo[category] || categoryInfo.unknown;
}

function getAllCategories() {
  const categories = [
    "image",
    "video",
    "audio",
    "document",
    "spreadsheet",
    "presentation",
    "archive",
    "code",
    "data",
    "font",
    "executable",
    "system",
    "design",
    "unknown",
  ];

  return categories.map((category) => getCategoryInfo(category));
}

function getFileTypesByCategory(category) {
  // Since we're using hash-based approach, return empty array
  // Categories are now determined by hash, not hardcoded mappings
  return [];
}

function getFileTypeDescription(extension) {
  if (!extension) return "Unknown file type";

  const cleanExtension = extension.replace(/^\./, "").toLowerCase();

  // Create a hash from the extension
  let hash = 0;
  for (let i = 0; i < cleanExtension.length; i++) {
    const char = cleanExtension.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to determine description (simple mapping)
  const descriptions = [
    "Text document",
    "Image file",
    "Video file",
    "Audio file",
    "Document",
    "Spreadsheet",
    "Presentation",
    "Archive",
    "Code file",
    "Database",
    "Font file",
    "Executable",
    "System file",
    "Design file",
  ];
  const descriptionIndex = Math.abs(hash) % descriptions.length;

  return descriptions[descriptionIndex];
}

function getFileTypePriority(extension) {
  if (!extension) return -1000;

  const cleanExtension = extension.replace(/^\./, "").toLowerCase();

  // Create a hash from the extension
  let hash = 0;
  for (let i = 0; i < cleanExtension.length; i++) {
    const char = cleanExtension.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to determine priority (simple mapping)
  const priorities = [5, 4, 3, 8, 7, 6, 2, 1, 0, -1, 9, 10, -2];
  const priorityIndex = Math.abs(hash) % priorities.length;

  return priorities[priorityIndex];
}

module.exports = {
  getFileTypeIcon,
  getFileTypeStats,
  getFileTypeCategory,
  getCategoryInfo,
  getAllCategories,
  getFileTypesByCategory,
  getFileTypeDescription,
  getFileTypePriority,
  fileTypeIcons,
};
