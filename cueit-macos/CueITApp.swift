import SwiftUI
import AppKit

@main
struct CueITApp: App {
    @StateObject private var appModel = CueITAppModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appModel)
                .frame(minWidth: 1000, minHeight: 700)
        }
        .windowStyle(DefaultWindowStyle())
        .commands {
            SidebarCommands()
        }
    }
}
