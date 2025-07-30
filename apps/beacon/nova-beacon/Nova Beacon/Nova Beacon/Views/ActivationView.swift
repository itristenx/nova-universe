import SwiftUI
import UIKit
// import CodeScanner  // Temporarily commented out - package not available

struct ActivationView: View {
    @State private var activating = false
    @State private var error = false
    @State private var showingManualEntry = false
    @State private var showingQRScanner = false
    @State private var showingServerConfig = false
    @State private var activationCode = ""
    @StateObject private var kioskService = KioskService.shared
    @StateObject private var configService = EnhancedConfigService.shared

    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            
            Image(systemName: "qrcode.viewfinder")
                .font(.system(size: 64))
                .foregroundColor(Theme.Colors.accent)
            
            Text("Kiosk Activation")
                .font(.title)
                .fontWeight(.semibold)
            
            Text("Scan the QR code from the admin panel or enter the activation code manually")
                .font(.subheadline)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.md)
            
            VStack(spacing: 15) {
                Button(action: {
                    showingServerConfig = true
                }) {
                    Text("Server: \(APIConfig.baseURL)")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
                
                Text("Kiosk ID: \(kioskService.id)")
                    .font(.caption)
                    .foregroundColor(.gray)
                    .onTapGesture {
                        UIPasteboard.general.string = kioskService.id
                    }
                
                if !kioskService.statusMessage.isEmpty {
                    Text(kioskService.statusMessage)
                        .font(.caption)
                        .foregroundColor(kioskService.activationError ? Theme.Colors.accent : .gray)
                    
                    // Show server config button when there's a connection error
                    if kioskService.activationError {
                        Button("Change Server Settings") {
                            showingServerConfig = true
                        }
                        .font(.caption)
                        .foregroundColor(.blue)
                    }
                }
            }
            
            if showingManualEntry {
                VStack(spacing: 15) {
                    TextField("Activation Code", text: $activationCode)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocapitalization(.allCharacters)
                        .padding(.horizontal, Theme.Spacing.md)
                    
                    HStack(spacing: 15) {
                        Button("Cancel") {
                            showingManualEntry = false
                            activationCode = ""
                        }
                        .padding(Theme.Spacing.sm)
                        .frame(maxWidth: .infinity)
                        .background(Color(.systemGray5))
                        .foregroundColor(.primary)
                        .cornerRadius(8)
                        
                        Button("Activate") {
                            Task { await activateWithCode() }
                        }
                        .padding(Theme.Spacing.sm)
                        .frame(maxWidth: .infinity)
                        .background(Theme.Colors.primary)
                        .foregroundColor(Theme.Colors.base)
                        .cornerRadius(8)
                        .disabled(activationCode.isEmpty || activating)
                    }
                    .padding(.horizontal, Theme.Spacing.md)
                }
            } else {
                VStack(spacing: 15) {
                    if activating {
                        ProgressView()
                            .scaleEffect(1.5)
                    } else {
                        Button("Scan QR Code") { 
                            showingQRScanner = true
                        }
                        .padding(Theme.Spacing.sm)
                        .frame(maxWidth: .infinity)
                        .background(Theme.Colors.primary)
                        .foregroundColor(Theme.Colors.base)
                        .cornerRadius(8)
                        
                        Button("Enter Code Manually") {
                            showingManualEntry = true
                        }
                        .foregroundColor(Theme.Colors.accent)
                        .font(.caption)
                    }
                }
                .padding(.horizontal, Theme.Spacing.md)
            }
            
            Button("Check Server Connection") {
                Task { await kioskService.checkActive() }
            }
            .foregroundColor(Theme.Colors.accent)
            .font(.caption)
            
            Spacer()
        }
        .padding(Theme.Spacing.md)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.Colors.base.ignoresSafeArea())
        .fullScreenCover(isPresented: $showingQRScanner) {
            CodeScannerView { result in
                showingQRScanner = false
                switch result {
                case .success(let scan):
                    activationCode = scan.string
                    Task { await activateWithCode() }
                case .failure:
                    break
                }
            }
        }
        .sheet(isPresented: $showingServerConfig) {
            ServerSetupView()
        }
    }

    @MainActor
    private func activateWithCode() async {
        activating = true
        error = false
        let success = await kioskService.activateWithCode(activationCode)
        activating = false
        error = !success
        if success {
            showingManualEntry = false
            activationCode = ""
        }
    }
}
