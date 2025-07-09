//
//  ActivationWizard.swift
//  CueIT Kiosk
//
//  Apple-style onboarding wizard for first-time kiosk setup
//

import SwiftUI
import Foundation

struct ActivationWizard: View {
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var kioskController = KioskController.shared
    
    @State private var currentStep: WizardStep = .welcome
    @State private var serverURL = ""
    @State private var activationCode = ""
    @State private var adminPIN = ""
    @State private var roomName = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var serverInfo: ServerInfo?
    @State private var showQRScanner = false
    @State private var connectionProgress: Double = 0.0
    @State private var connectionStatus = ""
    @State private var isServerConnected = false
    
    struct ServerInfo {
        let organizationName: String
        let minPinLength: Int
        let maxPinLength: Int
        let logoUrl: String?
        let serverVersion: String?
    }
    
    enum WizardStep: Int, CaseIterable {
        case welcome = 0
        case serverConnection = 1
        case activation = 2
        case pinSetup = 3
        case roomNameSetup = 4
        case confirmation = 5
        
        var title: String {
            switch self {
            case .welcome:
                return "Welcome to CueIT Kiosk"
            case .serverConnection:
                return "Server Connection"
            case .activation:
                return "Kiosk Activation"
            case .pinSetup:
                return "Admin PIN Setup"
            case .roomNameSetup:
                return "Room Configuration"
            case .confirmation:
                return "Setup Complete"
            }
        }
        
        var subtitle: String {
            switch self {
            case .welcome:
                return "Let's get your kiosk set up for your organization"
            case .serverConnection:
                return "Connect to your organization's IT support system"
            case .activation:
                return "Enter your activation code or scan the QR code from the admin portal"
            case .pinSetup:
                return "Create a secure PIN for admin access"
            case .roomNameSetup:
                return "Assign this kiosk to a room or location"
            case .confirmation:
                return "Your kiosk is ready to use"
            }
        }
        
