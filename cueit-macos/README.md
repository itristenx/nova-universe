# CueIT macOS Installer

Electron launcher packaged for macOS.

## Building

Run `../installers/make-installer.sh <version>` on an Apple Silicon Mac to generate an **arm64** installer. Pass `universal` after the version to create a combined package for Intel and Apple Silicon Macs. Install the package to `/Applications`. The minimum supported macOS version is **12**.
All installer scripts live in the repository's `installers/` directory. Use `../installers/uninstall-macos.sh` to remove the application. The helper script `../installers/upgrade-macos.sh` rebuilds a new package and reinstalls it.

## Setup

1. Launch the app after installation.
2. On first run `.env.example` files are copied to `.env` for each service.
3. A configuration window opens so you can edit the values for local or production.
4. After saving the files the regular launcher window appears.

Use the checkboxes to choose which services to start and click **Start**.

## Tests

Install dependencies with `npm install` and run `npm test` to execute the Jest
suite. Tests verify that configuration files are created on first launch and
that the correct page loads based on startup state.
