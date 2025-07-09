//
//  KioskHomeView.swift
//  CueIT Kiosk
//
//  Main kiosk home view matching the requirements layout
//

import SwiftUI

struct KioskHomeView: View {
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var connectionManager = ConnectionManager.shared
    @StateObject private var kioskController = KioskController.shared
    @StateObject private var statusManager = StatusManager.shared
    
    @State private var currentTime = Date()
    @State private var showTicketForm = false
    @State private var showSettings = false
    
    // Timer for updating time
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background Image (Brooklyn Bridge style)
                backgroundView
                
                VStack(spacing: 0) {
                    // Header Bar (Room Name + Gear Icon)
                    headerBar
                    
                    // Main content area
                    VStack(spacing: 32) {
                        Spacer()
                        
                        // Notification Card (Time + Message)
                        notificationCard
                        
                        Spacer()
                        
                        // Status Bar (Status + Open Ticket Button)
                        statusBar
                    }
                    .padding(.horizontal, 40)
                    .padding(.bottom, 60)
                }
            }
        }
        .sheet(isPresented: $showTicketForm) {
            TicketFormView()
        }
        .sheet(isPresented: $showSettings) {
            SettingsView()
        }
        .onReceive(timer) { _ in
            currentTime = Date()
        }
        .onAppear {
            statusManager.startMonitoring()
        }
    }
    
    // MARK: - Background View
    private var backgroundView: some View {
        ZStack {
            // Default background gradient
            LinearGradient(
                colors: [
                    Color.black.opacity(0.8),
                    Color.black.opacity(0.4)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            
            // Background image overlay
            if let backgroundURL = configManager.kioskConfiguration?.backgroundURL {
                Image(backgroundURL)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .opacity(0.3)
            } else {
                // Default tech/bridge style pattern
                backgroundPattern
                    .opacity(0.1)
            }
        }
        .ignoresSafeArea()
    }
    
    private var backgroundPattern: some View {
        Canvas { context, size in
            let spacing: CGFloat = 60
            context.stroke(
                Path { path in
                    for x in stride(from: 0, to: size.width, by: spacing) {
                        path.move(to: CGPoint(x: x, y: 0))
                        path.addLine(to: CGPoint(x: x, y: size.height))
                    }
                    for y in stride(from: 0, to: size.height, by: spacing) {
                        path.move(to: CGPoint(x: 0, y: y))
                        path.addLine(to: CGPoint(x: size.width, y: y))
                    }
                },
                with: .color(.white),
                lineWidth: 1
            )
        }
    }
    
    // MARK: - Header Bar
    private var headerBar: some View {
        HStack {
            // Room Title
            Text(roomName)
                .font(.system(size: 32, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
            
            Spacer()
            
            // Settings Gear Icon
            Button(action: {
                showSettings = true
            }) {
                Image(systemName: "gearshape.fill")
                    .font(.system(size: 28, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                    .padding(12)
                    .background(
                        Circle()
                            .fill(Color.white.opacity(0.1))
                    )
            }
        }
        .padding(.horizontal, 40)
        .padding(.top, 20)
        .padding(.bottom, 10)
    }
    
    // MARK: - Notification Card
    private var notificationCard: some View {
        VStack(spacing: 16) {
            // Current Time
            Text(timeFormatter.string(from: currentTime))
                .font(.system(size: 48, weight: .light, design: .rounded))
                .foregroundColor(.white)
            
            // Day and Date
            Text(dateFormatter.string(from: currentTime))
                .font(.system(size: 20, weight: .medium))
                .foregroundColor(.white.opacity(0.8))
            
            // System Message
            Text(notificationMessage)
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(.white.opacity(0.9))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 20)
        }
        .padding(32)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.white.opacity(0.1))
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(.ultraThinMaterial)
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.white.opacity(0.2), lineWidth: 1)
        )
    }
    
    // MARK: - Status Bar
    private var statusBar: some View {
        VStack(spacing: 20) {
            // Status Indicator
            HStack {
                // Status Color Bar
                Rectangle()
                    .fill(statusManager.isAvailable ? Color.green : Color.red)
                    .frame(width: 8)
                    .cornerRadius(4)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(statusManager.isAvailable ? "Available" : "In Use")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text(statusManager.statusDescription)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                }
                
                Spacer()
            }
            .padding(24)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white.opacity(0.1))
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(.ultraThinMaterial)
                    )
            )
            
            // Open Ticket Button
            Button(action: {
                showTicketForm = true
            }) {
                HStack(spacing: 12) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 24, weight: .medium))
                    
                    Text("Open Ticket")
                        .font(.system(size: 20, weight: .semibold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, minHeight: 60)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.blue)
                        .shadow(color: .blue.opacity(0.3), radius: 8, x: 0, y: 4)
                )
            }
            .buttonStyle(PlainButtonStyle())
            .scaleEffect(1.0)
            .animation(.easeInOut(duration: 0.1), value: showTicketForm)
        }
    }
    
    // MARK: - Computed Properties
    private var roomName: String {
        configManager.kioskConfiguration?.displayName ?? "Conference Room"
    }
    
    private var notificationMessage: String {
        if !connectionManager.isConnected {
            return "Operating in offline mode"
        } else if let message = configManager.kioskConfiguration?.messaging.welcomeMessage {
            return message
        } else {
            return "No upcoming meetings"
        }
    }
    
    private var timeFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter
    }
    
    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        return formatter
    }
}

