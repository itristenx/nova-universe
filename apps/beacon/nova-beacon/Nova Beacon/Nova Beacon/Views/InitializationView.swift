//
//  InitializationView.swift
//  Nova Beacon
//
//  Modern loading screen shown during app initialization
//

import SwiftUI
import Foundation

struct InitializationView: View {
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var kioskController = KioskController.shared
    
    @State private var loadingText = "Initializing..."
    @State private var progress: Double = 0.0
    @State private var showLogo = false
        let url = URL(string: "\(serverConfig.baseURL)/api/v1/server-info")!
    @State private var hasConnectionError = false
    @State private var errorMessage = ""
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [
                    Color.blue.opacity(0.1),
                    Color.purple.opacity(0.1)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 40) {
                Spacer()
                
                // Logo with animation
                VStack(spacing: 24) {
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [Color.blue, Color.purple],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 120, height: 120)
                            .scaleEffect(showLogo ? 1.0 : 0.8)
                            .animation(.spring(response: 0.8, dampingFraction: 0.6), value: showLogo)
                        
                        Image(systemName: "desktopcomputer")
                            .font(.system(size: 48, weight: .light))
                            .foregroundColor(.white)
                            .scaleEffect(showLogo ? 1.0 : 0.5)
                            .animation(.spring(response: 1.0, dampingFraction: 0.7).delay(0.2), value: showLogo)
                    }
                    
                    VStack(spacing: 8) {
                        Text("Nova Beacon")
                            .font(.system(size: 32, weight: .light, design: .rounded))
                            .foregroundColor(.primary)
                        
                        Text("Created for \(organizationName)")
                            .font(.system(size: 16, weight: .medium, design: .rounded))
                            .foregroundColor(.secondary)
                    }
                    .opacity(showLogo ? 1.0 : 0.0)
                    .animation(.easeInOut(duration: 0.6).delay(0.4), value: showLogo)
                }
                
                Spacer()
                
                // Loading section
                VStack(spacing: 24) {
                    if hasConnectionError {
                        // Error state
                        VStack(spacing: 16) {
                            Image(systemName: "wifi.exclamationmark")
                                .font(.system(size: 48, weight: .light))
                                .foregroundColor(.red)
                            
                            VStack(spacing: 8) {
                                Text("Connection Error")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(.primary)
                                
                                Text(errorMessage)
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 20)
                            }
                            
                            Button("Retry") {
                                retry()
                            }
                            .buttonStyle(.borderedProminent)
                            .controlSize(.large)
                        }
                    } else {
                        // Progress indicator
                        VStack(spacing: 16) {
                            ProgressView(value: progress, total: 1.0)
                                .progressViewStyle(.linear)
                                .tint(.blue)
                                .scaleEffect(y: 2)
                                .frame(maxWidth: 280)
                            
                            Text(loadingText)
                                .font(.system(size: 18, weight: .medium, design: .rounded))
                                .foregroundColor(.secondary)
                                .animation(.easeInOut(duration: 0.3), value: loadingText)
                        }
                        
                        // Animated dots
                        HStack(spacing: 8) {
                            ForEach(0..<3) { index in
                                Circle()
                                    .fill(Color.blue)
                                    .frame(width: 8, height: 8)
                                    .scaleEffect(showLogo ? 1.0 : 0.5)
                                    .animation(
                                        .easeInOut(duration: 0.6)
                                            .repeatForever(autoreverses: true)
                                            .delay(Double(index) * 0.2),
                                        value: showLogo
                                    )
                            }
                        }
                    }
                }
                .padding(.bottom, 60)
            }
            .padding(.horizontal, 40)
        }
        .onAppear {
            startInitialization()
        }
    }
    
    private func startInitialization() {
        showLogo = true
        hasConnectionError = false
        
        Task {
            await performInitialization()
        }
    }
    
    private func performInitialization() async {
        let steps = [
            (0.2, "Loading configuration..."),
            (0.4, "Connecting to server..."),
            (0.6, "Fetching server info..."),
            (0.8, "Verifying setup..."),
            (1.0, "Ready!")
        ]
        
        for (index, (progressValue, text)) in steps.enumerated() {
            await MainActor.run {
                withAnimation(.easeInOut(duration: 0.4)) {
                    progress = progressValue
                    loadingText = text
                }
            }
            
            // Add actual server interaction at step 0.4 (Connecting to server)
            if index == 1 {
                do {
                    try await fetchServerInfo()
                    // Small delay to show the step
                    try await Task.sleep(for: .milliseconds(500))
                } catch {
                    await MainActor.run {
                        hasConnectionError = true
                        errorMessage = "Unable to connect to server. Please check your network connection and server configuration."
                    }
                    return
                }
            } else {
                // Small delay for other steps
                try? await Task.sleep(for: .milliseconds(800))
            }
        }
        
        // If we get here, initialization was successful
        await MainActor.run {
            kioskController.initialize()
        }
    }
    
    private func fetchServerInfo() async throws {
        // For development, use localhost if no server config is set
        let serverConfig = configManager.serverConfiguration ?? ServerConfiguration(baseURL: "http://localhost:3000")
        let url = URL(string: "\(serverConfig.baseURL)/api/v1/server-info")!
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw InitializationError.serverError
        }
        
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let orgName = json["organizationName"] as? String {
            await MainActor.run {
                organizationName = orgName
            }
        }
    }
    
    private func retry() {
        hasConnectionError = false
        progress = 0.0
        loadingText = "Initializing..."
        startInitialization()
    }
}

enum InitializationError: Error {
    case noServerConfiguration
    case serverError
    case networkError
}

#Preview {
    InitializationView()
}