        var systemImage: String {
            switch self {
            case .welcome:
                return "hand.wave.fill"
            case .serverConnection:
                return "externaldrive.connected.to.line.below.fill"
            case .activation:
                return "qrcode.viewfinder"
            case .pinSetup:
                return "lock.shield.fill"
            case .roomNameSetup:
                return "location.fill"
            case .confirmation:
                return "checkmark.circle.fill"
            }
        }
    }
    
    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                ZStack {
                    // Background gradient
                    LinearGradient(
                        colors: [
                            Color(.systemBlue).opacity(0.1),
                            Color.primary.opacity(0.05)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .ignoresSafeArea()
                    
                    VStack(spacing: 0) {
                        // Progress indicator
                        progressIndicator
                            .padding(.top, 20)
                        
                        Spacer()
                        
                        // Main content
                        currentStepView
                            .transition(.asymmetric(
                                insertion: .move(edge: .trailing).combined(with: .opacity),
                                removal: .move(edge: .leading).combined(with: .opacity)
                            ))
                        
                        Spacer()
                        
                        // Navigation buttons
                        navigationButtons
                            .padding(.bottom, 40)
                    }
                    .padding(.horizontal, 40)
                }
            }
        }
        .navigationBarBackButtonHidden(true)
        .onAppear {
            // Set a default server URL for development
            if serverURL.isEmpty {
                serverURL = "http://localhost:3000"
            }
        }
    }
    
    // MARK: - Progress Indicator
    private var progressIndicator: some View {
        HStack(spacing: 8) {
            ForEach(WizardStep.allCases, id: \.rawValue) { step in
                Circle()
                    .fill(step.rawValue <= currentStep.rawValue ? Color.blue : Color.gray.opacity(0.3))
                    .frame(width: 8, height: 8)
                    .scaleEffect(step == currentStep ? 1.2 : 1.0)
                    .animation(.easeInOut(duration: 0.3), value: currentStep)
            }
        }
    }
    
    // MARK: - Current Step View
    @ViewBuilder
    private var currentStepView: some View {
        switch currentStep {
        case .welcome:
            WelcomeStepView()
        case .serverConnection:
            ServerConnectionStepView(
                serverURL: $serverURL,
                errorMessage: $errorMessage,
                connectionProgress: $connectionProgress,
                connectionStatus: $connectionStatus,
                isServerConnected: $isServerConnected
            )
        case .activation:
            ActivationStepView(
                activationCode: $activationCode,
                errorMessage: $errorMessage,
                showQRScanner: $showQRScanner
            )
        case .pinSetup:
            PINSetupStepView(
                adminPIN: $adminPIN,
                errorMessage: $errorMessage,
                serverInfo: serverInfo
            )
        case .roomNameSetup:
            RoomNameStepView(roomName: $roomName, errorMessage: $errorMessage)
        case .confirmation:
            ConfirmationStepView(
                serverURL: serverURL,
                roomName: roomName,
                organizationName: serverInfo?.organizationName ?? "Your Organization"
            )
        }
    }
    
    // MARK: - Navigation Buttons
    private var navigationButtons: some View {
        HStack(spacing: 20) {
            if currentStep.rawValue > 0 {
                Button("Back") {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        goToPreviousStep()
                    }
                }
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(.blue)
                .frame(minWidth: 100)
                .disabled(isLoading)
            }
            
            Spacer()
            
            Button(action: {
                withAnimation(.easeInOut(duration: 0.3)) {
                    if currentStep == .confirmation {
                        completeSetup()
                    } else {
                        goToNextStep()
                    }
                }
            }) {
                HStack(spacing: 8) {
                    if isLoading {
                        ProgressView()
                            .scaleEffect(0.8)
                            .tint(.white)
                    }
                    
                    Text(currentStep == .confirmation ? "Complete Setup" : nextButtonText)
                        .font(.system(size: 18, weight: .semibold))
                }
                .foregroundColor(.white)
                .frame(minWidth: 140, minHeight: 50)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(canProceed ? Color.blue : Color.gray)
                )
            }
            .disabled(!canProceed || isLoading)
        }
    }
    
    // MARK: - Navigation Logic
    private var canProceed: Bool {
        switch currentStep {
        case .welcome:
            return true
        case .serverConnection:
            return !serverURL.isEmpty && serverURL.contains("://")
        case .activation:
            return !activationCode.isEmpty && activationCode.count >= 6
        case .pinSetup:
            let minLength = serverInfo?.minPinLength ?? 4
            let maxLength = serverInfo?.maxPinLength ?? 8
            return adminPIN.count >= minLength && adminPIN.count <= maxLength
        case .roomNameSetup:
            return !roomName.isEmpty
        case .confirmation:
            return true
        }
    }
    
    private var nextButtonText: String {
        switch currentStep {
        case .welcome:
            return "Get Started"
        case .serverConnection:
            return isServerConnected ? "Continue" : "Test Connection"
        case .activation:
            return "Activate Kiosk"
        case .pinSetup:
            return "Set PIN"
        case .roomNameSetup:
            return "Continue"
        case .confirmation:
            return "Complete Setup"
        }
    }
    
    private func goToNextStep() {
        errorMessage = nil
        isLoading = true
        
        Task {
            do {
                // Special handling for server connection step
                if currentStep == .serverConnection {
                    try await testServerConnection()
                    // Only proceed if connection was successful
                    await MainActor.run {
                        isLoading = false
                        if isServerConnected && currentStep.rawValue < WizardStep.allCases.count - 1 {
                            currentStep = WizardStep(rawValue: currentStep.rawValue + 1) ?? currentStep
                        }
                    }
                } else if currentStep == .activation {
                    try await validateActivationCode()
                    await MainActor.run {
                        isLoading = false
                        if currentStep.rawValue < WizardStep.allCases.count - 1 {
                            currentStep = WizardStep(rawValue: currentStep.rawValue + 1) ?? currentStep
                        }
                    }
                } else {
                    // For other steps, just proceed
                    await MainActor.run {
                        isLoading = false
                        if currentStep.rawValue < WizardStep.allCases.count - 1 {
                            currentStep = WizardStep(rawValue: currentStep.rawValue + 1) ?? currentStep
                        }
                    }
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    private func testServerConnection() async throws {
        await MainActor.run {
            connectionProgress = 0.0
            connectionStatus = "Connecting to server..."
            isServerConnected = false
        }
        
        // Simulate connection progress
        for i in 1...5 {
            await MainActor.run {
                connectionProgress = Double(i) / 5.0
                switch i {
                case 1: connectionStatus = "Resolving server address..."
                case 2: connectionStatus = "Establishing connection..."
                case 3: connectionStatus = "Authenticating..."
                case 4: connectionStatus = "Fetching server configuration..."
                case 5: connectionStatus = "Connection successful!"
                default: break
                }
            }
            try await Task.sleep(for: .milliseconds(500))
        }
        
        try await fetchServerInfo()
        
        await MainActor.run {
            isServerConnected = true
            connectionStatus = "Connected to \(serverInfo?.organizationName ?? "server")"
        }
    }
    
    private func fetchServerInfo() async throws {
        guard let url = URL(string: "\(serverURL)/api/server-info") else {
            throw NSError(domain: "ActivationWizard", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid server URL"])
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NSError(domain: "ActivationWizard", code: 2, userInfo: [NSLocalizedDescriptionKey: "Unable to connect to server"])
        }
        
        if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
            await MainActor.run {
                serverInfo = ServerInfo(
                    organizationName: json["organizationName"] as? String ?? "Your Organization",
                    minPinLength: json["minPinLength"] as? Int ?? 4,
                    maxPinLength: json["maxPinLength"] as? Int ?? 8,
                    logoUrl: json["logoUrl"] as? String,
                    serverVersion: json["serverVersion"] as? String
                )
                
                // Store organization name for future use (e.g., deactivation screen)
                if let orgName = json["organizationName"] as? String {
                    UserDefaults.standard.set(orgName, forKey: "organizationName")
                }
                
                // Save server URL to configuration
                configManager.setServerConfiguration(ServerConfiguration(baseURL: serverURL))
            }
        }
    }
    
    private func validateActivationCode() async throws {
        // For demo purposes, accept any 6+ character code
        // In production, this would validate against the server
        if activationCode.count < 6 {
            throw NSError(domain: "ActivationWizard", code: 5, userInfo: [NSLocalizedDescriptionKey: "Activation code must be at least 6 characters"])
        }
        
        // Simulate validation delay
        try await Task.sleep(for: .milliseconds(1000))
    }
    
    private func goToPreviousStep() {
        errorMessage = nil
        
        if currentStep.rawValue > 0 {
            currentStep = WizardStep(rawValue: currentStep.rawValue - 1) ?? currentStep
        }
    }
    
    private func completeSetup() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                // Save configuration
                await configManager.updateServerURL(serverURL)
                await configManager.updateAdminPIN(adminPIN)
                await configManager.updateRoomName(roomName)
                
                // Mark setup as complete
                await MainActor.run {
                    UserDefaults.standard.set(true, forKey: "isSetupComplete")
                    UserDefaults.standard.set(true, forKey: "isActivated")
                    isLoading = false
                    kioskController.transitionTo(.activated)
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = "Setup failed: \(error.localizedDescription)"
                }
            }
        }
    }
}

