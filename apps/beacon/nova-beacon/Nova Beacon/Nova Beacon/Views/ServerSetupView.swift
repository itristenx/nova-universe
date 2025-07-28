//
//  ServerSetupView.swift
//  CueIT Kiosk
//
//  Modern server configuration interface
//

import SwiftUI

struct ServerSetupView: View {
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var connectionManager = ConnectionManager.shared
    @StateObject private var kioskController = KioskController.shared
    
    @State private var serverURL = ""
    @State private var serverName = ""
    @State private var isConnecting = false
    @State private var connectionResult: ConnectionResult?
    @State private var showAdvancedOptions = false
    
    // Predefined server options
    private let serverPresets = [
        ServerPreset(name: "Local Development", url: "http://localhost:3000"),
        ServerPreset(name: "Local Network", url: "http://192.168.1.100:3000"),
        ServerPreset(name: "CueIT Cloud", url: "https://cueit.example.com")
    ]
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background
                LinearGradient(
                    colors: [
                        Color(.systemBackground),
                        Color(.systemGray6)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 32) {
                        // Header
                        VStack(spacing: 16) {
                            Image(systemName: "server.rack")
                                .font(.system(size: 64, weight: .light))
                                .foregroundStyle(.blue)
                            
                            VStack(spacing: 8) {
                                Text("Server Setup")
                                    .font(.system(size: 36, weight: .light, design: .rounded))
                                    .foregroundColor(.primary)
                                
                                Text("Connect to your CueIT server to continue")
                                    .font(.system(size: 18, weight: .medium))
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)
                            }
                        }
                        .padding(.top, 40)
                        
                        // Server configuration card
                        VStack(spacing: 24) {
                            // Quick setup presets
                            VStack(alignment: .leading, spacing: 16) {
                                Text("Quick Setup")
                                    .font(.system(size: 20, weight: .semibold, design: .rounded))
                                    .foregroundColor(.primary)
                                
                                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 16), count: geometry.size.width > 800 ? 3 : 1), spacing: 16) {
                                    ForEach(serverPresets, id: \.name) { preset in
                                        ServerPresetCard(preset: preset) {
                                            selectPreset(preset)
                                        }
                                    }
                                }
                            }
                            
                            Divider()
                            
                            // Custom server configuration
                            VStack(alignment: .leading, spacing: 20) {
                                Text("Custom Server")
                                    .font(.system(size: 20, weight: .semibold, design: .rounded))
                                    .foregroundColor(.primary)
                                
                                VStack(spacing: 16) {
                                    // Server URL input
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Server URL")
                                            .font(.system(size: 16, weight: .medium))
                                            .foregroundColor(.secondary)
                                        
                                        TextField("https://your-server.com:3000", text: $serverURL)
                                            .textFieldStyle(.roundedBorder)
                                            .font(.system(size: 16, weight: .medium, design: .monospaced))
                                            .autocapitalization(.none)
                                            .disableAutocorrection(true)
                                            .keyboardType(.URL)
                                    }
                                    
                                    // Server name input
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Server Name (Optional)")
                                            .font(.system(size: 16, weight: .medium))
                                            .foregroundColor(.secondary)
                                        
                                        TextField("My CueIT Server", text: $serverName)
                                            .textFieldStyle(.roundedBorder)
                                            .font(.system(size: 16, weight: .medium))
                                    }
                                    
                                    // Advanced options
                                    DisclosureGroup("Advanced Options", isExpanded: $showAdvancedOptions) {
                                        VStack(spacing: 16) {
                                            Toggle("Use SSL/TLS (HTTPS)", isOn: .constant(serverURL.hasPrefix("https")))
                                                .disabled(true)
                                            
                                            HStack {
                                                Text("Connection Timeout")
                                                Spacer()
                                                Text("30 seconds")
                                                    .foregroundColor(.secondary)
                                            }
                                            
                                            HStack {
                                                Text("Auto-retry")
                                                Spacer()
                                                Text("Enabled")
                                                    .foregroundColor(.secondary)
                                            }
                                        }
                                        .padding(.top, 16)
                                    }
                                    .font(.system(size: 16, weight: .medium))
                                }
                            }
                            
                            // Connection result
                            if let result = connectionResult {
                                ConnectionResultView(result: result)
                            }
                            
                            // Action buttons
                            VStack(spacing: 12) {
                                Button(action: testConnection) {
                                    HStack {
                                        if isConnecting {
                                            ProgressView()
                                                .scaleEffect(0.8)
                                        } else {
                                            Image(systemName: "network")
                                        }
                                        Text(isConnecting ? "Connecting..." : "Connect")
                                    }
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 16)
                                    .background(
                                        RoundedRectangle(cornerRadius: 12)
                                            .fill(serverURL.isEmpty ? Color.gray : Color.blue)
                                    )
                                }
                                .disabled(serverURL.isEmpty || isConnecting)
                                
                                if connectionResult?.isSuccess == true {
                                    Button(action: saveConfiguration) {
                                        HStack {
                                            Image(systemName: "checkmark")
                                            Text("Connect to Server")
                                        }
                                        .font(.system(size: 18, weight: .semibold))
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 16)
                                        .background(
                                            RoundedRectangle(cornerRadius: 12)
                                                .fill(Color.green)
                                        )
                                    }
                                }
                            }
                        }
                        .padding(24)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(Color(.systemBackground))
                                .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
                        )
                        
                        Spacer(minLength: 40)
                    }
                    .padding(.horizontal, 40)
                }
            }
        }
    }
    
    private func selectPreset(_ preset: ServerPreset) {
        serverURL = preset.url
        serverName = preset.name
        connectionResult = nil
    }
    
    private func testConnection() {
        guard !serverURL.isEmpty else { return }
        
        isConnecting = true
        connectionResult = nil
        
        Task {
            let success = await connectionManager.testConnection()
            
            await MainActor.run {
                isConnecting = false
                connectionResult = ConnectionResult(
                    isSuccess: success,
                    message: success ? "Connection successful!" : "Unable to connect to server",
                    timestamp: Date()
                )
            }
        }
    }
    
    private func saveConfiguration() {
        let config = ServerConfiguration(
            baseURL: serverURL,
            name: serverName.isEmpty ? "CueIT Server" : serverName
        )
        
        configManager.setServerConfiguration(config)
        kioskController.transitionTo(.setup)
    }
}

