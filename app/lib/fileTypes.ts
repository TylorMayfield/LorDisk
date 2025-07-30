export interface FileTypeInfo {
  category: string;
  icon: string;
  description: string;
  isSystemFile?: boolean;
  isExecutable?: boolean;
  isArchive?: boolean;
  isMedia?: boolean;
  isDocument?: boolean;
  isCode?: boolean;
  isImage?: boolean;
  isVideo?: boolean;
  isAudio?: boolean;
  isFont?: boolean;
  isDatabase?: boolean;
  isBackup?: boolean;
  isTemporary?: boolean;
  isHidden?: boolean;
  priority?: number; // Higher number = higher priority for display
}

export interface FileTypeCategory {
  name: string;
  description: string;
  icon: string;
  color: string;
  priority: number;
}

export const FILE_TYPE_CATEGORIES: Record<string, FileTypeCategory> = {
  system: {
    name: "System Files",
    description: "Operating system and core system files",
    icon: "Settings",
    color: "text-red-600",
    priority: 10,
  },
  executable: {
    name: "Executables",
    description: "Programs and applications",
    icon: "Play",
    color: "text-green-600",
    priority: 9,
  },
  document: {
    name: "Documents",
    description: "Text documents and office files",
    icon: "FileText",
    color: "text-blue-600",
    priority: 8,
  },
  spreadsheet: {
    name: "Spreadsheets",
    description: "Data and calculation files",
    icon: "BarChart3",
    color: "text-green-600",
    priority: 7,
  },
  presentation: {
    name: "Presentations",
    description: "Slide shows and presentations",
    icon: "Presentation",
    color: "text-orange-600",
    priority: 6,
  },
  image: {
    name: "Images",
    description: "Photos and graphics",
    icon: "Image",
    color: "text-purple-600",
    priority: 5,
  },
  video: {
    name: "Videos",
    description: "Movie and video files",
    icon: "Video",
    color: "text-red-500",
    priority: 4,
  },
  audio: {
    name: "Audio",
    description: "Music and sound files",
    icon: "Music",
    color: "text-pink-600",
    priority: 3,
  },
  archive: {
    name: "Archives",
    description: "Compressed and packaged files",
    icon: "Archive",
    color: "text-yellow-600",
    priority: 2,
  },
  code: {
    name: "Code",
    description: "Programming and development files",
    icon: "Code",
    color: "text-indigo-600",
    priority: 1,
  },
  database: {
    name: "Databases",
    description: "Data storage and database files",
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
  backup: {
    name: "Backups",
    description: "Backup and recovery files",
    icon: "Save",
    color: "text-teal-600",
    priority: -2,
  },
  temporary: {
    name: "Temporary",
    description: "Temporary and cache files",
    icon: "Clock",
    color: "text-gray-500",
    priority: -3,
  },
  unknown: {
    name: "Unknown",
    description: "Unrecognized file types",
    icon: "FileQuestion",
    color: "text-gray-400",
    priority: -10,
  },
};

export const FILE_TYPES: { [key: string]: FileTypeInfo } = {
  // Temporarily disabled due to duplicate entries
  // Will be re-enabled after fixing all duplicates
};

export function getFileTypeInfo(extension: string): FileTypeInfo {
  const normalizedExt = extension.toLowerCase();

  // Dynamic category mapping
  const categoryMap: { [key: string]: string[] } = {
    image: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "svg",
      "webp",
      "ico",
      "tiff",
      "tif",
      "heic",
      "heif",
    ],
    video: [
      "mp4",
      "avi",
      "mov",
      "mkv",
      "wmv",
      "flv",
      "webm",
      "m4v",
      "3gp",
      "ogv",
      "mpg",
      "mpeg",
    ],
    audio: [
      "mp3",
      "wav",
      "flac",
      "aac",
      "ogg",
      "m4a",
      "wma",
      "aiff",
      "aif",
      "oga",
      "opus",
    ],
    document: ["pdf", "doc", "docx", "txt", "rtf", "odt", "pages", "md"],
    spreadsheet: ["xls", "xlsx", "csv", "ods", "numbers"],
    presentation: ["ppt", "pptx", "odp", "key"],
    archive: ["zip", "rar", "tar", "gz", "7z", "bz2", "xz", "lzma"],
    code: [
      "js",
      "ts",
      "jsx",
      "tsx",
      "py",
      "java",
      "cpp",
      "c",
      "h",
      "html",
      "css",
      "scss",
      "sass",
      "json",
      "xml",
      "yml",
      "yaml",
      "sql",
      "php",
      "rb",
      "go",
      "rs",
      "swift",
      "kt",
      "sh",
      "ps1",
      "bat",
      "vue",
      "svelte",
    ],
    data: ["db", "sqlite", "mdb", "accdb"],
    font: ["ttf", "otf", "woff", "woff2"],
    executable: ["exe", "dmg", "pkg", "deb", "rpm", "app"],
    system: ["dll", "so", "dylib", "sys", "ini", "cfg", "conf"],
    design: ["psd", "ai", "sketch", "fig", "xd", "indd", "eps"],
  };

  // Find the category for this extension
  let category = "unknown";
  for (const [cat, extensions] of Object.entries(categoryMap)) {
    if (extensions.includes(normalizedExt)) {
      category = cat;
      break;
    }
  }

  return {
    category,
    icon: getFileTypeIcon(extension),
    description: getFileTypeDescription(extension),
    priority: getFileTypePriority(extension),
  };
}

