//
//  WallMountKioskView.swift
//  CueIT Kiosk
//
//  User-friendly kiosk interface optimized for wall mounting and conference room use
//

import SwiftUI

struct WallMountKioskView: View {
    @ObservedObject var configService: EnhancedConfigService
    @ObservedObject var statusService: StatusService
    @State private var showingTicketForm = false
    @State private var showingDirectoryForm = false
    @State private var showingAdminLogin = false
    @State private var currentTime = Date()
    @State private var showingOfflineAlert = false
    
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background
                backgroundView
                
                // Main Content
                VStack(spacing: 0) {
                    // Header with status and time
                    headerView(screenWidth: geometry.size.width)
                    
                    Spacer()
                    
                    // Welcome message and main content
                    mainContentView(screenSize: geometry.size)
                    
                    Spacer()
                    
                    // Bottom action buttons
                    actionButtonsView(screenWidth: geometry.size.width)
                    
                    // Status bar
                    statusBarView
                }
                .padding(.horizontal, 40)
                .padding(.vertical, 30)
                
                // Offline overlay
                if !configService.isOnline() {
                    offlineOverlay
                }
            }
        }
        .onReceive(timer) { _ in
            currentTime = Date()
        }
        .onAppear {
            startPeriodicChecks()
        }
        .sheet(isPresented: $showingTicketForm) {
            TicketFormView()
        }
        .sheet(isPresented: $showingDirectoryForm) {
            Text("Directory Search - Coming Soon")
                .foregroundColor(.gray)
                .padding()
        }
        .sheet(isPresented: $showingAdminLogin) {
            EnhancedAdminLoginView(configService: configService)
        }
        .alert("Offline Mode", isPresented: $showingOfflineAlert) {
            Button("OK") { showingOfflineAlert = false }
        } message: {
            Text("The kiosk is currently offline. Some features may be limited.")
        }
    }
    
    // MARK: - Background View
    
    private var backgroundView: some View {
        Group {
            if let backgroundUrl = configService.localConfig?.backgroundUrl,
               !backgroundUrl.isEmpty {
                AsyncImage(url: URL(string: backgroundUrl)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    defaultBackground
                }
            } else {
                defaultBackground
            }
        }
        .ignoresSafeArea()
    }
    
    private var defaultBackground: some View {
        LinearGradient(
            colors: [
                Theme.Colors.primary.opacity(0.1),
                Theme.Colors.secondary.opacity(0.05),
                Theme.Colors.background
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
    
    // MARK: - Header View
    
    private func headerView(screenWidth: CGFloat) -> some View {
        HStack {
            // Logo and title
            HStack(spacing: 20) {
                if let logoUrl = configService.localConfig?.logoUrl {
                    AsyncImage(url: URL(string: logoUrl)) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                    } placeholder: {
                        Image(systemName: "building.2")
                            .foregroundColor(.blue)
                    }
                    .frame(width: 60, height: 60)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("IT Support Kiosk")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    if !configService.isOnline() {
                        Text("Offline Mode")
                            .font(.headline)
                            .foregroundColor(.orange)
                    }
                }
            }
            
            Spacer()
            
            // Current time and status
            VStack(alignment: .trailing, spacing: 8) {
                Text(currentTime, style: .time)
                    .font(.title2)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                Text(currentTime, style: .date)
                    .font(.headline)
                    .foregroundColor(.secondary)
                
                // Current status indicator
                currentStatusIndicator
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.regularMaterial)
                .shadow(radius: 8)
        )
    }
    
    private var currentStatusIndicator: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(statusColor)
                .frame(width: 12, height: 12)
            
            Text(statusText)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.primary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(
            Capsule()
                .fill(statusColor.opacity(0.1))
        )
    }
    
    private var statusColor: Color {
        guard let config = configService.localConfig else { return .gray }
        
        switch config.currentStatus.lowercased() {
        case "open", "available":
            return .green
        case "closed", "unavailable":
            return .red
        case "busy", "in meeting":
            return .orange
        default:
            return .gray
        }
    }
    
    private var statusText: String {
        configService.localConfig?.currentStatus.capitalized ?? "Unknown"
    }
    
    // MARK: - Main Content View
    
    private func mainContentView(screenSize: CGSize) -> some View {
        VStack(spacing: 40) {
            // Welcome message
            VStack(spacing: 16) {
                Text(configService.localConfig?.welcomeMessage ?? "Welcome to IT Support")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .multilineTextAlignment(.center)
                    .foregroundColor(.primary)
                
                if let config = configService.localConfig {
                    Group {
                        switch config.currentStatus.lowercased() {
                        case "open", "available":
                            Text(config.openMsg)
                                .font(.title2)
                                .foregroundColor(.green)
                        case "closed", "unavailable":
                            Text(config.closedMsg)
                                .font(.title2)
                                .foregroundColor(.red)
                        default:
                            Text(config.helpMessage)
                                .font(.title2)
                                .foregroundColor(.secondary)
                        }
                    }
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
                }
            }
            
            // Office hours (if configured)
            if let officeHours = configService.localConfig?.officeHours,
               officeHours.enabled {
                officeHoursView(officeHours)
            }
        }
        .frame(maxWidth: screenSize.width * 0.8)
    }
    
    private func officeHoursView(_ officeHours: OfficeHoursConfig) -> some View {
        VStack(spacing: 16) {
            Text(officeHours.title)
                .font(.title)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            // Today's hours
            if let todayHours = getTodaysHours(officeHours.schedule) {
                if todayHours.enabled && !todayHours.slots.isEmpty {
                    Text("Today: \(formatTimeSlots(todayHours.slots))")
                        .font(.headline)
                        .foregroundColor(.secondary)
                } else {
                    Text("Closed Today")
                        .font(.headline)
                        .foregroundColor(.red)
                }
            }
            
            // Next open time (if configured)
            if officeHours.showNextOpen,
               let nextOpen = getNextOpenTime(officeHours.schedule) {
                Text("Next open: \(nextOpen)")
                    .font(.subheadline)
                    .foregroundColor(.blue)
            }
        }
        .padding(24)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.regularMaterial)
                .shadow(radius: 4)
        )
    }
    
    // MARK: - Action Buttons
    
    private func actionButtonsView(screenWidth: CGFloat) -> some View {
        HStack(spacing: 30) {
            // Submit Ticket Button
            ActionButton(
                title: "Submit Ticket",
                icon: "plus.circle.fill",
                color: .blue,
                isEnabled: configService.canPerformOperations()
            ) {
                if configService.canPerformOperations() {
                    showingTicketForm = true
                } else {
                    showActivationAlert()
                }
            }
            
            // Directory Search Button
            ActionButton(
                title: "Find Person",
                icon: "person.2.fill",
                color: .green,
                isEnabled: configService.canPerformOperations()
            ) {
                if configService.canPerformOperations() {
                    showingDirectoryForm = true
                } else {
                    showActivationAlert()
                }
            }
            
            // Help Button
            ActionButton(
                title: "Get Help",
                icon: "questionmark.circle.fill",
                color: .orange,
                isEnabled: true
            ) {
                showHelpOptions()
            }
        }
    }
    
    // MARK: - Status Bar
    
    private var statusBarView: some View {
        HStack {
            // Activation status
            HStack(spacing: 8) {
                Image(systemName: activationStatusIcon)
                    .foregroundColor(activationStatusColor)
                
                Text(configService.getActivationMessage())
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // Admin button (hidden, activated by long press)
            Button(action: {
                showingAdminLogin = true
            }) {
                Image(systemName: "gearshape.fill")
                    .foregroundColor(.gray.opacity(0.3))
                    .font(.caption2)
            }
            .buttonStyle(.plain)
            .onLongPressGesture(minimumDuration: 3.0) {
                showingAdminLogin = true
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(.regularMaterial)
    }
    
    private var activationStatusIcon: String {
        switch configService.activationState {
        case .activated:
            return "checkmark.circle.fill"
        case .revoked, .expired:
            return "xmark.circle.fill"
        case .activating:
            return "clock.circle.fill"
        case .notActivated, .error:
            return "exclamationmark.triangle.fill"
        }
    }
    
    private var activationStatusColor: Color {
        switch configService.activationState {
        case .activated:
            return .green
        case .revoked, .expired:
            return .red
        case .activating:
            return .blue
        case .notActivated, .error:
            return .orange
        }
    }
    
    // MARK: - Offline Overlay
    
    private var offlineOverlay: some View {
        VStack(spacing: 16) {
            Image(systemName: "wifi.slash")
                .font(.largeTitle)
                .foregroundColor(.orange)
            
            Text("Offline Mode")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Limited functionality available")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            if configService.canOperateOffline() {
                let timeRemaining = configService.getOfflineCapabilityTimeRemaining()
                Text("Offline capability: \(formatTimeRemaining(timeRemaining))")
                    .font(.caption)
                    .foregroundColor(.orange)
            }
        }
        .padding(24)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.regularMaterial)
                .shadow(radius: 8)
        )
        .padding()
        .transition(.opacity.combined(with: .scale))
    }
    
    // MARK: - Helper Methods
    
    private func startPeriodicChecks() {
        Task {
            await configService.checkActivationStatus()
            await configService.loadRemoteConfig()
        }
        
        // Set up periodic checks every 5 minutes
        Timer.scheduledTimer(withTimeInterval: 300, repeats: true) { _ in
            Task {
                await configService.checkActivationStatus()
                if await configService.isOnline() {
                    await configService.loadRemoteConfig()
                }
            }
        }
    }
    
    private func showActivationAlert() {
        // Show appropriate alert based on activation state
    }
    
    private func showHelpOptions() {
        // Show help modal or contact information
    }
    
    private func getTodaysHours(_ schedule: WeeklySchedule) -> DaySchedule? {
        let today = Calendar.current.component(.weekday, from: Date())
        switch today {
        case 1: return schedule.sunday
        case 2: return schedule.monday
        case 3: return schedule.tuesday
        case 4: return schedule.wednesday
        case 5: return schedule.thursday
        case 6: return schedule.friday
        case 7: return schedule.saturday
        default: return nil
        }
    }
    
    private func formatTimeSlots(_ slots: [TimeSlot]) -> String {
        slots.map { "\($0.start) - \($0.end)" }.joined(separator: ", ")
    }
    
    private func getNextOpenTime(_ schedule: WeeklySchedule) -> String? {
        // Implementation for finding next open time
        return nil
    }
    
    private func formatTimeRemaining(_ timeInterval: TimeInterval) -> String {
        let hours = Int(timeInterval) / 3600
        let minutes = Int(timeInterval) % 3600 / 60
        return "\(hours)h \(minutes)m"
    }
}

// MARK: - Action Button Component

struct ActionButton: View {
    let title: String
    let icon: String
    let color: Color
    let isEnabled: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 48))
                    .foregroundColor(isEnabled ? color : .gray)
                
                Text(title)
                    .font(.title2)
                    .fontWeight(.semibold)
                    .foregroundColor(isEnabled ? .primary : .gray)
                    .multilineTextAlignment(.center)
            }
            .frame(width: 200, height: 160)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(isEnabled ? color.opacity(0.1) : Color.gray.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(isEnabled ? color.opacity(0.3) : Color.gray.opacity(0.3), lineWidth: 2)
                    )
                    .shadow(radius: isEnabled ? 8 : 4)
            )
        }
        .buttonStyle(.plain)
        .scaleEffect(isEnabled ? 1.0 : 0.95)
        .opacity(isEnabled ? 1.0 : 0.6)
        .disabled(!isEnabled)
    }
}

#Preview {
    WallMountKioskView(
        configService: EnhancedConfigService.shared,
        statusService: StatusService.shared
    )
}
