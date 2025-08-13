# Installer Scripts

All installation utilities are kept under `tools/scripts/scripts/`. They package the launchers together with the API and web apps for each operating system.

## macOS

1. `./tools/scripts/scripts/make-installer.sh <version>` builds `NovaUniverse-<version>.pkg`. The script expects the SwiftUI app to be built under `nova-macos-swift/build` and stages it under `nova-macos-swift/pkgroot/Applications` before invoking `pkgbuild`.
2. `./tools/scripts/scripts/uninstall-macos.sh` removes the application from `/Applications`.
3. `./tools/scripts/scripts/upgrade-macos.sh <version>` rebuilds the package (or accepts a `.pkg` path) and reinstalls it.

## Windows

1. Install Inno Setup, Node.js and npm.
2. Run `./tools/scripts/scripts/make-windows-installer.ps1 -Version <version>` to create `NovaUniverse-<version>.exe`.
3. Execute the generated installer.

## Linux

1. Install `electron-installer-appimage` globally if missing.
2. Run `./tools/scripts/scripts/make-linux-installer.sh <version>` to produce an AppImage.
3. Mark the file executable and run it to start Nova Universe.
