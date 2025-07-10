import SwiftUI
import UIKit
import UIKit

struct ActivationErrorView: View {
    @StateObject private var kioskService = KioskService.shared
    @State private var showingServerConfig = false

    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 64))
                .foregroundColor(Theme.Colors.accent)
            
            Text("Connection Error")
                .font(.title)
                .fontWeight(.semibold)
            
            Text("Unable to connect to the CueIT server. Please check your connection and server settings.")
                .font(.subheadline)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.md)
            
            // Show current status message if available
            if !kioskService.statusMessage.isEmpty {
                Text(kioskService.statusMessage)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Theme.Spacing.md)
            }
            
            VStack(spacing: 15) {
                Button("Retry Connection") {
                    Task {
                        await kioskService.checkActive()
                    }
                }
                .padding(Theme.Spacing.sm)
                .frame(maxWidth: .infinity)
                .background(Theme.Colors.primary)
                .foregroundColor(Theme.Colors.base)
                .cornerRadius(8)
                
                Button("Change Server Settings") {
                    showingServerConfig = true
                }
                .padding(Theme.Spacing.sm)
                .frame(maxWidth: .infinity)
                .background(Color(.systemGray5))
                .foregroundColor(.primary)
                .cornerRadius(8)
            }
            .padding(.horizontal, Theme.Spacing.md)
            
            Spacer()
            
            // Show server and kiosk info
            VStack(spacing: 8) {
                Text("Server: \(APIConfig.baseURL)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text("Kiosk ID: \(kioskService.id)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .onTapGesture {
                        UIPasteboard.general.string = kioskService.id
                    }
            }
        }
        .padding(Theme.Spacing.md)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.Colors.base.ignoresSafeArea())
        .sheet(isPresented: $showingServerConfig) {
            ServerSetupView()
        }
    }
}
