import SwiftUI

// MARK: - Status Indicator Bar
struct StatusIndicatorBar: View {
    @ObservedObject var connectionStatus: ConnectionStatus
    @State private var isExpanded = false
    @State private var showRetryButton = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Main status bar
            HStack(spacing: Theme.Spacing.sm) {
                // Connection indicator
                connectionIndicator
                
                // Status text
                statusText
                
                Spacer()
                
                // Actions
                actionButtons
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.sm)
            .background(statusBackgroundColor)
            .onTapGesture {
                withAnimation(.easeInOut(duration: 0.3)) {
                    isExpanded.toggle()
                }
            }
            
            // Expanded details
            if isExpanded {
                expandedDetails
                    .transition(.asymmetric(
                        insertion: .opacity.combined(with: .move(edge: .top)),
                        removal: .opacity.combined(with: .move(edge: .top))
                    ))
            }
        }
        .onChange(of: connectionStatus.state) { newState in
            updateShowRetryButton(for: newState)
        }
        .onAppear {
            updateShowRetryButton(for: connectionStatus.state)
        }
    }
    
    // MARK: - Connection Indicator
    private var connectionIndicator: some View {
        HStack(spacing: Theme.Spacing.xs) {
            Image(systemName: connectionStatus.state.iconName)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(Color(connectionStatus.state.systemColor))
                .symbolEffect(.pulse, isActive: connectionStatus.state == .connecting)
            
            if connectionStatus.isRetrying {
                ProgressView()
                    .scaleEffect(0.6)
                    .frame(width: 12, height: 12)
            }
        }
    }
    
    // MARK: - Status Text
    private var statusText: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(connectionStatus.state.displayName)
                .font(Theme.Typography.caption1.weight(.medium))
                .foregroundColor(Theme.Colors.label)
            
            if let errorMessage = connectionStatus.errorMessage {
                Text(errorMessage)
                    .font(Theme.Typography.caption2)
                    .foregroundColor(Theme.Colors.secondaryLabel)
                    .lineLimit(1)
            } else if connectionStatus.state == .connected, !connectionStatus.kioskId.isEmpty {
                Text("Kiosk ID: \(connectionStatus.kioskId)")
                    .font(Theme.Typography.caption2)
                    .foregroundColor(Theme.Colors.secondaryLabel)
            }
        }
    }
    
    // MARK: - Action Buttons
    private var actionButtons: some View {
        HStack(spacing: Theme.Spacing.xs) {
            if showRetryButton {
                Button(action: {
                    connectionStatus.manualRetry()
                }) {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(Theme.Colors.accent)
                }
                .disabled(connectionStatus.isRetrying)
            }
            
            // Expand/collapse indicator
            Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(Theme.Colors.tertiaryLabel)
                .rotationEffect(.degrees(isExpanded ? 180 : 0))
        }
    }
    
    // MARK: - Expanded Details
    private var expandedDetails: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Divider()
                .background(Theme.Colors.separator)
            
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                if !connectionStatus.serverUrl.isEmpty {
                    detailRow(label: "Server", value: connectionStatus.serverUrl)
                }
                
                if !connectionStatus.kioskId.isEmpty {
                    detailRow(label: "Kiosk ID", value: connectionStatus.kioskId)
                }
                
                if let lastConnected = connectionStatus.lastConnected {
                    detailRow(label: "Last Connected", value: formatDate(lastConnected))
                }
                
                if connectionStatus.retryCount > 0 {
                    detailRow(label: "Retry Attempts", value: "\(connectionStatus.retryCount)")
                }
                
                if connectionStatus.state == .error || connectionStatus.state == .disconnected {
                    HStack(spacing: Theme.Spacing.sm) {
                        Button("Retry Connection") {
                            connectionStatus.manualRetry()
                        }
                        .buttonStyle(SecondaryButtonStyle())
                        .controlSize(.small)
                        
                        Button("Reset") {
                            connectionStatus.reset()
                        }
                        .buttonStyle(TertiaryButtonStyle())
                        .controlSize(.small)
                    }
                    .padding(.top, Theme.Spacing.xs)
                }
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.sm)
        }
        .background(statusBackgroundColor.opacity(0.5))
    }
    
    // MARK: - Helper Views
    private func detailRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(Theme.Typography.caption2.weight(.medium))
                .foregroundColor(Theme.Colors.secondaryLabel)
            
            Spacer()
            
            Text(value)
                .font(Theme.Typography.caption2)
                .foregroundColor(Theme.Colors.label)
                .lineLimit(1)
        }
    }
    
    // MARK: - Computed Properties
    private var statusBackgroundColor: Color {
        switch connectionStatus.state {
        case .connected:
            return Theme.Colors.success.opacity(0.1)
        case .connecting:
            return Theme.Colors.warning.opacity(0.1)
        case .disconnected:
            return Theme.Colors.warning.opacity(0.1)
        case .error:
            return Theme.Colors.destructive.opacity(0.1)
        }
    }
    
    // MARK: - Helper Methods
    private func updateShowRetryButton(for state: ConnectionState) {
        withAnimation(.easeInOut(duration: 0.2)) {
            showRetryButton = state == .disconnected || state == .error
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        formatter.dateStyle = .none
        
        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            return "Today at \(formatter.string(from: date))"
        } else if calendar.isDateInYesterday(date) {
            return "Yesterday at \(formatter.string(from: date))"
        } else {
            formatter.dateStyle = .short
            return formatter.string(from: date)
        }
    }
}

// MARK: - Compact Status Indicator
struct CompactStatusIndicator: View {
    @ObservedObject var connectionStatus: ConnectionStatus
    
    var body: some View {
        HStack(spacing: Theme.Spacing.xs) {
            Image(systemName: connectionStatus.state.iconName)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(Color(connectionStatus.state.systemColor))
                .symbolEffect(.pulse, isActive: connectionStatus.state == .connecting)
            
            Text(connectionStatus.state.displayName)
                .font(Theme.Typography.caption2.weight(.medium))
                .foregroundColor(Theme.Colors.secondaryLabel)
        }
        .padding(.horizontal, Theme.Spacing.xs)
        .padding(.vertical, 2)
        .background(
            Capsule()
                .fill(Color(connectionStatus.state.systemColor).opacity(0.1))
        )
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 20) {
        let connectedStatus = ConnectionStatus()
        let disconnectedStatus = ConnectionStatus()
        let errorStatus = ConnectionStatus()
        
        StatusIndicatorBar(connectionStatus: connectedStatus)
        StatusIndicatorBar(connectionStatus: disconnectedStatus)
        StatusIndicatorBar(connectionStatus: errorStatus)
        
        HStack {
            CompactStatusIndicator(connectionStatus: connectedStatus)
            CompactStatusIndicator(connectionStatus: disconnectedStatus)
            CompactStatusIndicator(connectionStatus: errorStatus)
        }
    }
    .padding()
    .onAppear {
        let connectedStatus = ConnectionStatus()
        connectedStatus.updateStatus(.connected)
        connectedStatus.setServerInfo(url: "https://api.cueit.com", kioskId: "KIOSK_001")
        
        let disconnectedStatus = ConnectionStatus()
        disconnectedStatus.updateStatus(.disconnected)
        
        let errorStatus = ConnectionStatus()
        errorStatus.updateStatus(.error, errorMessage: "Server unreachable")
    }
}