// MARK: - Welcome Step
struct WelcomeStepView: View {
    var body: some View {
        VStack(spacing: 32) {
            Image(systemName: "hand.wave.fill")
                .font(.system(size: 80, weight: .light))
                .foregroundStyle(.blue)
                .symbolEffect(.bounce, value: true)
            
            VStack(spacing: 12) {
                Text("Welcome to CueIT Kiosk")
                    .font(.system(size: 42, weight: .light, design: .rounded))
                    .multilineTextAlignment(.center)
                
                Text("Let's get your kiosk set up for your organization")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)
            }
            
            VStack(alignment: .leading, spacing: 16) {
                FeatureRow(icon: "server.rack", text: "Connect to your IT support system")
                FeatureRow(icon: "shield.fill", text: "Secure admin access with PIN")
                FeatureRow(icon: "location.fill", text: "Configure room assignment")
                FeatureRow(icon: "checkmark.circle.fill", text: "Ready to help your team")
            }
            .padding(.horizontal, 40)
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .medium))
                .foregroundColor(.blue)
                .frame(width: 24)
            
            Text(text)
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(.primary)
            
            Spacer()
        }
    }
}

// MARK: - Server Connection Step
struct ServerConnectionStepView: View {
    @Binding var serverURL: String
    @Binding var errorMessage: String?
    @Binding var connectionProgress: Double
    @Binding var connectionStatus: String
    @Binding var isServerConnected: Bool
    