export function getFileTypeCategory(extension: string): string {
  return getFileTypeInfo(extension).category;
}

export function getFileTypeIcon(extension: string): string {
  if (!extension) return "FileText";

  const cleanExtension = extension.replace(/^\./, "").toLowerCase();

  // Use a hash-based approach to determine icon
  const iconMap: { [key: string]: string[] } = {
    FileText: ["txt", "rtf", "odt", "pages", "md", "log", "ini", "cfg", "conf"],
    Image: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "svg",
      "webp",
      "ico",
      "tiff",
      "tif",
      "heic",
      "heif",
    ],
    Video: [
      "mp4",
      "avi",
      "mov",
      "mkv",
      "wmv",
      "flv",
      "webm",
      "m4v",
      "3gp",
      "ogv",
      "mpg",
      "mpeg",
    ],
    Music: [
      "mp3",
      "wav",
      "flac",
      "aac",
      "ogg",
      "m4a",
      "wma",
      "aiff",
      "aif",
      "oga",
      "opus",
    ],
    BarChart3: [
      "xls",
      "xlsx",
      "csv",
      "ods",
      "numbers",
      "db",
      "sqlite",
      "mdb",
      "accdb",
    ],
    Presentation: ["ppt", "pptx", "odp", "key"],
    Archive: ["zip", "rar", "tar", "gz", "7z", "bz2", "xz", "lzma"],
    Code: [
      "js",
      "ts",
      "jsx",
      "tsx",
      "py",
      "java",
      "cpp",
      "c",
      "h",
      "html",
      "css",
      "scss",
      "sass",
      "json",
      "xml",
      "yml",
      "yaml",
      "sql",
      "php",
      "rb",
      "go",
      "rs",
      "swift",
      "kt",
      "sh",
      "ps1",
      "bat",
      "vue",
      "svelte",
    ],
    Settings: [
      "exe",
      "dmg",
      "pkg",
      "deb",
      "rpm",
      "app",
      "dll",
      "so",
      "dylib",
      "sys",
    ],
    Globe: ["htm", "html", "css", "js", "jsx", "ts", "tsx", "vue", "svelte"],
    Palette: ["psd", "ai", "sketch", "fig", "xd", "indd", "eps", "svg"],
  };

  // Find the icon category for this extension
  for (const [icon, extensions] of Object.entries(iconMap)) {
    if (extensions.includes(cleanExtension)) {
      return icon;
    }
  }

  // Default to FileText for unknown extensions
  return "FileText";
}

