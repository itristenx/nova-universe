//
//  ContentView.swift
//  CueIT Kiosk
//
//  Modern Conference Room Kiosk - Complete Rebuild
//  Inspired by Zoom/Microsoft conference room scheduling tablets
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var kioskController: KioskController
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var connectionManager = ConnectionManager.shared
    
    @State private var isSetupComplete = UserDefaults.standard.bool(forKey: "isSetupComplete")
    
    var body: some View {
        ZStack {
            // Check if kiosk is deactivated first
            if configManager.isDeactivated {
                DeactivationView()
            }
            // Show activation wizard if setup is not complete
            else if !isSetupComplete {
                ActivationWizard()
                    .onReceive(NotificationCenter.default.publisher(for: UserDefaults.didChangeNotification)) { _ in
                        isSetupComplete = UserDefaults.standard.bool(forKey: "isSetupComplete")
                    }
            } else {
                // Main kiosk interface
                switch kioskController.currentState {
                case .initializing:
                    InitializationView()
                case .setup:
                    ServerSetupView()
                case .activated:
                    KioskHomeView()
                case .deactivated:
                    DeactivationView()
                case .error(let message):
                    ErrorStateView(
                        error: NSError(domain: "CueITKiosk", code: 0, userInfo: [NSLocalizedDescriptionKey: message]),
                    retryAction: {
                        kioskController.initialize()
                    }
                )
                case .maintenance:
                    MaintenanceView(
                        message: "Kiosk is currently under maintenance",
                        estimatedDuration: "15 minutes",
                        contactInfo: "Please contact IT support for assistance"
                    )
                }
                
                // Global overlays
                if kioskController.showSettings {
                    SettingsOverlay()
                        .transition(.opacity)
                }
                
                if kioskController.showNotification {
                    NotificationOverlay(
                        notification: KioskNotification(
                            type: .info,
                            title: "System Notification",
                            message: kioskController.notificationMessage
                        ),
                        onDismiss: {
                            kioskController.hideNotification()
                        }
                    )
                        .transition(.move(edge: .top))
                }
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