// MARK: - Supporting Views and Types
struct ServerPreset {
    let name: String
    let url: String
}

struct ServerPresetCard: View {
    let preset: ServerPreset
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Image(systemName: preset.url.hasPrefix("https") ? "lock.shield" : "server.rack")
                        .font(.system(size: 24, weight: .medium))
                        .foregroundColor(.blue)
                    
                    Spacer()
                    
                    Image(systemName: "arrow.right.circle")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.secondary)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(preset.name)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.primary)
                    
                    Text(preset.url)
                        .font(.system(size: 14, weight: .medium, design: .monospaced))
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemGray6))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color(.systemGray4), lineWidth: 1)
                    )
            )
        }
        .buttonStyle(.plain)
    }
}

struct ConnectionResult {
    let isSuccess: Bool
    let message: String
    let timestamp: Date
}

struct ConnectionResultView: View {
    let result: ConnectionResult
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: result.isSuccess ? "checkmark.circle.fill" : "xmark.circle.fill")
                .font(.system(size: 20, weight: .medium))
                .foregroundColor(result.isSuccess ? .green : .red)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(result.message)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(result.isSuccess ? .green : .red)
                
                Text("Tested at \(result.timestamp.formatted(date: .omitted, time: .shortened))")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(result.isSuccess ? Color.green.opacity(0.1) : Color.red.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(result.isSuccess ? Color.green.opacity(0.3) : Color.red.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

#Preview {
    ServerSetupView()
}