export function getFileTypeDescription(extension: string): string {
  if (!extension) return "Unknown file type";

  const cleanExtension = extension.replace(/^\./, "").toLowerCase();

  // Dynamic description mapping
  const descriptionMap: { [key: string]: string[] } = {
    "Text document": ["txt", "rtf", "odt", "pages", "md", "log"],
    "Image file": [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "svg",
      "webp",
      "ico",
      "tiff",
      "tif",
      "heic",
      "heif",
    ],
    "Video file": [
      "mp4",
      "avi",
      "mov",
      "mkv",
      "wmv",
      "flv",
      "webm",
      "m4v",
      "3gp",
      "ogv",
      "mpg",
      "mpeg",
    ],
    "Audio file": [
      "mp3",
      "wav",
      "flac",
      "aac",
      "ogg",
      "m4a",
      "wma",
      "aiff",
      "aif",
      "oga",
      "opus",
    ],
    Document: ["pdf", "doc", "docx"],
    Spreadsheet: ["xls", "xlsx", "csv", "ods", "numbers"],
    Presentation: ["ppt", "pptx", "odp", "key"],
    Archive: ["zip", "rar", "tar", "gz", "7z", "bz2", "xz", "lzma"],
    "Code file": [
      "js",
      "ts",
      "jsx",
      "tsx",
      "py",
      "java",
      "cpp",
      "c",
      "h",
      "html",
      "css",
      "scss",
      "sass",
      "json",
      "xml",
      "yml",
      "yaml",
      "sql",
      "php",
      "rb",
      "go",
      "rs",
      "swift",
      "kt",
      "sh",
      "ps1",
      "bat",
      "vue",
      "svelte",
    ],
    Database: ["db", "sqlite", "mdb", "accdb"],
    "Font file": ["ttf", "otf", "woff", "woff2"],
    Executable: ["exe", "dmg", "pkg", "deb", "rpm", "app"],
    "System file": ["dll", "so", "dylib", "sys", "ini", "cfg", "conf"],
    "Design file": ["psd", "ai", "sketch", "fig", "xd", "indd", "eps"],
  };

  // Find the description for this extension
  for (const [description, extensions] of Object.entries(descriptionMap)) {
    if (extensions.includes(cleanExtension)) {
      return description;
    }
  }

  // Default description for unknown extensions
  return "Unknown file type";
}

export function isSystemFile(extension: string): boolean {
  return getFileTypeInfo(extension).isSystemFile || false;
}

export function isExecutable(extension: string): boolean {
  return getFileTypeInfo(extension).isExecutable || false;
}

export function isArchive(extension: string): boolean {
  return getFileTypeInfo(extension).isArchive || false;
}

export function isMedia(extension: string): boolean {
  const info = getFileTypeInfo(extension);
  return info.isImage || info.isVideo || info.isAudio || false;
}

export function isDocument(extension: string): boolean {
  return getFileTypeInfo(extension).isDocument || false;
}

export function isCode(extension: string): boolean {
  return getFileTypeInfo(extension).isCode || false;
}

export function isImage(extension: string): boolean {
  return getFileTypeInfo(extension).isImage || false;
}

export function isVideo(extension: string): boolean {
  return getFileTypeInfo(extension).isVideo || false;
}

export function isAudio(extension: string): boolean {
  return getFileTypeInfo(extension).isAudio || false;
}

export function isFont(extension: string): boolean {
  return getFileTypeInfo(extension).isFont || false;
}

export function isDatabase(extension: string): boolean {
  return getFileTypeInfo(extension).isDatabase || false;
}

export function isBackup(extension: string): boolean {
  return getFileTypeInfo(extension).isBackup || false;
}

export function isTemporary(extension: string): boolean {
  return getFileTypeInfo(extension).isTemporary || false;
}

export function isHidden(extension: string): boolean {
  return getFileTypeInfo(extension).isHidden || false;
}

export function getFileTypePriority(extension: string): number {
  if (!extension) return -1000;

  const cleanExtension = extension.replace(/^\./, "").toLowerCase();

  // Dynamic priority mapping
  const priorityMap: { [key: string]: number } = {
    image: 5,
    video: 4,
    audio: 3,
    document: 8,
    spreadsheet: 7,
    presentation: 6,
    archive: 2,
    code: 1,
    data: 0,
    font: -1,
    executable: 9,
    system: 10,
    design: -2,
  };

  // Get category first
  const category = getFileTypeCategory(extension);
  return priorityMap[category] || -1000;
}

export function getCategoryInfo(category: string): FileTypeCategory {
  return FILE_TYPE_CATEGORIES[category] || FILE_TYPE_CATEGORIES.unknown;
}

export function getAllCategories(): FileTypeCategory[] {
  return Object.values(FILE_TYPE_CATEGORIES).sort(
    (a, b) => b.priority - a.priority
  );
}

export function getFileTypesByCategory(category: string): string[] {
  return Object.entries(FILE_TYPES)
    .filter(([_, info]) => info.category === category)
    .map(([ext, _]) => ext)
    .sort();
}

export function getFileTypeStats(files: any[]): {
  category: string;
  count: number;
  totalSize: number;
  extensions: string[];
}[] {
  const stats: Record<
    string,
    { count: number; totalSize: number; extensions: Set<string> }
  > = {};

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
    .sort((a, b) => {
      const aPriority = getCategoryInfo(a.category).priority;
      const bPriority = getCategoryInfo(b.category).priority;
      return bPriority - aPriority;
    });
}
