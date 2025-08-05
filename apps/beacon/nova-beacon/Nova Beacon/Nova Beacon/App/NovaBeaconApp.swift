//
//  NovaBeaconApp.swift
//  Nova Beacon
//
//  Created by Tristen Neibarger on 7/2/25.
//

import SwiftUI
import Foundation
import UIKit

@main
struct NovaBeaconApp: App {
    @StateObject private var kioskController = KioskController.shared
    
    init() {
        // Apply modern theme
        setupAppearance()
        
        // Note: kioskController.initialize() moved to ContentView.onAppear
        // to avoid accessing @StateObject before SwiftUI initialization
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(kioskController)
                .preferredColorScheme(.light) // Force light mode for kiosk consistency
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
                    Task {
                        await kioskController.handleAppActivation()
                    }
                }
        }
    }
    
    private func setupAppearance() {
        // Configure navigation bar appearance
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor.systemBackground
        appearance.titleTextAttributes = [
            .foregroundColor: UIColor.label,
            .font: UIFont.systemFont(ofSize: 20, weight: .semibold)
        ]
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().compactAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        
        // Configure tab bar appearance if needed
        let tabAppearance = UITabBarAppearance()
        tabAppearance.configureWithOpaqueBackground()
        tabAppearance.backgroundColor = UIColor.systemBackground
        
        UITabBar.appearance().standardAppearance = tabAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabAppearance
    }
}
