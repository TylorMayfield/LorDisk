# GitHub Actions Workflows

This directory contains GitHub Actions workflows for building, testing, and releasing LorDisk.

## Workflows

### 1. CI (`ci.yml`)

**Triggers:** Push to main/develop, Pull Requests to main

**Purpose:** Continuous Integration testing

- Runs linting, type checking, and build tests
- Tests on multiple Node.js versions (16.x, 18.x, 20.x)
- Tests on Windows, macOS, and Linux
- Security audit and vulnerability scanning

### 2. Release (`release.yml`)

**Triggers:** Release published

**Purpose:** Build and publish release binaries

- Builds Windows executable (.exe)
- Builds macOS universal binary (.dmg) for Intel + Apple Silicon
- Builds Linux AppImage (.AppImage)
- Creates platform-specific zip files
- Uploads assets to GitHub release

### 3. Build (`build.yml`)

**Triggers:** Push to main/develop, Pull Requests, Release published

**Purpose:** General build workflow

- Matrix build across platforms
- Artifact upload for testing
- Release asset creation

## Build Targets

### Windows

- **Target:** NSIS installer + Portable executable
- **Architecture:** x64
- **Output:** `.exe` files

### macOS

- **Target:** DMG installer + ZIP archive
- **Architecture:** x64 + arm64 (universal)
- **Output:** `.dmg` files
- **Features:** Hardened runtime, code signing ready

### Linux

- **Target:** AppImage, DEB, RPM, Snap
- **Architecture:** x64
- **Output:** `.AppImage`, `.deb`, `.rpm`, `.snap` files

## Configuration

### Electron Builder Config

Located in `package.json` under the `"build"` key:

```json
{
  "build": {
    "appId": "com.lordisk.app",
    "productName": "LorDisk",
    "mac": {
      "target": ["dmg", "zip"],
      "arch": ["x64", "arm64"],
      "hardenedRuntime": true
    },
    "win": {
      "target": ["nsis", "portable"],
      "arch": ["x64"]
    },
    "linux": {
      "target": ["AppImage", "deb", "rpm", "snap"],
      "arch": ["x64"]
    }
  }
}
```

### macOS Entitlements

File: `assets/entitlements.mac.plist`

- Enables file system access
- Allows network connections
- Permits JIT compilation for Electron
- Grants necessary permissions for disk analysis

## Usage

### Local Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for current platform
npm run electron:build

# Build for specific platform
npm run electron:build:win
npm run electron:build:mac
npm run electron:build:linux
```

### Creating a Release

1. Create a new release on GitHub
2. Tag it with a version (e.g., `v1.0.0`)
3. Publish the release
4. GitHub Actions will automatically:
   - Build binaries for all platforms
   - Create platform-specific zip files
   - Upload assets to the release

### Release Assets

Each release will include:

- `LorDisk-Windows-x64.zip` - Windows installer and portable
- `LorDisk-macOS-universal.zip` - macOS universal binary
- `LorDisk-Linux-x64.zip` - Linux AppImage
- `LorDisk-All-Platforms.zip` - All platforms combined

## Troubleshooting

### Common Issues

1. **Build fails on macOS**

   - Ensure entitlements file exists
   - Check for code signing requirements

2. **Windows build issues**

   - Verify NSIS is available
   - Check icon file exists

3. **Linux build problems**
   - Ensure AppImage tools are installed
   - Check for required dependencies

### Debugging

- Check workflow logs in GitHub Actions
- Verify all required files exist
- Ensure proper file permissions
- Test builds locally first

## Security

- All builds run in isolated environments
- Dependencies are audited for vulnerabilities
- macOS builds use hardened runtime
- Windows builds use proper execution levels
- Linux builds follow security best practices
