//
//  LaunchView.swift
//  CueIT Kiosk
//
//  Created by Tristen Neibarger on 7/2/25.
//

import SwiftUI

struct LaunchView: View {
    @StateObject private var kioskService = KioskService.shared
    @StateObject private var configService = EnhancedConfigService.shared
    @StateObject private var statusService = StatusService.shared
    @StateObject private var connectionStatus = ConnectionStatus()
    @StateObject private var notificationManager = NotificationManager.shared
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [
                    Theme.Colors.primary.opacity(0.1),
                    Theme.Colors.secondary.opacity(0.05),
                    Theme.Colors.background
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Main content based on kiosk state
            Group {
                switch kioskService.state {
                case .checking:
                    ModernLoadingView()
                case .needsServerConfig:
                    ModernServerConfigView()
                case .waitingForActivation:
                    ModernActivationView()
                case .active:
                    WallMountKioskView(
                        configService: configService,
                        statusService: statusService
                    )
                case .inactive, .error:
                    ModernErrorView()
                }
            }
            .animation(.easeInOut(duration: 0.3), value: kioskService.state)
            
            // Status indicator bar
            VStack {
                StatusIndicatorBar(connectionStatus: connectionStatus)
                    .zIndex(100)
                Spacer()
            }
            
            // Notification overlay
            NotificationContainer()
                .zIndex(200)
        }
        .onAppear {
            // Set up connection monitoring
            connectionStatus.setServerInfo(url: APIConfig.baseURL, kioskId: kioskService.id)
            
            // Monitor kiosk service state for connection status
            Task {
                await kioskService.checkActive()
                
                // Update connection status based on kiosk state
                switch kioskService.state {
                case .active, .waitingForActivation:
                    connectionStatus.updateStatus(.connected)
                case .checking:
                    connectionStatus.updateStatus(.connecting)
                case .error:
                    connectionStatus.updateStatus(.error, errorMessage: kioskService.statusMessage)
                default:
                    connectionStatus.updateStatus(.disconnected)
                }
            }
        }
        .onChange(of: kioskService.state) { newState in
            // Update connection status when kiosk state changes
            switch newState {
            case .active, .waitingForActivation:
                connectionStatus.updateStatus(.connected)
            case .checking:
                connectionStatus.updateStatus(.connecting)
            case .error:
                connectionStatus.updateStatus(.error, errorMessage: kioskService.statusMessage)
                notificationManager.showError(
                    title: "Connection Error",
                    message: kioskService.statusMessage,
                    action: NotificationAction(title: "Retry") {
                        Task {
                            await kioskService.checkActive()
                        }
                    }
                )
            case .needsServerConfig:
                connectionStatus.updateStatus(.disconnected, errorMessage: "Server not configured")
            default:
                connectionStatus.updateStatus(.disconnected)
            }
        }
    }
}

// MARK: - Modern Loading View Component
struct ModernLoadingView: View {
    @StateObject private var kioskService = KioskService.shared
    
    var body: some View {
        VStack(spacing: Theme.Spacing.xl) {
            Spacer()
            
            // Animated logo
            VStack(spacing: Theme.Spacing.lg) {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Theme.Colors.primary)
                    .frame(width: 80, height: 80)
                    .overlay(
                        Image(systemName: "display")
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(.white)
                    )
                    .scaleEffect(1.0)
                    .animation(
                        .easeInOut(duration: 1.5).repeatForever(autoreverses: true),
                        value: Date().timeIntervalSince1970
                    )
                
                Text("CueIT Kiosk")
                    .font(Theme.Typography.title)
                    .foregroundColor(Theme.Colors.text)
                
                Text("Initializing...")
                    .font(Theme.Typography.body)
                    .foregroundColor(Theme.Colors.textSecondary)
            }
            
            // Loading indicator with status
            VStack(spacing: Theme.Spacing.md) {
                ProgressView()
                    .scaleEffect(1.5)
                    .tint(Theme.Colors.primary)
                
                if !kioskService.statusMessage.isEmpty {
                    Text(kioskService.statusMessage)
                        .font(Theme.Typography.caption)
                        .foregroundColor(Theme.Colors.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, Theme.Spacing.lg)
                }
            }
            
            Spacer()
            
            // Kiosk ID for troubleshooting
            VStack(spacing: Theme.Spacing.xs) {
                Text("Kiosk ID")
                    .font(Theme.Typography.caption)
                    .foregroundColor(Theme.Colors.textSecondary)
                
                Text(kioskService.id)
                    .font(Theme.Typography.caption.monospaced())
                    .foregroundColor(Theme.Colors.textSecondary)
                    .padding(.horizontal, Theme.Spacing.sm)
                    .padding(.vertical, Theme.Spacing.xs)
                    .background(Theme.Colors.surfaceSecondary)
                    .clipShape(RoundedRectangle(cornerRadius: 6))
            }
            .padding(.bottom, Theme.Spacing.lg)
        }
        .padding(Theme.Spacing.lg)
    }
}

