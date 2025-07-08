//
//  ContentView.swift
//  CueIT Kiosk
//
//  Modern Conference Room Kiosk - Complete Rebuild
//  Inspired by Zoom/Microsoft conference room scheduling tablets
//

import SwiftUI

struct ContentView: View {
    @StateObject private var kioskController = KioskController.shared
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var connectionManager = ConnectionManager.shared
    
    var body: some View {
        ZStack {
            // Main kiosk interface
            switch kioskController.currentState {
            case .initializing:
                InitializationView()
            case .serverSetup:
                ServerSetupView()
            case .activation:
                ActivationModeView()
            case .ready:
                MainKioskInterface()
            case .error(let message):
                ErrorStateView(message: message)
            case .maintenance:
                MaintenanceView()
            }
            
            // Global overlays
            if kioskController.showSettings {
                SettingsOverlay()
                    .transition(.opacity)
            }
            
            if kioskController.showNotification {
                NotificationOverlay()
                    .transition(.move(edge: .top))
            }
        }
        .animation(.easeInOut(duration: 0.3), value: kioskController.currentState)
        .animation(.easeInOut(duration: 0.2), value: kioskController.showSettings)
        .animation(.spring(response: 0.5, dampingFraction: 0.8), value: kioskController.showNotification)
        .onAppear {
            kioskController.initialize()
        }
        .task {
            await connectionManager.startMonitoring()
        }
    }
}



#Preview {
    ContentView()
        .environmentObject(AppCoordinator.shared)
        .environmentObject(ConnectionStatus())
        .environmentObject(NotificationManager.shared)
}
