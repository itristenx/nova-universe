import SwiftUI

@main
struct CueITLauncherApp: App {
    @StateObject private var model = LauncherModel()

    var body: some Scene {
        WindowGroup {
            if model.setupNeeded {
                SetupView(model: model)
            } else {
                ContentView(model: model)
            }
        }
    }
}
