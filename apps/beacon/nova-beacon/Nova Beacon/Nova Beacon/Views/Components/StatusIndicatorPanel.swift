//
//  StatusIndicatorPanel.swift
//  Nova Beacon
//
//  Status indicator component for showing office status
//

import SwiftUI

struct StatusIndicatorPanel: View {
    @StateObject private var configManager = ConfigurationManager.shared
    @State private var currentStatus: OfficeStatus = .open
    @State private var nextStatusChange: Date?
    
    var body: some View {
        VStack(spacing: 16) {
            // Current status display
            HStack(spacing: 16) {
                // Status indicator
                ZStack {
                    Circle()
                        .fill(currentStatus.color.opacity(0.2))
                        .frame(width: 60, height: 60)
                    
                    Circle()
                        .fill(currentStatus.color)
                        .frame(width: 20, height: 20)
                        .scaleEffect(currentStatus == .open ? 1.0 : 0.8)
                        .animation(.easeInOut(duration: 0.3), value: currentStatus)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Office Status")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.secondary)
                    
                    Text(currentStatus.displayText)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(currentStatus.color)
                }
                
                Spacer()
                
                // Status message
                if let message = currentStatus.message {
                    Text(message)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.trailing)
                }
            }
            
            // Next status change (if scheduled)
            if let nextChange = nextStatusChange {
                HStack(spacing: 8) {
                    Image(systemName: "clock")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                    
                    Text("Next change: \(nextChange.formatted(.dateTime.hour().minute()))")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                    
                    Spacer()
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 5, x: 0, y: 2)
        )
        .onAppear {
            loadCurrentStatus()
        }
    }
    
    private func loadCurrentStatus() {
        // This would integrate with the backend status system
        // For now, we'll use a mock status
        currentStatus = .open
    }
}

// MARK: - Office Status
enum OfficeStatus: String, CaseIterable {
    case open = "open"
    case closed = "closed"
    case meeting = "meeting"
    case brb = "brb"
    case lunch = "lunch"
    
    var displayText: String {
        switch self {
        case .open: return "Open"
        case .closed: return "Closed"
        case .meeting: return "In a Meeting"
        case .brb: return "Be Right Back"
        case .lunch: return "Out to Lunch"
        }
    }
    
    var color: Color {
        switch self {
        case .open: return .green
        case .closed: return .red
        case .meeting: return .purple
        case .brb: return .yellow
        case .lunch: return .orange
        }
    }
    
    var message: String? {
        switch self {
        case .open: return "Available for assistance"
        case .closed: return "Please check back later"
        case .meeting: return "Please wait or leave a message"
        case .brb: return "Back in a few minutes"
        case .lunch: return "Back after lunch"
        }
    }
}

#Preview {
    StatusIndicatorPanel()
        .padding()
}
