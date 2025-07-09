//
//  ActivationModeView.swift
//  CueIT Kiosk
//
//  Modern activation interface with QR scanning and manual entry
//

import SwiftUI
import AVFoundation

struct ActivationModeView: View {
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var kioskController = KioskController.shared
    
    @State private var activationMode: ActivationMode = .qr
    @State private var manualCode = ""
    @State private var isActivating = false
    @State private var activationError: String?
    @State private var showScanner = false
    @State private var kioskId = ""
    
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
                            Image(systemName: "qrcode.viewfinder")
                                .font(.system(size: 64, weight: .light))
                                .foregroundStyle(.blue)
                            
                            VStack(spacing: 8) {
                                Text("Kiosk Activation")
                                    .font(.system(size: 36, weight: .light, design: .rounded))
                                    .foregroundColor(.primary)
                                
                                Text("Scan the QR code or enter the activation code provided by your administrator")
                                    .font(.system(size: 18, weight: .medium))
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 20)
                            }
                        }
                        .padding(.top, 40)
                        
                        // Kiosk information card
                        KioskInfoCard(kioskId: kioskId)
                        
                        // Activation mode selector
                        VStack(spacing: 24) {
                            Text("Activation Method")
                                .font(.system(size: 20, weight: .semibold, design: .rounded))
                                .foregroundColor(.primary)
                            
                            Picker("Activation Mode", selection: $activationMode) {
                                ForEach(ActivationMode.allCases, id: \.self) { mode in
                                    Text(mode.displayName).tag(mode)
                                }
                            }
                            .pickerStyle(.segmented)
                            .padding(.horizontal, 20)
                        }
                        
                        // Activation interface
                        VStack(spacing: 24) {
                            switch activationMode {
                            case .qr:
                                QRActivationView(showScanner: $showScanner) { code in
                                    processActivationCode(code)
                                }
                            case .manual:
                                ManualActivationView(
                                    activationCode: $manualCode,
                                    isActivating: isActivating
                                ) {
                                    processActivationCode(manualCode)
                                }
                            }
                            
                            // Error display
                            if let error = activationError {
                                ErrorMessageView(message: error) {
                                    activationError = nil
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                        
                        Spacer(minLength: 40)
                    }
                    .padding(.horizontal, 40)
                }
            }
        }
        .sheet(isPresented: $showScanner) {
            QRScannerView { result in
                switch result {
                case .success(let code):
                    processActivationCode(code.string)
                case .failure(let error):
                    activationError = "QR scan failed: \(error.localizedDescription)"
                }
            }
        }
        .onAppear {
            kioskId = configManager.getKioskId()
        }
    }
    
    private func processActivationCode(_ code: String) {
        guard !code.isEmpty else {
            activationError = "Please enter a valid activation code"
            return
        }
        
        isActivating = true
        activationError = nil
        
        Task {
            let success = await configManager.activateKiosk(with: code)
            
            await MainActor.run {
                isActivating = false
                
                if success {
                    kioskController.showNotification(message: "Kiosk activated successfully!")
                    kioskController.transitionTo(.activated)
                } else {
                    activationError = "Invalid activation code. Please try again or contact your administrator."
                }
            }
        }
    }
}

// MARK: - Activation Mode
enum ActivationMode: CaseIterable {
    case qr
    case manual
    
    var displayName: String {
        switch self {
        case .qr: return "QR Code"
        case .manual: return "Manual Entry"
        }
    }
    
    var systemImage: String {
        switch self {
        case .qr: return "qrcode.viewfinder"
        case .manual: return "keyboard"
        }
    }
}

// MARK: - Supporting Views
struct KioskInfoCard: View {
    let kioskId: String
    
    var body: some View {
        VStack(spacing: 16) {
            HStack {
                Image(systemName: "desktopcomputer")
                    .font(.system(size: 24, weight: .medium))
                    .foregroundColor(.blue)
                
                Text("Kiosk Information")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.primary)
                
                Spacer()
            }
            
            VStack(spacing: 12) {
                InfoRow(label: "Kiosk ID", value: kioskId)
                InfoRow(label: "Status", value: "Waiting for Activation")
                InfoRow(label: "Version", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0")
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
        )
        .padding(.horizontal, 20)
    }
}

struct InfoRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(value)
                .font(.system(size: 16, weight: .semibold, design: .monospaced))
                .foregroundColor(.primary)
        }
    }
}

struct QRActivationView: View {
    @Binding var showScanner: Bool
    let onCodeScanned: (String) -> Void
    
    var body: some View {
        VStack(spacing: 24) {
            // QR scanner preview
            ZStack {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.systemGray6))
                    .frame(height: 200)
                
                VStack(spacing: 16) {
                    Image(systemName: "qrcode.viewfinder")
                        .font(.system(size: 64, weight: .light))
                        .foregroundColor(.secondary)
                    
                    Text("Tap to open QR scanner")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.secondary)
                }
            }
            .onTapGesture {
                showScanner = true
            }
            
            // Scan button
            Button(action: { showScanner = true }) {
                HStack {
                    Image(systemName: "camera.viewfinder")
                    Text("Scan QR Code")
                }
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.blue)
                )
            }
        }
    }
}

struct ManualActivationView: View {
    @Binding var activationCode: String
    let isActivating: Bool
    let onActivate: () -> Void
    
    var body: some View {
        VStack(spacing: 24) {
            VStack(alignment: .leading, spacing: 12) {
                Text("Activation Code")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.primary)
                
                TextField("Enter 6-8 character code", text: $activationCode)
                    .textFieldStyle(.roundedBorder)
                    .font(.system(size: 20, weight: .bold, design: .monospaced))
                    .autocapitalization(.allCharacters)
                    .disableAutocorrection(true)
                    .onChange(of: activationCode) { newValue in
                        activationCode = newValue.uppercased()
                    }
                
                Text("Enter the activation code provided by your administrator")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            Button(action: onActivate) {
                HStack {
                    if isActivating {
                        ProgressView()
                            .scaleEffect(0.8)
                    } else {
                        Image(systemName: "key")
                    }
                    Text(isActivating ? "Activating..." : "Activate Kiosk")
                }
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(activationCode.isEmpty || isActivating ? Color.gray : Color.green)
                )
            }
            .disabled(activationCode.isEmpty || isActivating)
        }
    }
}

struct ErrorMessageView: View {
    let message: String
    let onDismiss: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 20, weight: .medium))
                .foregroundColor(.red)
            
            Text(message)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.red)
                .multilineTextAlignment(.leading)
            
            Spacer()
            
            Button(action: onDismiss) {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.secondary)
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.red.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.red.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

struct QRScannerView: UIViewControllerRepresentable {
    let onResult: (Result<ScanResult, ScanError>) -> Void
    
    func makeUIViewController(context: Context) -> UIViewController {
        let hostingController = UIHostingController(
            rootView: CodeScannerView(completion: onResult)
        )
        return hostingController
    }
    
    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}

#Preview {
    ActivationModeView()
}
