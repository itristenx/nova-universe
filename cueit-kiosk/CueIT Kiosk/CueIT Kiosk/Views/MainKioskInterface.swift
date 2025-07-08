//
//  MainKioskInterface.swift
//  CueIT Kiosk
//
//  Main kiosk interface inspired by modern conference room tablets
//

import SwiftUI

struct MainKioskInterface: View {
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var connectionManager = ConnectionManager.shared
    @StateObject private var authManager = AuthenticationManager.shared
    @StateObject private var kioskController = KioskController.shared
    
    @State private var currentTime = Date()
    @State private var showTicketForm = false
    @State private var showFeedbackForm = false
    @State private var selectedCategory: ServiceCategory?
    
    // Timer for updating time
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background
                backgroundView
                
                VStack(spacing: 0) {
                    // Top status bar
                    StatusBar()
                    
                    // Main content area
                    ScrollView {
                        VStack(spacing: 32) {
                            // Welcome header
                            welcomeHeader
                            
                            // Time and date display
                            timeDisplay
                            
                            // Service categories
                            serviceCategories
                            
                            // Quick actions
                            quickActions
                            
                            // Status indicators
                            statusIndicators
                        }
                        .padding(.horizontal, 40)
                        .padding(.vertical, 32)
                    }
                    
                    // Bottom admin access
                    BottomBar()
                }
            }
        }
        .sheet(isPresented: $showTicketForm) {
            if let category = selectedCategory {
                TicketSubmissionView(category: category) {
                    showTicketForm = false
                    selectedCategory = nil
                }
            }
        }
        .sheet(isPresented: $showFeedbackForm) {
            FeedbackSubmissionView {
                showFeedbackForm = false
            }
        }
        .onReceive(timer) { _ in
            currentTime = Date()
        }
        .onAppear {
            // Refresh configuration periodically
            Task {
                await configManager.refreshConfiguration()
            }
        }
    }
    
    // MARK: - Background View
    private var backgroundView: some View {
        Group {
            if let bgURL = configManager.kioskConfiguration?.backgroundURL,
               !bgURL.isEmpty {
                AsyncImage(url: URL(string: bgURL)) { image in
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
                Color(hex: configManager.kioskConfiguration?.theme.primaryColor ?? "#007AFF"),
                Color(hex: configManager.kioskConfiguration?.theme.secondaryColor ?? "#5856D6")
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .opacity(0.1)
    }
    
    // MARK: - Welcome Header
    private var welcomeHeader: some View {
        VStack(spacing: 16) {
            // Logo
            if let logoURL = configManager.kioskConfiguration?.logoURL {
                AsyncImage(url: URL(string: logoURL)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(height: 80)
                } placeholder: {
                    defaultLogo
                }
            } else {
                defaultLogo
            }
            
            // Welcome message
            VStack(spacing: 8) {
                Text(configManager.kioskConfiguration?.messaging.welcomeMessage ?? "Welcome")
                    .font(.system(size: 42, weight: .light, design: .rounded))
                    .foregroundColor(.primary)
                    .multilineTextAlignment(.center)
                
                Text(configManager.kioskConfiguration?.messaging.helpText ?? "How can we help you today?")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
    }
    
    private var defaultLogo: some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [Color.blue, Color.purple],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 80, height: 80)
            
            Image(systemName: "desktopcomputer")
                .font(.system(size: 32, weight: .light))
                .foregroundColor(.white)
        }
    }
    
    // MARK: - Time Display
    private var timeDisplay: some View {
        VStack(spacing: 8) {
            Text(currentTime.formatted(.dateTime.hour().minute()))
                .font(.system(size: 72, weight: .light, design: .rounded))
                .foregroundColor(.primary)
            
            Text(currentTime.formatted(.dateTime.weekday(.wide).month().day()))
                .font(.system(size: 24, weight: .medium))
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 20)
    }
    
    // MARK: - Service Categories
    private var serviceCategories: some View {
        VStack(alignment: .leading, spacing: 24) {
            Text("How can we help?")
                .font(.system(size: 28, weight: .semibold, design: .rounded))
                .foregroundColor(.primary)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 20), count: 2), spacing: 20) {
                ForEach(ServiceCategory.allCategories, id: \.id) { category in
                    ServiceCategoryCard(category: category) {
                        selectedCategory = category
                        showTicketForm = true
                    }
                }
            }
        }
    }
    
    // MARK: - Quick Actions
    private var quickActions: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Quick Actions")
                .font(.system(size: 24, weight: .semibold, design: .rounded))
                .foregroundColor(.primary)
            
            HStack(spacing: 16) {
                QuickActionButton(
                    title: "Emergency Support",
                    subtitle: "Immediate assistance",
                    icon: "phone.fill",
                    color: .red
                ) {
                    selectedCategory = ServiceCategory.emergency
                    showTicketForm = true
                }
                
                QuickActionButton(
                    title: "General Feedback",
                    subtitle: "Share your thoughts",
                    icon: "message.fill",
                    color: .blue
                ) {
                    showFeedbackForm = true
                }
            }
        }
    }
    
    // MARK: - Status Indicators
    private var statusIndicators: some View {
        VStack(spacing: 16) {
            if configManager.kioskConfiguration?.statusIndicator.enabled == true {
                StatusIndicatorPanel()
            }
            
            // Connection status
            HStack {
                connectionStatusIndicator
                Spacer()
                lastUpdateIndicator
            }
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.secondary)
        }
    }
    
    private var connectionStatusIndicator: some View {
        HStack(spacing: 8) {
            Image(systemName: connectionManager.connectionQuality.systemImage)
                .foregroundColor(connectionManager.connectionQuality.color)
            
            Text(connectionManager.isConnected ? "Connected" : "Offline")
        }
    }
    
    private var lastUpdateIndicator: some View {
        HStack(spacing: 8) {
            Image(systemName: "clock")
            
            if let lastUpdate = configManager.lastConfigUpdate {
                Text("Updated \(lastUpdate.formatted(.relative(presentation: .named)))")
            } else {
                Text("No updates")
            }
        }
    }
}

