import SwiftUI
import AppKit

@main
struct CueITApp: App {
    @StateObject private var launcher = LauncherViewModel()
    var body: some Scene {
        WindowGroup {
            if launcher.showSetup {
                SetupView(launcher: launcher)
            } else {
                ContentView(launcher: launcher)
            }
        }
    }
}
