"use client";

import {
  Folder,
  FileText,
  BarChart3,
  Presentation,
  Image,
  Music,
  Video,
  Archive,
  Settings,
  Code,
  Globe,
  Palette,
  FileJson,
} from "lucide-react";
import { generateCategoryColor } from "../../lib/colorUtils";

interface FileIconProps {
  type: "file" | "directory";
  extension?: string;
  className?: string;
  useDynamicColors?: boolean;
}

export function FileIcon({
  type,
  extension,
  className = "w-4 h-4",
  useDynamicColors = false,
}: FileIconProps) {
  if (type === "directory") {
    return <Folder className={`${className} text-blue-600`} />;
  }

  // Get the appropriate Lucide icon based on file extension
  let iconName = "FileText"; // default

  // Only try to use electronAPI if we're in the browser and it's available
  if (typeof window !== "undefined" && window.electronAPI?.getFileIcon) {
    try {
      iconName = window.electronAPI.getFileIcon(extension || "");
    } catch (error) {
      console.warn("Failed to get file icon:", error);
    }
  } else {
    // Fallback to client-side icon mapping
    iconName = getClientSideFileIcon(extension);
  }

  const IconComponent = getIconComponent(iconName);

  if (useDynamicColors && type === "file" && extension) {
    const dynamicColor = generateCategoryColor(extension);
    return (
      <IconComponent className={className} style={{ color: dynamicColor }} />
    );
  }

  return <IconComponent className={`${className} text-gray-600`} />;
}

function getClientSideFileIcon(extension?: string): string {
  if (!extension) return "FileText";

  const cleanExtension = extension.replace(/^\./, "").toLowerCase();

  const iconMap: { [key: string]: string } = {
    // Images
    jpg: "Image",
    jpeg: "Image",
    png: "Image",
    gif: "Image",
    bmp: "Image",
    svg: "Image",
    webp: "Image",
    ico: "Image",
    tiff: "Image",
    tif: "Image",

    // Videos
    mp4: "Video",
    avi: "Video",
    mov: "Video",
    mkv: "Video",
    wmv: "Video",
    flv: "Video",
    webm: "Video",
    m4v: "Video",
    "3gp": "Video",
    ogv: "Video",

    // Audio
    mp3: "Music",
    wav: "Music",
    flac: "Music",
    aac: "Music",
    ogg: "Music",
    m4a: "Music",
    wma: "Music",
    aiff: "Music",
    aif: "Music",

    // Documents
    pdf: "FileText",
    doc: "FileText",
    docx: "FileText",
    txt: "FileText",
    rtf: "FileText",
    odt: "FileText",
    pages: "FileText",

    // Spreadsheets
    xls: "BarChart3",
    xlsx: "BarChart3",
    csv: "BarChart3",
    ods: "BarChart3",
    numbers: "BarChart3",

    // Presentations
    ppt: "Presentation",
    pptx: "Presentation",
    odp: "Presentation",
    key: "Presentation",

    // Archives
    zip: "Archive",
    rar: "Archive",
    tar: "Archive",
    gz: "Archive",
    "7z": "Archive",
    bz2: "Archive",
    xz: "Archive",

    // Code
    js: "Code",
    ts: "Code",
    jsx: "Code",
    tsx: "Code",
    py: "Code",
    java: "Code",
    cpp: "Code",
    c: "Code",
    h: "Code",
    html: "Code",
    css: "Code",
    scss: "Code",
    sass: "Code",
    json: "Code",
    xml: "Code",
    yml: "Code",
    yaml: "Code",
    md: "Code",
    sql: "Code",
    php: "Code",
    rb: "Code",
    go: "Code",
    rs: "Code",
    swift: "Code",
    kt: "Code",
    sh: "Code",
    ps1: "Code",
    bat: "Code",

    // Data
    db: "BarChart3",
    sqlite: "BarChart3",
    mdb: "BarChart3",
    accdb: "BarChart3",

    // Fonts
    ttf: "FileText",
    otf: "FileText",
    woff: "FileText",
    woff2: "FileText",

    // Executables
    exe: "Settings",
    dmg: "Settings",
    pkg: "Settings",
    deb: "Settings",
    rpm: "Settings",
    app: "Settings",

    // System files
    dll: "Settings",
    so: "Settings",
    dylib: "Settings",
    sys: "Settings",
    ini: "Settings",
    cfg: "Settings",
    conf: "Settings",

    // Web
    htm: "Globe",
    vue: "Globe",
    svelte: "Globe",

    // Design
    psd: "Palette",
    ai: "Palette",
    sketch: "Palette",
    fig: "Palette",
    xd: "Palette",
    indd: "Palette",
    eps: "Palette",
  };

  return iconMap[cleanExtension] || "FileText";
}

function getIconComponent(iconName: string) {
  const iconMap: { [key: string]: any } = {
    FileText: FileText,
    BarChart3: BarChart3,
    Presentation: Presentation,
    Image: Image,
    Music: Music,
    Video: Video,
    Archive: Archive,
    Settings: Settings,
    Code: Code,
    Globe: Globe,
    Palette: Palette,
    FileJson: FileJson,
  };
  return iconMap[iconName] || FileText;
}
