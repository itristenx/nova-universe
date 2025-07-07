# CueIT macOS Swift Launcher

This SwiftUI project launches the CueIT services on macOS without using Electron.

## Building

1. Open `cueit-macos-swift` in Xcode.
2. Select the **CueITApp** target and build the application with **Product > Build**.
3. The app expects the `cueit-api`, `cueit-admin`, and `cueit-slack` directories to sit next to the app bundle. When running from Xcode it uses the repository root.
4. On first launch `.env.example` files are copied to `.env` for each service. Edit the resulting files then click **Done**.
5. Use the checkboxes to choose which services to start and click **Start**. The app runs `installers/start-all.sh` and streams the output.
6. Click **Open Admin** to launch the admin web interface in the default browser.

## Command Line

`launch_services.sh` is provided to start the Node services from a terminal without opening the GUI.
