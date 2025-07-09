//
//  BottomBar.swift
//  CueIT Kiosk
//
//  Bottom bar with admin access and settings
//

import SwiftUI
import UIKit

struct BottomBar: View {
    @StateObject private var authManager = AuthenticationManager.shared
    @StateObject private var kioskController = KioskController.shared
    @State private var showAdminLogin = false
    @State private var settingsButtonPressed = false
    @State private var adminButtonPressed = false
    
    var body: some View {
        HStack {
            // Left side - Help and info
            HStack(spacing: 20) {
                Button(action: showHelp) {
                    HStack(spacing: 8) {
                        Image(systemName: "questionmark.circle")
                            .font(.system(size: 16, weight: .medium))
                        Text("Help")
                            .font(.system(size: 14, weight: .medium))
                    }
                    .foregroundColor(.secondary)
                }
                .buttonStyle(.plain)
                
                Button(action: showInfo) {
                    HStack(spacing: 8) {
                        Image(systemName: "info.circle")
                            .font(.system(size: 16, weight: .medium))
                        Text("Info")
                            .font(.system(size: 14, weight: .medium))
                    }
                    .foregroundColor(.secondary)
                }
                .buttonStyle(.plain)
            }
            
            Spacer()
            
            // Right side - Admin access
            HStack(spacing: 16) {
                // Settings button (general access)
                Button(action: showSettings) {
                    Image(systemName: "gearshape")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(.secondary)
                        .scaleEffect(settingsButtonPressed ? 0.9 : 1.0)
                }
                .buttonStyle(.plain)
                .scaleEffect(settingsButtonPressed ? 0.9 : 1.0)
                .onLongPressGesture(minimumDuration: 0.1) {
                    // Haptic feedback for long press
                    let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedback.impactOccurred()
                    showAdminLogin = true
                } onPressingChanged: { pressing in
                    withAnimation(.easeInOut(duration: 0.1)) {
                        settingsButtonPressed = pressing
                    }
                }
                
                // Admin indicator (if logged in)
                if authManager.isAdminAuthenticated {
                    Button(action: showAdminPanel) {
                        HStack(spacing: 6) {
                            Image(systemName: "person.badge.key")
                                .font(.system(size: 16, weight: .medium))
                            
                            Text("Admin")
                                .font(.system(size: 12, weight: .semibold))
                        }
                        .foregroundColor(.blue)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.blue.opacity(0.1))
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .background(
            Rectangle()
                .fill(Color(.systemBackground).opacity(0.95))
                .overlay(
                    Rectangle()
                        .fill(Color(.systemGray4))
                        .frame(height: 1),
                    alignment: .top
                )
        )
        .sheet(isPresented: $showAdminLogin) {
            AdminLoginView(configService: ConfigService())
        }
    }
    
    private func showSettings() {
        kioskController.openSettings()
    }
    
    private func showAdminPanel() {
        // Show admin panel if already authenticated
        kioskController.openSettings()
    }
    
    private func showHelp() {
        kioskController.showNotification(message: "For assistance, contact your IT administrator")
    }
    
    private func showInfo() {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        kioskController.showNotification(message: "CueIT Kiosk v\(version)")
    }
}

#Preview {
    BottomBar()
}