// MARK: - Settings View
struct SettingsView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var statusManager = StatusManager.shared
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var kioskController = KioskController.shared
    
    @State private var showAdminLogin = false
    @State private var isAuthenticated = false
    @State private var tempRoomName = ""
    @State private var tempStatus = RoomStatus.available
    
    enum RoomStatus: String, CaseIterable {
        case available = "Available"
        case inUse = "In Use"
        case maintenance = "Maintenance"
        
        var color: Color {
            switch self {
            case .available: return .green
            case .inUse: return .red
            case .maintenance: return .orange
            }
        }
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if isAuthenticated {
                    adminSettingsContent
                } else {
                    unauthorizedContent
                }
            }
            .navigationTitle("Kiosk Settings")
            .navigationBarTitleDisplayMode(.large)
            .toolbar(content: {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            })
        }
        .sheet(isPresented: $showAdminLogin) {
            AdminLoginView(configService: ConfigService())
        }
        .onAppear {
            tempRoomName = configManager.kioskConfiguration?.displayName ?? ""
            tempStatus = statusManager.isAvailable ? .available : .inUse
        }
    }
    
    private var unauthorizedContent: some View {
        VStack(spacing: 32) {
            Spacer()
            
            VStack(spacing: 16) {
                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 64, weight: .light))
                    .foregroundColor(.secondary)
                
                Text("Admin Access Required")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text("Please authenticate to access kiosk settings")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            
            Button("Admin Login") {
                showAdminLogin = true
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            
            Spacer()
        }
        .padding(40)
    }
    
    private var adminSettingsContent: some View {
        List {
            Section("Status Override") {
                Picker("Room Status", selection: $tempStatus) {
                    ForEach(RoomStatus.allCases, id: \.self) { status in
                        HStack {
                            Circle()
                                .fill(status.color)
                                .frame(width: 12, height: 12)
                            Text(status.rawValue)
                        }
                        .tag(status)
                    }
                }
                .pickerStyle(.segmented)
            }
            
            Section("Room Configuration") {
                HStack {
                    Text("Room Name")
                    Spacer()
                    TextField("Enter room name", text: $tempRoomName)
                        .textFieldStyle(.roundedBorder)
                        .frame(maxWidth: 200)
                }
            }
            
            Section("System") {
                Button("Reset Configuration") {
                    resetConfiguration()
                }
                .foregroundColor(.red)
            }
            
            Section("Information") {
                KioskInfoRow(label: "Version", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "Unknown")
                KioskInfoRow(label: "Build", value: Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "Unknown")
                KioskInfoRow(label: "Connection", value: connectionManager.isConnected ? "Connected" : "Offline")
                KioskInfoRow(label: "Last Updated", value: DateFormatter.localizedString(from: Date(), dateStyle: .short, timeStyle: .short))
            }
        }
        .onChange(of: tempRoomName) { _, newValue in
            saveRoomName(newValue)
        }
        .onChange(of: tempStatus) { _, newValue in
            statusManager.setManualStatus(newValue == .available)
        }
    }
    
    @StateObject private var connectionManager = ConnectionManager.shared
    
    private func saveRoomName(_ name: String) {
        Task {
            await configManager.updateRoomName(name)
        }
    }
    
    private func resetConfiguration() {
        // Reset to initial setup
        UserDefaults.standard.removeObject(forKey: "isSetupComplete")
        kioskController.transitionTo(.setup)
        dismiss()
    }
}

struct KioskInfoRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
            Spacer()
            Text(value)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Preview
struct KioskHomeView_Previews: PreviewProvider {
    static var previews: some View {
        KioskHomeView()
    }
}
