# CueIT macOS Installer

Electron launcher packaged for macOS.

## Building

Run `../make-installer.sh` to create `CueIT-<version>.pkg`. Install the package to `/Applications`.

## Setup

1. Launch the app after installation.
2. On first run `.env.example` files are copied to `.env` for each service.
3. A configuration window opens so you can edit the values for local or production.
4. After saving the files the regular launcher window appears.

Use the checkboxes to choose which services to start and click **Start**.