// MARK: - Supporting Views
struct ServiceCategoryCard: View {
    let category: ServiceCategory
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(category.color.opacity(0.2))
                        .frame(width: 80, height: 80)
                    
                    Image(systemName: category.icon)
                        .font(.system(size: 32, weight: .medium))
                        .foregroundColor(category.color)
                }
                
                VStack(spacing: 8) {
                    Text(category.title)
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(.primary)
                        .multilineTextAlignment(.center)
                    
                    Text(category.description)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity, minHeight: 200)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color(.systemBackground))
                    .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
            )
        }
        .buttonStyle(.plain)
    }
}

struct QuickActionButton: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(color.opacity(0.2))
                        .frame(width: 50, height: 50)
                    
                    Image(systemName: icon)
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(color)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.primary)
                    
                    Text(subtitle)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "arrow.right")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.secondary)
            }
            .padding(20)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.systemBackground))
                    .shadow(color: .black.opacity(0.1), radius: 5, x: 0, y: 2)
            )
        }
        .buttonStyle(.plain)
    }
}

struct ServiceCategory {
    let id = UUID()
    let title: String
    let description: String
    let icon: String
    let color: Color
    
    static let technology = ServiceCategory(
        title: "Technology Issues",
        description: "Computer, network, or software problems",
        icon: "desktopcomputer",
        color: .blue
    )
    
    static let facilities = ServiceCategory(
        title: "Facilities",
        description: "Room setup, lighting, or equipment",
        icon: "building.2",
        color: .green
    )
    
    static let audioVisual = ServiceCategory(
        title: "Audio/Visual",
        description: "Projector, sound, or display issues",
        icon: "tv",
        color: .purple
    )
    
    static let emergency = ServiceCategory(
        title: "Emergency",
        description: "Urgent assistance required",
        icon: "exclamationmark.triangle.fill",
        color: .red
    )
    
    static let allCategories = [technology, facilities, audioVisual, emergency]
}

#Preview {
    MainKioskInterface()
}
