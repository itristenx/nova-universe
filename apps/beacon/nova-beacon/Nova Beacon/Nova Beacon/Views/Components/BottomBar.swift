//
//  BottomBar.swift
//  Nova Beacon
//
//  Bottom bar with admin access and settings
//

import SwiftUI
import UIKit

struct BottomBar: View {
    @StateObject private var authManager = AuthenticationManager.shared
    @StateObject private var kioskController = KioskController.shared
    @ObservedObject private var connectionStatus = AppCoordinator.shared.connectionStatus
    @StateObject private var configManager = ConfigurationManager.shared
    @State private var showAdminLogin = false
    @State private var settingsButtonPressed = false
    @State private var currentTime = Date()
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        HStack(alignment: .center) {
            // Left: Compact status indicator
            CompactStatusIndicator(connectionStatus: connectionStatus)

            Spacer()

            // Center: Room name and current time (Zoom-style)
            HStack(spacing: 16) {
                if !configManager.currentRoomName.isEmpty {
                    Text(configManager.currentRoomName)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.primary)
                }
                Divider().frame(height: 16)
                Text(currentTime.formatted(.dateTime.hour().minute()))
                    .font(.system(size: 16, weight: .semibold, design: .rounded))
                    .foregroundColor(.primary)
            }

            Spacer()

            // Right: Settings and Admin access
            HStack(spacing: 12) {
                Button(action: showSettings) {
                    Image(systemName: "gearshape")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(.secondary)
                        .scaleEffect(settingsButtonPressed ? 0.9 : 1.0)
                }
                .buttonStyle(.plain)
                .scaleEffect(settingsButtonPressed ? 0.9 : 1.0)
                .onLongPressGesture(minimumDuration: 0.15) {
                    let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedback.impactOccurred()
                    showAdminLogin = true
                } onPressingChanged: { pressing in
                    withAnimation(.easeInOut(duration: 0.1)) {
                        settingsButtonPressed = pressing
                    }
                }

                if authManager.isAdminAuthenticated {
                    Button(action: showAdminPanel) {
                        HStack(spacing: 6) {
                            Image(systemName: "person.badge.key")
                                .font(.system(size: 16, weight: .medium))
                            Text("Admin")
                                .font(.system(size: 12, weight: .semibold))
                        }
                        .foregroundColor(.blue)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(
                            Capsule().fill(Color.blue.opacity(0.12))
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(
            Rectangle()
                .fill(Color(UIColor.systemBackground).opacity(0.95))
                .overlay(
                    Rectangle()
                        .fill(Color(UIColor.systemGray4))
                        .frame(height: 1),
                    alignment: .top
                )
        )
        .onReceive(timer) { _ in
            currentTime = Date()
        }
        .sheet(isPresented: $showAdminLogin) {
            EnhancedAdminLoginView(configService: EnhancedConfigService.shared)
        }
    }

    private func showSettings() {
        kioskController.openSettings()
    }

    private func showAdminPanel() {
        kioskController.openSettings()
    }
}

#Preview {
    BottomBar()
}
