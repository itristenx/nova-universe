# CueIT macOS Launcher (SwiftUI)

This SwiftUI application replaces the old Electron launcher. It copies `.env.example` files for each service on first launch, lets you edit them and then starts the backend and web apps using `start-services.sh`.

## Building

1. Install Xcode 15 or later.
2. Open `CueITLauncher.xcodeproj` or build with `swift build -c release`.
3. Run `../installers/make-installer.sh <version>` to produce `CueIT-<version>.pkg`.

During development you can run `swift run` in this directory to launch the app.
