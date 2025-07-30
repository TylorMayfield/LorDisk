# LorDisk - Cross-Platform Disk Space Analyzer & Cleanup Tool

LorDisk is a sleek, modern storage analyzer built with Next.js and Electron, designed to help you visualize, browse, and reclaim disk space across macOS, Windows, and Linux.

## Features

### Core Functionality

- **Visual Folder Mapping**: Explore your drive using intuitive sunburst charts and treemaps
- **Deep Storage Insights**: Identify large or duplicate files with powerful filtering and sorting tools
- **One-Click Cleanup**: Safely delete junk, temporary, or stale files with confirmation safeguards
- **Breadcrumb Navigation**: Browse directory trees easily without losing context
- **Dark Mode / Light Mode**: Switch between themes for comfort and clarity
- **Drag & Drop Support**: Quickly target folders or drives for analysis

### Analysis Tools

- **File Type Analysis**: See which file types are consuming the most space
- **Large File Detection**: Find files larger than 100MB for potential cleanup
- **Old File Identification**: Locate files older than 30 days
- **Duplicate Detection**: Find potential duplicate files based on size
- **Real-time Scanning**: Fast directory scanning with progress indicators

### Visualizations

- **Sunburst Charts**: Interactive circular visualizations of folder hierarchies
- **Treemap Views**: Rectangular space-filling visualizations
- **Size-based Sorting**: Sort files by size, name, type, or modification date
- **Color-coded File Types**: Easy identification of different file categories

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/tylormayfield/lordisk.git
   cd lordisk
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm run dist
   ```

## Tech Stack

- **Frontend**: React with Next.js 14
- **Desktop Shell**: Electron 28
- **Visualization**: D3.js 7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Filesystem Access**: Node.js via Electron's native bridge

## Cross-Platform Support

LorDisk works seamlessly across all major desktop platforms:

- **macOS**: Native macOS app with proper window management
- **Windows**: Full Windows integration with system dialogs
- **Linux**: Compatible with major Linux distributions

## Use Cases

- **Free up disk space** before a backup or OS upgrade
- **Find what's eating up your SSD** with visual analysis
- **Visualize external drives**, NAS, or USB storage
- **Quickly identify and remove** clutter or forgotten files
- **Analyze project folders** to understand storage patterns

## Development

### Project Structure

```
lordisk/
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── main.js               # Electron main process
├── preload.js            # Electron preload script
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

### Key Components

- **Dashboard**: Main application interface with tabs
- **FileList**: Sortable table view of files and folders
- **VisualChart**: D3.js powered sunburst and treemap visualizations
- **CleanupTools**: File analysis and deletion tools
- **Sidebar**: Drive selection and navigation

### Adding New Features

1. **New File Operations**: Add to `main.js` IPC handlers
2. **UI Components**: Create in `app/components/`
3. **Visualizations**: Extend `VisualChart.tsx` with new D3.js charts
4. **Analysis Tools**: Add to `CleanupTools.tsx`

## Safety Features

- **Confirmation dialogs** for all deletion operations
- **File type filtering** to prevent accidental deletions
- **Size-based warnings** for large file operations
- **Error handling** with user-friendly messages
- **Undo protection** with clear warnings

## Building for Distribution

### macOS

```bash
npm run dist
# Creates .dmg file in dist/ folder
```

### Windows

```bash
npm run dist
# Creates .exe installer in dist/ folder
```

### Linux

```bash
npm run dist
# Creates .AppImage and .deb packages
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **D3.js** for powerful data visualization capabilities
- **Electron** for cross-platform desktop app framework
- **Next.js** for modern React development experience
- **Tailwind CSS** for utility-first styling
- **Lucide** for beautiful, consistent icons

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/tylormayfield/lordisk/issues) page
2. Create a new issue with detailed information
3. Include your operating system and version

---

**LorDisk** - Making disk space management beautiful and efficient across all platforms.
