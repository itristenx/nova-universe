# Installer Scripts

All installation utilities are kept in the `installers/` directory. They package the Electron launcher together with the API and web apps for each operating system.

## macOS

1. `./installers/make-installer.sh <version> [arch]` builds `CueIT-<version>.pkg` for the specified architecture (`arm64`, `x64` or `universal`).
2. `./installers/uninstall-macos.sh` removes the application from `/Applications`.
3. `./installers/upgrade-macos.sh <version>` rebuilds the package (or accepts a `.pkg` path) and reinstalls it.

## Windows

1. Install Inno Setup, Node.js and npm.
2. Run `./installers/make-windows-installer.ps1 -Version <version>` to create `CueIT-<version>.exe`.
3. Execute the generated installer.

## Linux

1. Install `electron-installer-appimage` globally if missing.
2. Run `./installers/make-linux-installer.sh <version>` to produce an AppImage.
3. Mark the file executable and run it to start CueIT.