// MARK: - Modern Server Config View
struct ModernServerConfigView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var kioskService = KioskService.shared
    @State private var serverURL = ""
    @State private var isConfiguring = false
    
    private let commonServers = [
        ("Local Development", "http://localhost:3000"),
        ("Local Network", "http://127.0.0.1:3000"),
        ("Production Server", "https://api.cueit.example.com")
    ]
    
    var body: some View {
        NavigationView {
            ModernCard {
                VStack(spacing: Theme.Spacing.xl) {
                    // Header
                    VStack(spacing: Theme.Spacing.md) {
                        Image(systemName: "server.rack")
                            .font(.system(size: 48))
                            .foregroundColor(Theme.Colors.primary)
                        
                        Text("Server Configuration")
                            .font(Theme.Typography.title)
                            .foregroundColor(Theme.Colors.text)
                        
                        Text("Configure the server URL for this kiosk")
                            .font(Theme.Typography.body)
                            .foregroundColor(Theme.Colors.textSecondary)
                            .multilineTextAlignment(.center)
                    }
                    
                    // Server URL input
                    VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                        Text("Server URL")
                            .font(Theme.Typography.bodyBold)
                            .foregroundColor(Theme.Colors.text)
                        
                        TextField("https://api.cueit.example.com", text: $serverURL)
                            .textFieldStyle(.roundedBorder)
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                            .keyboardType(.URL)
                    }
                    
                    // Action buttons
                    VStack(spacing: Theme.Spacing.md) {
                        ModernButton(
                            title: "Configure Server",
                            style: .primary,
                            isLoading: isConfiguring,
                            action: configureServer
                        )
                        .disabled(serverURL.isEmpty)
                    }
                }
                .padding(Theme.Spacing.xl)
            }
            .padding(Theme.Spacing.lg)
            .navigationBarHidden(true)
        }
        .onAppear {
            serverURL = APIConfig.baseURL
        }
    }
    
    private func configureServer() {
        guard !serverURL.isEmpty else { return }
        
        isConfiguring = true
        kioskService.configureServer(serverURL)
        UserDefaults.standard.set(serverURL, forKey: "serverURL")
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            isConfiguring = false
        }
    }
}

// MARK: - Modern Activation View
struct ModernActivationView: View {
    @StateObject private var kioskService = KioskService.shared
    @State private var showingQRScanner = false
    @State private var showingManualEntry = false
    @State private var activationCode = ""
    @State private var isActivating = false
    
    var body: some View {
        VStack(spacing: Theme.Spacing.xl) {
            // Header
            VStack(spacing: Theme.Spacing.lg) {
                Image(systemName: "qrcode.viewfinder")
                    .font(.system(size: 64))
                    .foregroundColor(Theme.Colors.primary)
                
                Text("Activate Kiosk")
                    .font(Theme.Typography.title)
                    .foregroundColor(Theme.Colors.text)
                
                Text("Contact your administrator to activate this kiosk")
                    .font(Theme.Typography.body)
                    .foregroundColor(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
            }
            
            // Status message
            if !kioskService.statusMessage.isEmpty {
                ModernCard {
                    HStack(spacing: Theme.Spacing.md) {
                        Image(systemName: kioskService.activationError ? "exclamationmark.triangle.fill" : "info.circle.fill")
                            .foregroundColor(kioskService.activationError ? Theme.Colors.error : Theme.Colors.primary)
                        
                        Text(kioskService.statusMessage)
                            .font(Theme.Typography.body)
                            .foregroundColor(Theme.Colors.text)
                        
                        Spacer()
                    }
                    .padding(Theme.Spacing.lg)
                }
            }
            
            // Kiosk information
            ModernCard(shadow: false) {
                VStack(spacing: Theme.Spacing.md) {
                    Text("Kiosk Information")
                        .font(Theme.Typography.bodyBold)
                        .foregroundColor(Theme.Colors.text)
                    
                    VStack(spacing: Theme.Spacing.sm) {
                        HStack {
                            Text("Kiosk ID:")
                                .font(Theme.Typography.caption)
                                .foregroundColor(Theme.Colors.textSecondary)
                            Spacer()
                            Text(kioskService.id)
                                .font(Theme.Typography.caption.monospaced())
                                .foregroundColor(Theme.Colors.text)
                        }
                        
                        HStack {
                            Text("Server:")
                                .font(Theme.Typography.caption)
                                .foregroundColor(Theme.Colors.textSecondary)
                            Spacer()
                            Text(APIConfig.baseURL)
                                .font(Theme.Typography.caption)
                                .foregroundColor(Theme.Colors.text)
                                .lineLimit(1)
                                .truncationMode(.middle)
                        }
                    }
                }
                .padding(Theme.Spacing.lg)
            }
            
            Spacer()
        }
        .padding(Theme.Spacing.lg)
    }
}

// MARK: - Modern Error View
struct ModernErrorView: View {
    @StateObject private var kioskService = KioskService.shared
    
    var body: some View {
        VStack(spacing: Theme.Spacing.xl) {
            Spacer()
            
            // Error icon and message
            VStack(spacing: Theme.Spacing.lg) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 64))
                    .foregroundColor(Theme.Colors.error)
                
                Text("Connection Error")
                    .font(Theme.Typography.title)
                    .foregroundColor(Theme.Colors.text)
                
                Text(kioskService.statusMessage.isEmpty ? "Unable to connect to server" : kioskService.statusMessage)
                    .font(Theme.Typography.body)
                    .foregroundColor(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Theme.Spacing.lg)
            }
            
            // Action buttons
            VStack(spacing: Theme.Spacing.md) {
                ModernButton(
                    title: "Retry Connection",
                    style: .primary,
                    icon: "arrow.clockwise",
                    action: {
                        Task {
                            await kioskService.checkActive()
                        }
                    }
                )
            }
            .padding(.horizontal, Theme.Spacing.xl)
            
            Spacer()
        }
    }
}

#Preview {
    LaunchView()
}
