//
//  DeactivationView.swift
//  Nova Beacon
//
//  Displays when the kiosk has been deactivated by the admin
//

import SwiftUI

struct DeactivationView: View {
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var kioskController = KioskController.shared
    
    @State private var isResetting = false
    @State private var organizationName = "Your Organization"
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background
                LinearGradient(
                    colors: [
                        Color.red.opacity(0.1),
                        Color.orange.opacity(0.05)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
                
                VStack(spacing: 40) {
                    Spacer()
                    
                    // Warning Icon
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 120, weight: .light))
                        .foregroundStyle(.red)
                        .symbolEffect(.bounce, value: true)
                    
                    // Title and Message
                    VStack(spacing: 20) {
                        Text("Kiosk Deactivated")
                            .font(.system(size: 48, weight: .light, design: .rounded))
                            .foregroundColor(.primary)
                            .multilineTextAlignment(.center)
                        
                        Text("This kiosk has been deactivated.\nPlease return to \(organizationName).")
                            .font(.system(size: 24, weight: .medium))
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .lineSpacing(8)
                    }
                    
                    Spacer()
                    
                    // Reset Button
                    Button(action: {
                        performFactoryReset()
                    }) {
                        HStack(spacing: 12) {
                            if isResetting {
                                ProgressView()
                                    .scaleEffect(0.8)
                                    .tint(.white)
                            } else {
                                Image(systemName: "arrow.clockwise")
                                    .font(.system(size: 20, weight: .medium))
                            }
                            
                            Text(isResetting ? "Resetting..." : "Reset to Factory Settings")
                                .font(.system(size: 20, weight: .semibold))
                        }
                        .foregroundColor(.white)
                        .frame(minWidth: 300, minHeight: 60)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(Color.red)
                        )
                    }
                    .disabled(isResetting)
                    .scaleEffect(isResetting ? 0.95 : 1.0)
                    .animation(.easeInOut(duration: 0.1), value: isResetting)
                    
                    // Admin Contact Info
                    VStack(spacing: 8) {
                        Text("Need Help?")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.secondary)
                        
                        Text("Contact your IT administrator for assistance")
                            .font(.system(size: 14, weight: .regular))
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.bottom, 40)
                }
                .padding(.horizontal, 60)
            }
        }
        .onAppear {
            loadOrganizationName()
        }
    }
    
    private func loadOrganizationName() {
        // Try to get organization name from server configuration or stored data
        if configManager.serverConfiguration != nil {
            // In a real implementation, we'd fetch this from the server
            // For now, we'll use a stored value or default
            organizationName = UserDefaults.standard.string(forKey: "organizationName") ?? "Your Organization"
        }
    }
    
    private func performFactoryReset() {
        isResetting = true
        
        Task {
            // Simulate reset process
            try? await Task.sleep(for: .seconds(2))
            
            await configManager.performFactoryReset()
            
            await MainActor.run {
                isResetting = false
                // Trigger app restart by clearing setup complete flag
                UserDefaults.standard.set(false, forKey: "isSetupComplete")
                kioskController.transitionTo(.setup)
            }
        }
    }
}

#Preview {
    DeactivationView()
}
