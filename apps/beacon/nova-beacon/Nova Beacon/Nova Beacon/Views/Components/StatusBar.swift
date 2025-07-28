//
//  StatusBar.swift
//  CueIT Kiosk
//
//  Top status bar showing connection, time, and system status
//

import SwiftUI

struct StatusBar: View {
    @StateObject private var connectionManager = ConnectionManager.shared
    @StateObject private var configManager = ConfigurationManager.shared
    @State private var currentTime = Date()
    
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        HStack {
            // Left side - System status
            HStack(spacing: 16) {
                // Connection indicator
                HStack(spacing: 6) {
                    Image(systemName: connectionManager.connectionQuality.systemImage)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(connectionManager.connectionQuality.color)
                    
                    Text(connectionManager.isConnected ? "Online" : "Offline")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(connectionManager.isConnected ? .green : .red)
                }
                
                // Server status
                if let serverConfig = configManager.serverConfiguration {
                    HStack(spacing: 6) {
                        Circle()
                            .fill(connectionManager.serverReachable ? Color.green : Color.red)
                            .frame(width: 8, height: 8)
                        
                        Text(serverConfig.name)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            Spacer()
            
            // Center - Kiosk name
            if let kioskName = configManager.kioskConfiguration?.displayName {
                Text(kioskName)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.primary)
            }
            
            Spacer()
            
            // Right side - Time and status
            HStack(spacing: 16) {
                // Last update indicator
                if let lastUpdate = configManager.lastConfigUpdate {
                    HStack(spacing: 6) {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.secondary)
                        
                        Text("Updated \(lastUpdate.formatted(.relative(presentation: .named)))")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.secondary)
                    }
                }
                
                // Current time
                Text(currentTime.formatted(.dateTime.hour().minute()))
                    .font(.system(size: 14, weight: .semibold, design: .monospaced))
                    .foregroundColor(.primary)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(
            Rectangle()
                .fill(Color(.systemBackground).opacity(0.95))
                .overlay(
                    Rectangle()
                        .fill(Color(.systemGray4))
                        .frame(height: 1),
                    alignment: .bottom
                )
        )
        .onReceive(timer) { _ in
            currentTime = Date()
        }
    }
}

#Preview {
    StatusBar()
}
