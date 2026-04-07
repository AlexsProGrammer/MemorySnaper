# MemorySnaper

> Save and relive your Snapchat memories, 100% on your own machine.

MemorySnaper is a local-first desktop app built with Tauri, React, and Rust. It imports your official Snapchat export, downloads media, rebuilds overlays, and lets you browse everything in a fast viewer. No account required. No cloud upload. No third-party processing.

## Quick Start

### Path A: Normal users (recommended)

1. Open the GitHub Releases page:
     https://github.com/AlexsProGrammer/MemorySnaper/releases
2. Download the installer for your OS.
3. Install and open MemorySnaper.
4. Import your Snapchat export ZIP files in the Extractor tab.

If there is no release for your OS yet, use Path B below (build from source).

### Path B: Developers (build from source)

Use this path only if you want to run from source or contribute code.

```bash
git clone https://github.com/AlexsProGrammer/MemorySnaper.git
cd MemorySnaper
pnpm install
pnpm tauri dev
```

## Download Prebuilt App

Releases page:
https://github.com/AlexsProGrammer/MemorySnaper/releases

Look for an asset matching your system:

- Windows: .msi (or .exe)
- Linux: .deb / .AppImage / .rpm
- macOS: .dmg

If you are new to GitHub:

1. Open the Releases page link above.
2. Open the newest release (top entry).
3. Scroll to Assets.
4. Download the file that matches your OS.

## Get Your Snapchat Export

Request your data at:
https://accounts.snapchat.com/v2/welcome

Path in Snapchat account portal:

- My Data -> Memories

Notes:

- Export preparation can take 24-72 hours.
- First login on a new device can delay export processing for security checks.
- Download all ZIP files once ready: main mydata~<id> plus optional numbered parts.

## Visual Guide (mydata + setup)

These are the same visuals used in the in-app help flow.

![Snapchat export walkthrough](public/tutorials/snapchat-export/step4.svg)

Expected ZIP naming:

- Main archive: mydata~<uuid>
- Optional extra parts: mydata~<uuid> 1, mydata~<uuid> 2, ...
- The main archive must contain json/memories_history.json.

![First-time setup overview](public/tutorials/first-time-setup/step2.svg)

## Video Walkthrough

Install + first import + viewer showcase:

- YouTube: TODO add official walkthrough link

Planned chapters:

1. Install MemorySnaper from Releases
2. Request and download Snapchat export
3. Import ZIP files in Extractor
4. Process and browse memories in Viewer

## Features

| Feature | Description |
|---|---|
| 100% Local Processing | Every operation runs on your machine. No data is transmitted to external services. |
| Multi-Part ZIP and JSON Import | Accepts Snapchat export ZIP archives or a standalone memories_history.json file. |
| Concurrent Media Download | Async downloader with configurable rate limiting and concurrency. |
| Overlay Burn-in | Rebuilds Snapchat text/caption overlays onto photos and videos. |
| Virtualized Media Grid | Smooth browsing for large memory libraries. |
| Dark and Light Theme Support | Follows system theme and supports manual override. |
| Privacy-First Architecture | Media and metadata stay in local SQLite storage. |

## Developer Setup (Detailed)

Prerequisites:

- Node.js 18+
- Rust (stable toolchain, 1.77+)
- pnpm (recommended) or npm

### Linux (tested)

1. Install system dependencies (Debian/Ubuntu example):

```bash
sudo apt update
sudo apt install -y \
        build-essential \
        curl \
        libwebkit2gtk-4.1-dev \
        libgtk-3-dev \
        libayatana-appindicator3-dev \
        librsvg2-dev \
        patchelf \
        gstreamer1.0-libav \
        gstreamer1.0-plugins-good \
        gstreamer1.0-plugins-bad \
        gstreamer1.0-plugins-ugly
```

2. Install Rust:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

3. Install Node.js and pnpm:

```bash
node -v
npm -v
npm install -g pnpm
```

4. Run app from source:

```bash
git clone https://github.com/AlexsProGrammer/MemorySnaper.git
cd MemorySnaper
pnpm install
pnpm tauri dev
```

### Windows (tested)

1. Install:

- Node.js 18+
- Rust via rustup
- Visual Studio Build Tools 2022 with Desktop development with C++
- WebView2 Runtime (usually already installed on Windows 11)

2. Verify toolchain in a new PowerShell terminal:

```powershell
node -v
npm -v
rustc -V
cargo -V
cl
```

3. Run app from source:

```powershell
npm install -g pnpm
git clone https://github.com/AlexsProGrammer/MemorySnaper.git
Set-Location MemorySnaper
pnpm install
pnpm tauri dev
```

### macOS (community-tested target)

1. Install Xcode Command Line Tools:

```bash
xcode-select --install
```

2. Install Rust:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

3. Install Node.js and pnpm, then run:

```bash
git clone https://github.com/AlexsProGrammer/MemorySnaper.git
cd MemorySnaper
npm install -g pnpm
pnpm install
pnpm tauri dev
```

### Build installer locally

```bash
pnpm tauri build
```

Output path:

- src-tauri/target/release/bundle/

## Release Checklist (Maintainers)

Use this checklist when publishing a new GitHub release:

1. Create release tag in format vX.Y.Z
2. Add clear release title and short changelog summary
3. Attach installers per OS with recognizable names
4. Add sha256 checksums in release notes
5. Confirm README release link points to the correct page

Suggested asset naming:

- memorysnaper-vX.Y.Z-windows-x64.msi
- memorysnaper-vX.Y.Z-linux-x64.deb
- memorysnaper-vX.Y.Z-macos-universal.dmg

## Architecture

MemorySnaper follows a strict local-first, layered architecture:

```text
React UI (Vite + TypeScript + Tailwind)
    -> Tauri IPC commands
Rust Backend (core + db modules)
    -> Local SQLite database
```

Data flow:

1. User imports Snapchat ZIP or JSON export
2. Frontend invokes Tauri import commands
3. Rust parser writes records into SQLite
4. Downloader fetches media and stores files locally
5. Processor rebuilds overlays and thumbnails
6. Viewer reads local data and renders a virtualized grid

All progress is stored locally and survives app restarts.

## Troubleshooting

- Linux video playback issues:
    install gstreamer1.0-libav, gstreamer1.0-plugins-good, gstreamer1.0-plugins-bad, gstreamer1.0-plugins-ugly and restart the app.
- ZIP validation error:
    ensure the main mydata~<uuid> archive contains json/memories_history.json.
- No release available for your OS:
    use the build-from-source path in Developer Setup.

## Contributing

1. Fork repository and create a feature branch
2. Run cargo fmt and cargo clippy --all-targets --all-features -D warnings before Rust commits
3. Run pnpm typecheck before TypeScript commits
4. Open a pull request with a clear summary and test notes

## License

MIT
