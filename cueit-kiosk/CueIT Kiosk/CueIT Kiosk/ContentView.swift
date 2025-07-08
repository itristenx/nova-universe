//
//  ContentView.swift
//  CueIT Kiosk
//
//  Main app content view that uses AppCoordinator for state management
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var appCoordinator: AppCoordinator
    @EnvironmentObject private var connectionStatus: ConnectionStatus
    @EnvironmentObject private var notificationManager: NotificationManager
    
    var body: some View {
        LaunchView()
            .onOpenURL { url in
                appCoordinator.handleDeepLink(url: url)
            }
            .sheet(isPresented: $appCoordinator.showServerConfig) {
                ServerConfigView()
            }
            .sheet(isPresented: $appCoordinator.showAdminPanel) {
                EnhancedAdminLoginView(configService: EnhancedConfigService.shared)
            }
            .fullScreenCover(isPresented: $appCoordinator.showFeedbackForm) {
                FeedbackFormView()
            }
    }
}



#Preview {
    ContentView()
        .environmentObject(AppCoordinator.shared)
        .environmentObject(ConnectionStatus())
        .environmentObject(NotificationManager.shared)
}