    var body: some View {
        StepContainer(
            icon: "externaldrive.connected.to.line.below.fill",
            title: "Server Connection",
            subtitle: "Enter your organization's IT support server URL"
        ) {
            VStack(spacing: 24) {
                TextField("Server URL", text: $serverURL)
                    .textFieldStyle(ModernTextFieldStyle())
                    .autocorrectionDisabled()
                    .textContentType(.URL)
                    .disabled(isServerConnected)
                    .onChange(of: serverURL) { _, _ in
                        // Reset connection state when URL changes
                        isServerConnected = false
                        connectionProgress = 0.0
                        connectionStatus = ""
                        errorMessage = nil
                    }
                
                Text("Example: https://support.company.com or http://192.168.1.100:3000")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                
                // Connection progress
                if connectionProgress > 0 {
                    VStack(spacing: 12) {
                        ProgressView(value: connectionProgress)
                            .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                        
                        Text(connectionStatus)
                            .font(.caption)
                            .foregroundColor(.blue)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.vertical, 8)
                }
                
                // Connection status
                if isServerConnected {
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Connected successfully")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                    .padding(.vertical, 8)
                } else if connectionProgress == 0 && !serverURL.isEmpty && serverURL.contains("://") {
                    HStack(spacing: 8) {
                        Image(systemName: "info.circle.fill")
                            .foregroundColor(.blue)
                        Text("Ready to test connection")
                            .font(.caption)
                            .foregroundColor(.blue)
                    }
                    .padding(.vertical, 8)
                }
                
                if let error = errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                }
            }
        }
    }
}

// MARK: - Activation Step
struct ActivationStepView: View {
    @Binding var activationCode: String
    @Binding var errorMessage: String?
    @Binding var showQRScanner: Bool
    
    var body: some View {
        StepContainer(
            icon: "qrcode.viewfinder",
            title: "Kiosk Activation",
            subtitle: "Enter your activation code or scan the QR code from the admin portal"
        ) {
            VStack(spacing: 24) {
                // Manual code entry
                VStack(spacing: 16) {
                    TextField("Activation Code", text: $activationCode)
                        .textFieldStyle(ModernTextFieldStyle())
                        .autocorrectionDisabled()
                        .textContentType(.oneTimeCode)
                        .onChange(of: activationCode) { _, newValue in
                            // Convert to uppercase and limit to 8 characters
                            activationCode = String(newValue.uppercased().prefix(8))
                        }
                    
                    Text("Enter the 6-8 character activation code from your admin portal")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                
                // Divider
                HStack {
                    Rectangle()
                        .fill(Color.secondary.opacity(0.3))
                        .frame(height: 1)
                    
                    Text("OR")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding(.horizontal, 16)
                    
                    Rectangle()
                        .fill(Color.secondary.opacity(0.3))
                        .frame(height: 1)
                }
                
                // QR Scanner button
                Button(action: {
                    showQRScanner = true
                }) {
                    HStack(spacing: 12) {
                        Image(systemName: "qrcode.viewfinder")
                            .font(.system(size: 20, weight: .medium))
                        
                        Text("Scan QR Code")
                            .font(.system(size: 16, weight: .medium))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.blue)
                    )
                }
                
                if let error = errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                }
            }
        }
        .sheet(isPresented: $showQRScanner) {
            QRCodeScannerView(
                activationCode: $activationCode,
                isPresented: $showQRScanner
            )
        }
    }
}

// MARK: - QR Code Scanner
struct QRCodeScannerView: View {
    @Binding var activationCode: String
    @Binding var isPresented: Bool
    
    var body: some View {
        NavigationView {
            VStack {
                Text("QR Code Scanner")
                    .font(.largeTitle)
                    .padding()
                
                Text("Position the QR code from your admin portal within the frame")
                    .multilineTextAlignment(.center)
                    .padding()
                
                // Placeholder for QR scanner
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.blue, lineWidth: 2)
                    .frame(width: 250, height: 250)
                    .overlay(
                        VStack {
                            Image(systemName: "qrcode.viewfinder")
                                .font(.system(size: 64))
                                .foregroundColor(.blue)
                            
                            Text("QR Scanner View")
                                .foregroundColor(.secondary)
                        }
                    )
                
                Spacer()
                
                // Demo button for testing
                Button("Use Demo Code (ABC123)") {
                    activationCode = "ABC123"
                    isPresented = false
                }
                .foregroundColor(.blue)
                .padding()        }
        .navigationTitle("Scan QR Code")
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .automatic) {
                Button("Done") {
                    isPresented = false
                }
            }
        }
        }
    }
}

