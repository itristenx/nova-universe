//
//  TestView.swift
//  CueIT Kiosk
//
//  Test view to verify modern components work correctly
//

import SwiftUI

struct TestView: View {
    @StateObject private var connectionStatus = ConnectionStatus()
    @StateObject private var notificationManager = NotificationManager.shared
    @State private var showingCard = true
    
    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            // Test Theme Colors and Typography
            VStack(spacing: Theme.Spacing.md) {
                Text("CueIT Kiosk Modern Design")
                    .font(Theme.Typography.title)
                    .foregroundColor(Theme.Colors.text)
                
                Text("Testing modern components and theme system")
                    .font(Theme.Typography.body)
                    .foregroundColor(Theme.Colors.textSecondary)
            }
            
            // Test ModernCard
            if showingCard {
                ModernCard {
                    VStack(spacing: Theme.Spacing.md) {
                        Text("Modern Card Component")
                            .font(Theme.Typography.headline)
                            .foregroundColor(Theme.Colors.text)
                        
                        Text("This card demonstrates the modern design system with proper spacing, colors, and typography.")
                            .font(Theme.Typography.body)
                            .foregroundColor(Theme.Colors.textSecondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(Theme.Spacing.lg)
                }
            }
            
            // Test ModernButton styles
            VStack(spacing: Theme.Spacing.md) {
                ModernButton(
                    title: "Primary Button",
                    style: .primary,
                    action: {
                        notificationManager.showSuccess(
                            title: "Primary Action",
                            message: "Primary button was tapped"
                        )
                    },
                    icon: "checkmark.circle.fill"
                )
                
                ModernButton(
                    title: "Secondary Button",
                    style: .secondary,
                    action: {
                        notificationManager.showInfo(
                            title: "Secondary Action",
                            message: "Secondary button was tapped"
                        )
                    }
                )
                
                ModernButton(
                    title: "Test Error",
                    style: .tertiary,
                    action: {
                        notificationManager.showError(
                            title: "Test Error",
                            message: "This is a test error notification",
                            action: NotificationAction(title: "Retry") {
                                print("Retry action tapped")
                            }
                        )
                    }
                )
            }
            
            // Test connection status
            VStack(spacing: Theme.Spacing.sm) {
                Text("Connection Status Test")
                    .font(Theme.Typography.bodyBold)
                
                HStack(spacing: Theme.Spacing.md) {
                    Button("Connected") {
                        connectionStatus.updateStatus(.connected)
                    }
                    .buttonStyle(.bordered)
                    
                    Button("Connecting") {
                        connectionStatus.updateStatus(.connecting)
                    }
                    .buttonStyle(.bordered)
                    
                    Button("Error") {
                        connectionStatus.updateStatus(.error, errorMessage: "Test error message")
                    }
                    .buttonStyle(.bordered)
                }
            }
            
            Spacer()
        }
        .padding(Theme.Spacing.lg)
        .background(Theme.Colors.background)
        .overlay(
            // Test StatusIndicatorBar
            VStack {
                StatusIndicatorBar(connectionStatus: connectionStatus)
                Spacer()
            }
        )
        .overlay(
            // Test NotificationSystem
            NotificationContainer()
        )
        .onAppear {
            // Set initial connection status
            connectionStatus.setServerInfo(url: "http://localhost:3000/api/v1", kioskId: "test-kiosk")
            connectionStatus.updateStatus(.connected)
        }
    }
}

#Preview {
    TestView()
}
