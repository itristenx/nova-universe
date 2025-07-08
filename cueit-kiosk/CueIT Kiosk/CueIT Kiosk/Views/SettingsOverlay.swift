//
//  SettingsOverlay.swift
//  CueIT Kiosk
//
//  Modern settings overlay with admin and server settings
//

import SwiftUI

struct SettingsOverlay: View {
    @StateObject private var kioskController = KioskController.shared
    @StateObject private var authManager = AuthenticationManager.shared
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var connectionManager = ConnectionManager.shared
    
    @State private var selectedTab: SettingsTab = .general
    
    var body: some View {
        ZStack {
            // Background overlay
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture {
                    kioskController.closeSettings()
                }
            
            // Settings panel
            VStack(spacing: 0) {
                // Header
                settingsHeader
                
                // Tab selector
                tabSelector
                
                // Content area
                ScrollView {
                    VStack(spacing: 24) {
                        switch selectedTab {
                        case .general:
                            GeneralSettingsView()
                        case .server:
                            ServerSettingsView()
                        case .admin:
                            if authManager.isAdminAuthenticated {
                                AdminSettingsView()
                            } else {
                                AdminLoginPromptView()
                            }
                        case .diagnostics:
                            if authManager.isAdminAuthenticated {
                                DiagnosticsView()
                            } else {
                                AdminLoginPromptView()
                            }
                        }
                    }
                    .padding(24)
                }
                
                // Footer
                settingsFooter
            }
            .frame(maxWidth: 600, maxHeight: 700)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color(.systemBackground))
                    .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: 10)
            )
        }
    }
    
    // MARK: - Header
    private var settingsHeader: some View {
        HStack {
            Image(systemName: "gearshape.fill")
                .font(.system(size: 24, weight: .medium))
                .foregroundColor(.blue)
            
            VStack(alignment: .leading, spacing: 2) {
                Text("Settings")
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundColor(.primary)
                
                if authManager.isAdminAuthenticated {
                    Text("Admin Access Granted")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.green)
                }
            }
            
            Spacer()
            
            Button(action: { kioskController.closeSettings() }) {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 24, weight: .medium))
                    .foregroundColor(.secondary)
            }
            .buttonStyle(.plain)
        }
        .padding(24)
        .background(
            Rectangle()
                .fill(Color(.systemGray6))
                .overlay(
                    Rectangle()
                        .fill(Color(.systemGray4))
                        .frame(height: 1),
                    alignment: .bottom
                )
        )
    }
    
    // MARK: - Tab Selector
    private var tabSelector: some View {
        HStack(spacing: 0) {
            ForEach(SettingsTab.allCases, id: \.self) { tab in
                Button(action: { selectedTab = tab }) {
                    VStack(spacing: 6) {
                        Image(systemName: tab.icon)
                            .font(.system(size: 16, weight: .medium))
                        
                        Text(tab.title)
                            .font(.system(size: 12, weight: .medium))
                    }
                    .foregroundColor(selectedTab == tab ? .blue : .secondary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        Rectangle()
                            .fill(selectedTab == tab ? Color.blue.opacity(0.1) : Color.clear)
                    )
                }
                .buttonStyle(.plain)
                .disabled(tab.requiresAdmin && !authManager.isAdminAuthenticated)
                .opacity(tab.requiresAdmin && !authManager.isAdminAuthenticated ? 0.5 : 1.0)
            }
        }
        .background(Color(.systemGray6))
    }
    
    // MARK: - Footer
    private var settingsFooter: some View {
        HStack {
            if authManager.isAdminAuthenticated {
                Button(action: authManager.logout) {
                    HStack(spacing: 8) {
                        Image(systemName: "person.badge.minus")
                        Text("Logout Admin")
                    }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.red)
                }
                .buttonStyle(.plain)
            }
            
            Spacer()
            
            Text("CueIT Kiosk v\(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0")")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.secondary)
        }
        .padding(20)
        .background(
            Rectangle()
                .fill(Color(.systemGray6))
                .overlay(
                    Rectangle()
                        .fill(Color(.systemGray4))
                        .frame(height: 1),
                    alignment: .top
                )
        )
    }
}

// MARK: - Settings Tab
enum SettingsTab: CaseIterable {
    case general
    case server
    case admin
    case diagnostics
    
    var title: String {
        switch self {
        case .general: return "General"
        case .server: return "Server"
        case .admin: return "Admin"
        case .diagnostics: return "Diagnostics"
        }
    }
    
    var icon: String {
        switch self {
        case .general: return "slider.horizontal.3"
        case .server: return "server.rack"
        case .admin: return "person.badge.key"
        case .diagnostics: return "stethoscope"
        }
    }
    
    var requiresAdmin: Bool {
        switch self {
        case .general, .server: return false
        case .admin, .diagnostics: return true
        }
    }
}