// MARK: - PIN Setup Step
struct PINSetupStepView: View {
    @Binding var adminPIN: String
    @Binding var errorMessage: String?
    let serverInfo: ActivationWizard.ServerInfo?
    
    private var pinLengthText: String {
        if let info = serverInfo {
            if info.minPinLength == info.maxPinLength {
                return "Create a \(info.minPinLength)-digit PIN for admin access"
            } else {
                return "Create a \(info.minPinLength)-\(info.maxPinLength) digit PIN for admin access"
            }
        }
        return "Create a secure PIN for admin access"
    }
    
    var body: some View {
        StepContainer(
            icon: "lock.shield.fill",
            title: "Admin PIN Setup",
            subtitle: pinLengthText
        ) {
            VStack(spacing: 20) {
                SecureField("Admin PIN", text: $adminPIN)
                    .textFieldStyle(ModernTextFieldStyle())
                    .onChange(of: adminPIN) { _, newValue in
                        // Limit to max digits and only allow numbers
                        let filtered = newValue.filter { $0.isNumber }
                        let maxLength = serverInfo?.maxPinLength ?? 8
                        adminPIN = String(filtered.prefix(maxLength))
                    }
                
                VStack(spacing: 8) {
                    Text("This PIN will be used to access admin settings on this kiosk")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                    
                    if let info = serverInfo {
                        HStack(spacing: 16) {
                            Text("Requirements: \(info.minPinLength)-\(info.maxPinLength) digits")
                                .font(.caption2)
                                .foregroundColor(.blue)
                            
                            if adminPIN.count >= info.minPinLength && adminPIN.count <= info.maxPinLength {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                                    .font(.caption)
                            }
                        }
                    }
                }
                
                if let error = errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                }
            }
        }
    }
}

// MARK: - Room Name Step
struct RoomNameStepView: View {
    @Binding var roomName: String
    @Binding var errorMessage: String?
    
    var body: some View {
        StepContainer(
            icon: "location.fill",
            title: "Room Configuration",
            subtitle: "Assign this kiosk to a room or location"
        ) {
            VStack(spacing: 20) {
                TextField("Room/Location Name", text: $roomName)
                    .textFieldStyle(ModernTextFieldStyle())
                
                Text("Examples: Conference Room A, Main Lobby, 2nd Floor IT Desk")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                
                if let error = errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                }
            }
        }
    }
}

// MARK: - Confirmation Step
struct ConfirmationStepView: View {
    let serverURL: String
    let roomName: String
    let organizationName: String
    
    var body: some View {
        StepContainer(
            icon: "checkmark.circle.fill",
            title: "Setup Complete",
            subtitle: "Your kiosk is ready to help your team"
        ) {
            VStack(spacing: 24) {
                VStack(spacing: 16) {
                    ConfigSummaryRow(label: "Organization", value: organizationName)
                    ConfigSummaryRow(label: "Server", value: serverURL)
                    ConfigSummaryRow(label: "Location", value: roomName)
                }
                .padding(20)
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                
                Text("Tap 'Complete Setup' to start using your kiosk")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
    }
}

struct ConfigSummaryRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(value)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.primary)
                .lineLimit(1)
        }
    }
}

// MARK: - Step Container
struct StepContainer<Content: View>: View {
    let icon: String
    let title: String
    let subtitle: String
    let content: Content
    
    init(icon: String, title: String, subtitle: String, @ViewBuilder content: () -> Content) {
        self.icon = icon
        self.title = title
        self.subtitle = subtitle
        self.content = content()
    }
    
    var body: some View {
        VStack(spacing: 32) {
            VStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 64, weight: .light))
                    .foregroundStyle(.blue)
                
                VStack(spacing: 8) {
                    Text(title)
                        .font(.system(size: 32, weight: .light, design: .rounded))
                        .multilineTextAlignment(.center)
                    
                    Text(subtitle)
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 20)
                }
            }
            
            content
                .frame(maxWidth: 400)
        }
    }
}

// MARK: - Modern Text Field Style
struct ModernTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .font(.system(size: 18, weight: .medium))
            .padding(16)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
            )
    }
}

// MARK: - Preview
struct ActivationWizard_Previews: PreviewProvider {
    static var previews: some View {
        ActivationWizard()
    }
}
