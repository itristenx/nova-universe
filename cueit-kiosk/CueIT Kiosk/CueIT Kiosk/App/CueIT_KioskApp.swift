//
//  CueIT_KioskApp.swift
//  CueIT Kiosk
//
//  Created by Tristen Neibarger on 7/2/25.
//

import SwiftUI
import Foundation

@main
struct CueITKioskApp: App {
    @StateObject private var appCoordinator = AppCoordinator.shared
    @StateObject private var connectionStatus = ConnectionStatus()
    @StateObject private var notificationManager = NotificationManager.shared
    
    init() {
        // Apply modern theme
        setupAppearance()
        
        // Register kiosk version
        Task {
            await KioskService.shared.register(version: Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appCoordinator)
                .environmentObject(connectionStatus)
                .environmentObject(notificationManager)
                .preferredColorScheme(.light) // Force light mode for kiosk consistency
        }
    }
    
    private func setupAppearance() {
        // Configure navigation bar appearance
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(Theme.Colors.surface)
        appearance.titleTextAttributes = [
            .foregroundColor: UIColor(Theme.Colors.text),
            .font: Theme.Typography.headline.font
        ]
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().compactAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        
        // Configure tab bar appearance if needed
        let tabAppearance = UITabBarAppearance()
        tabAppearance.configureWithOpaqueBackground()
        tabAppearance.backgroundColor = UIColor(Theme.Colors.surface)
        
        UITabBar.appearance().standardAppearance = tabAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabAppearance
    }
}