// MARK: - Settings Views
struct GeneralSettingsView: View {
    @StateObject private var configManager = ConfigurationManager.shared
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            SettingsSection(title: "Kiosk Information") {
                SettingsRow(label: "Kiosk ID", value: configManager.getKioskId())
                SettingsRow(label: "Status", value: configManager.isActivated ? "Active" : "Inactive")
                if let config = configManager.kioskConfiguration {
                    SettingsRow(label: "Display Name", value: config.displayName)
                    if let location = config.location {
                        SettingsRow(label: "Location", value: location)
                    }
                }
            }
            
            SettingsSection(title: "Display Settings") {
                VStack(alignment: .leading, spacing: 12) {
                    Toggle("Show Clock", isOn: .constant(configManager.kioskConfiguration?.features.showClock ?? true))
                        .disabled(true)
                    
                    Toggle("Show Calendar", isOn: .constant(configManager.kioskConfiguration?.features.showCalendar ?? true))
                        .disabled(true)
                    
                    Toggle("Enable Feedback", isOn: .constant(configManager.kioskConfiguration?.features.enableFeedback ?? true))
                        .disabled(true)
                }
                
                Text("Display settings are managed by your administrator")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct ServerSettingsView: View {
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var connectionManager = ConnectionManager.shared
    @State private var showServerSetup = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            SettingsSection(title: "Current Server") {
                if let serverConfig = configManager.serverConfiguration {
                    SettingsRow(label: "Server Name", value: serverConfig.name)
                    SettingsRow(label: "URL", value: serverConfig.baseURL)
                    SettingsRow(label: "Connection", value: connectionManager.serverReachable ? "Connected" : "Disconnected")
                    SettingsRow(label: "Last Tested", value: serverConfig.lastTested.formatted(.relative(presentation: .named)))
                } else {
                    Text("No server configured")
                        .foregroundColor(.secondary)
                }
            }
            
            SettingsSection(title: "Server Actions") {
                VStack(spacing: 12) {
                    Button(action: testConnection) {
                        HStack {
                            Image(systemName: "network")
                            Text("Test Connection")
                        }
                        .font(.system(size: 16, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.blue.opacity(0.1))
                        )
                    }
                    .buttonStyle(.plain)
                    
                    Button(action: { showServerSetup = true }) {
                        HStack {
                            Image(systemName: "server.rack")
                            Text("Change Server")
                        }
                        .font(.system(size: 16, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.orange.opacity(0.1))
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .sheet(isPresented: $showServerSetup) {
            ServerSetupView()
        }
    }
    
    private func testConnection() {
        Task {
            await connectionManager.testConnection()
        }
    }
}

struct AdminSettingsView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            SettingsSection(title: "Admin Actions") {
                VStack(spacing: 12) {
                    AdminActionButton(
                        title: "Refresh Configuration",
                        subtitle: "Update kiosk settings from server",
                        icon: "arrow.clockwise",
                        color: .blue
                    ) {
                        Task {
                            await ConfigurationManager.shared.refreshConfiguration()
                        }
                    }
                    
                    AdminActionButton(
                        title: "Clear Cache",
                        subtitle: "Clear stored configuration data",
                        icon: "trash",
                        color: .orange
                    ) {
                        // Implement cache clearing
                    }
                    
                    AdminActionButton(
                        title: "Restart Kiosk",
                        subtitle: "Restart the kiosk application",
                        icon: "arrow.clockwise.circle",
                        color: .red
                    ) {
                        // Implement restart functionality
                    }
                }
            }
        }
    }
}

struct DiagnosticsView: View {
    @StateObject private var connectionManager = ConnectionManager.shared
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            SettingsSection(title: "Connection History") {
                VStack(spacing: 8) {
                    ForEach(connectionManager.connectionHistory.suffix(5).reversed(), id: \.id) { event in
                        HStack {
                            Image(systemName: event.type.systemImage)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(event.type.color)
                            
                            Text(event.details)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.primary)
                            
                            Spacer()
                            
                            Text(event.timestamp.formatted(.dateTime.hour().minute()))
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(.secondary)
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            
            SettingsSection(title: "System Information") {
                SettingsRow(label: "iOS Version", value: UIDevice.current.systemVersion)
                SettingsRow(label: "Device Model", value: UIDevice.current.model)
                SettingsRow(label: "App Version", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "Unknown")
                SettingsRow(label: "Build", value: Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "Unknown")
            }
        }
    }
}

struct AdminLoginPromptView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "lock.shield")
                .font(.system(size: 48, weight: .light))
                .foregroundColor(.secondary)
            
            Text("Admin Access Required")
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(.primary)
            
            Text("This section requires administrator authentication. Please contact your IT administrator for access.")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(40)
    }
}

// MARK: - Helper Views
struct SettingsSection<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.primary)
            
            content
        }
    }
}

struct SettingsRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(value)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.primary)
        }
        .padding(.vertical, 2)
    }
}

struct AdminActionButton: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(color)
                    .frame(width: 20)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.primary)
                    
                    Text(subtitle)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "arrow.right")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(color.opacity(0.1))
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    SettingsOverlay()
}
