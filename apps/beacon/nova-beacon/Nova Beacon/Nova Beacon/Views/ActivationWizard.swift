//
//  ActivationWizard.swift
//  Nova Beacon
//
//  Apple-style onboarding wizard for first-time kiosk setup
//

import SwiftUI
import Foundation
import AVFoundation
import UIKit

struct ActivationWizard: View {
    @StateObject private var configManager = ConfigurationManager.shared
    @StateObject private var kioskController = KioskController.shared
    
    @State private var currentStep: WizardStep = .welcome
    @State private var isNavigatingForward = true // Track navigation direction
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
                return "Welcome to Nova Beacon"
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
                return "Let's get your kiosk setup!"
            case .serverConnection:
                return "Connect to your organization's Nova Universe server"
            case .activation:
                return "Enter your activation code or scan the QR code from the Nova Universe Portal"
            case .pinSetup:
                return "Create a secure PIN for admin access"
            case .roomNameSetup:
                return "Assign this kiosk to a room or location"
            case .confirmation:
                return "Your kiosk is ready to use and be deployed"
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
                                insertion: .move(edge: isNavigatingForward ? .trailing : .leading).combined(with: .opacity),
                                removal: .move(edge: isNavigatingForward ? .leading : .trailing).combined(with: .opacity)
                            ))
                            .animation(.easeInOut(duration: 0.5), value: currentStep)
                        
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
                serverURL = "https://localhost:3000"
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
                    goToPreviousStep()
                }
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(.blue)
                .frame(minWidth: 100)
                .disabled(isLoading)
            }
            
            Spacer()
            
            Button(action: {
                if currentStep == .confirmation {
                    completeSetup()
                } else {
                    goToNextStep()
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
            return isServerConnected ? "Continue Setup" : "Connect"
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
                            isNavigatingForward = true
                            withAnimation(.easeInOut(duration: 0.5)) {
                                currentStep = WizardStep(rawValue: currentStep.rawValue + 1) ?? currentStep
                            }
                        }
                    }
                } else if currentStep == .activation {
                    try await validateActivationCode()
                    await MainActor.run {
                        isLoading = false
                        if currentStep.rawValue < WizardStep.allCases.count - 1 {
                            isNavigatingForward = true
                            withAnimation(.easeInOut(duration: 0.5)) {
                                currentStep = WizardStep(rawValue: currentStep.rawValue + 1) ?? currentStep
                            }
                        }
                    }
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = error.localizedDescription
                    // Reset connection state on error
                    if currentStep == .serverConnection {
                        isServerConnected = false
                        connectionProgress = 0.0
                        connectionStatus = ""
                    }
                }
            }
            
            // For other steps, just proceed without error handling
            if currentStep != .serverConnection && currentStep != .activation {
                await MainActor.run {
                    isLoading = false
                    if currentStep.rawValue < WizardStep.allCases.count - 1 {
                        isNavigatingForward = true
                        withAnimation(.easeInOut(duration: 0.5)) {
                            currentStep = WizardStep(rawValue: currentStep.rawValue + 1) ?? currentStep
                        }
                    }
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
        
        // Simulate connection progress steps
        await MainActor.run {
            connectionProgress = 0.2
            connectionStatus = "Resolving server address..."
        }
        try await Task.sleep(for: .milliseconds(300))
        
        await MainActor.run {
            connectionProgress = 0.4
            connectionStatus = "Establishing connection..."
        }
        try await Task.sleep(for: .milliseconds(300))
        
        await MainActor.run {
            connectionProgress = 0.6
            connectionStatus = "Authenticating..."
        }
        try await Task.sleep(for: .milliseconds(300))
        
        await MainActor.run {
            connectionProgress = 0.8
            connectionStatus = "Fetching server configuration..."
        }
        try await Task.sleep(for: .milliseconds(300))
        
        // Actually attempt to fetch server info
        try await fetchServerInfo()
        
        // Only update to success if fetchServerInfo didn't throw an error
        await MainActor.run {
            connectionProgress = 1.0
            connectionStatus = "Connection successful!"
            isServerConnected = true
        }
        
        // Final status update with organization name
        try await Task.sleep(for: .milliseconds(500))
        await MainActor.run {
            connectionStatus = "Connected to \(serverInfo?.organizationName ?? "server")"
        }
    }
    
    private func fetchServerInfo() async throws {
        guard let url = URL(string: "\(serverURL)/api/v2/status") else {
            throw NSError(domain: "ActivationWizard", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid server URL format"])
        }
        
        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw NSError(domain: "ActivationWizard", code: 2, userInfo: [NSLocalizedDescriptionKey: "Invalid server response"])
            }
            
            if httpResponse.statusCode == 404 {
                throw NSError(domain: "ActivationWizard", code: 3, userInfo: [NSLocalizedDescriptionKey: "Server found but Nova Universe API not available. Check if the server is running Nova Universe."])
            } else if httpResponse.statusCode != 200 {
                throw NSError(domain: "ActivationWizard", code: 4, userInfo: [NSLocalizedDescriptionKey: "Server responded with error (HTTP \(httpResponse.statusCode))"])
            }
            
            if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                await MainActor.run {
                    // Map generic status endpoint to defaults; real server-info should be fetched later
                    serverInfo = ServerInfo(
                        organizationName: json["organizationName"] as? String ?? "Your Organization",
                        minPinLength: 4,
                        maxPinLength: 8,
                        logoUrl: nil,
                        serverVersion: nil
                    )
                    
                    // Save server URL to configuration
                    configManager.setServerConfiguration(ServerConfiguration(baseURL: serverURL))
                }
            } else {
                throw NSError(domain: "ActivationWizard", code: 5, userInfo: [NSLocalizedDescriptionKey: "Invalid response format from server"])
            }
        } catch let error as NSError where error.domain == "ActivationWizard" {
            // Re-throw our custom errors
            throw error
        } catch {
            // Handle network errors with more specific messages
            if error.localizedDescription.contains("could not connect") || error.localizedDescription.contains("network connection") {
                throw NSError(domain: "ActivationWizard", code: 6, userInfo: [NSLocalizedDescriptionKey: "Could not connect to server. Please check the URL and your network connection."])
            } else if error.localizedDescription.contains("timeout") {
                throw NSError(domain: "ActivationWizard", code: 7, userInfo: [NSLocalizedDescriptionKey: "Connection timed out. Please check if the server is reachable."])
            } else {
                throw NSError(domain: "ActivationWizard", code: 8, userInfo: [NSLocalizedDescriptionKey: "Network error: \(error.localizedDescription)"])
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
            isNavigatingForward = false
            withAnimation(.easeInOut(duration: 0.5)) {
                currentStep = WizardStep(rawValue: currentStep.rawValue - 1) ?? currentStep
            }
        }
    }
    
    private func completeSetup() {
        isLoading = true
        errorMessage = nil
        
        Task {
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
        }
    }
}

// MARK: - Welcome Step
struct WelcomeStepView: View {
    var body: some View {
        VStack(spacing: 32) {
            // Use the same gradient circle design as the app icon
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
                
                Image(systemName: "desktopcomputer")
                    .font(.system(size: 48, weight: .light))
                    .foregroundColor(.white)
            }
            .symbolEffect(.bounce, value: true)
            
            VStack(spacing: 12) {
                Text("Welcome to Nova Universe")
                    .font(.system(size: 42, weight: .light, design: .rounded))
                    .multilineTextAlignment(.center)
                
                Text("Ready to get started?")
                    .font(.system(size: 28, weight: .medium, design: .rounded))
                    .foregroundColor(.blue)
                    .multilineTextAlignment(.center)
                
                Text("Let's setup Nova Beacon for your organanization")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)
            }
            
            Spacer()
                .frame(height: 20)
            
            VStack(alignment: .leading, spacing: 16) {
                FeatureRow(icon: "server.rack", text: "Connect to your Nova Universe Server")
                FeatureRow(icon: "qrcode.viewfinder", text: "Activate your kiosk")
                FeatureRow(icon: "shield.fill", text: "Secure admin access with PIN")
                FeatureRow(icon: "location.fill", text: "Configure room assignment")
                FeatureRow(icon: "checkmark.circle.fill", text: "Prepare for deployment")
            }
            .padding(.horizontal, 40)
            .frame(maxWidth: .infinity, alignment: .center)
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(alignment: .center, spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .medium))
                .foregroundColor(.blue)
                .frame(width: 24, height: 24)
                .contentShape(Rectangle())
            
            Text(text)
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(.primary)
                .multilineTextAlignment(.leading)
            
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
    @State private var hasPermission = false
    @State private var showingPermissionAlert = false
    
    var body: some View {
        NavigationView {
            ZStack {
                if hasPermission {
                    QRCodeScannerCameraView(
                        activationCode: $activationCode,
                        isPresented: $isPresented
                    )
                } else {
                    VStack(spacing: 24) {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 64))
                            .foregroundColor(.gray)
                        
                        Text("Camera Access Required")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("Please allow camera access to scan QR codes")
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                        
                        Button("Request Permission") {
                            requestCameraPermission()
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.blue)
                        .cornerRadius(12)
                    }
                    .padding()
                }
            }
            .navigationTitle("Scan QR Code")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        isPresented = false
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Enter Code") {
                        // Allow manual code entry
                        activationCode = ""
                        isPresented = false
                    }
                }
            }
        }
        .onAppear {
            checkCameraPermission()
        }
        .alert("Camera Permission Denied", isPresented: $showingPermissionAlert) {
            Button("Settings") {
                if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(settingsUrl)
                }
            }
            Button("Cancel", role: .cancel) {
                isPresented = false
            }
        } message: {
            Text("Please enable camera access in Settings to scan QR codes")
        }
    }
    
    private func checkCameraPermission() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            hasPermission = true
        case .notDetermined:
            requestCameraPermission()
        case .denied, .restricted:
            hasPermission = false
        @unknown default:
            hasPermission = false
        }
    }
    
    private func requestCameraPermission() {
        AVCaptureDevice.requestAccess(for: .video) { granted in
            DispatchQueue.main.async {
                if granted {
                    hasPermission = true
                } else {
                    showingPermissionAlert = true
                }
            }
        }
    }
}

// MARK: - Camera View for QR Scanning
struct QRCodeScannerCameraView: UIViewControllerRepresentable {
    typealias Context = UIViewControllerRepresentableContext<QRCodeScannerCameraView>
    
    @Binding var activationCode: String
    @Binding var isPresented: Bool
    
    func makeUIViewController(context: Context) -> QRCodeScannerViewController {
        let controller = QRCodeScannerViewController()
        controller.delegate = context.coordinator
        return controller
    }
    
    func updateUIViewController(_ uiViewController: QRCodeScannerViewController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, QRCodeScannerDelegate {
        let parent: QRCodeScannerCameraView
        
        init(_ parent: QRCodeScannerCameraView) {
            self.parent = parent
        }
        
        func didScanCode(_ code: String) {
            parent.activationCode = code
            parent.isPresented = false
        }
        
        func didFailWithError(_ error: Error) {
            print("QR Scanner error: \(error.localizedDescription)")
        }
    }
}

// MARK: - QR Scanner Delegate Protocol
protocol QRCodeScannerDelegate: AnyObject {
    func didScanCode(_ code: String)
    func didFailWithError(_ error: Error)
}

// MARK: - QR Scanner View Controller
class QRCodeScannerViewController: UIViewController {
    weak var delegate: QRCodeScannerDelegate?
    
    private var captureSession: AVCaptureSession!
    private var previewLayer: AVCaptureVideoPreviewLayer!
    private var scannerOverlay: UIView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupCamera()
        setupUI()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        startScanning()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        stopScanning()
    }
    
    private func setupCamera() {
        captureSession = AVCaptureSession()
        
        guard let videoCaptureDevice = AVCaptureDevice.default(for: .video) else {
            delegate?.didFailWithError(NSError(domain: "QRScanner", code: 1, userInfo: [NSLocalizedDescriptionKey: "Camera not available"]))
            return
        }
        
        do {
            let videoInput = try AVCaptureDeviceInput(device: videoCaptureDevice)
            
            if captureSession.canAddInput(videoInput) {
                captureSession.addInput(videoInput)
            } else {
                delegate?.didFailWithError(NSError(domain: "QRScanner", code: 2, userInfo: [NSLocalizedDescriptionKey: "Could not add video input"]))
                return
            }
            
            let metadataOutput = AVCaptureMetadataOutput()
            
            if captureSession.canAddOutput(metadataOutput) {
                captureSession.addOutput(metadataOutput)
                
                metadataOutput.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
                metadataOutput.metadataObjectTypes = [.qr]
            } else {
                delegate?.didFailWithError(NSError(domain: "QRScanner", code: 3, userInfo: [NSLocalizedDescriptionKey: "Could not add metadata output"]))
                return
            }
            
            previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
            previewLayer.frame = view.layer.bounds
            previewLayer.videoGravity = .resizeAspectFill
            view.layer.addSublayer(previewLayer)
            
        } catch {
            delegate?.didFailWithError(error)
        }
    }
    
    private func setupUI() {
        // Create scanning overlay
        scannerOverlay = UIView(frame: view.bounds)
        scannerOverlay.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        view.addSubview(scannerOverlay)
        
        // Create clear scanning area
        let scanAreaSize: CGFloat = 250
        let scanArea = CGRect(
            x: (view.bounds.width - scanAreaSize) / 2,
            y: (view.bounds.height - scanAreaSize) / 2,
            width: scanAreaSize,
            height: scanAreaSize
        )
        
        let path = UIBezierPath(rect: scannerOverlay.bounds)
        path.append(UIBezierPath(roundedRect: scanArea, cornerRadius: 12).reversing())
        
        let maskLayer = CAShapeLayer()
        maskLayer.path = path.cgPath
        scannerOverlay.layer.mask = maskLayer
        
        // Add corner indicators
        addCornerIndicators(to: scanArea)
        
        // Add instruction label
        let instructionLabel = UILabel()
        instructionLabel.text = "Position the QR code within the frame"
        instructionLabel.textColor = .white
        instructionLabel.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        instructionLabel.textAlignment = .center
        instructionLabel.numberOfLines = 0
        instructionLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(instructionLabel)
        
        NSLayoutConstraint.activate([
            instructionLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            instructionLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            instructionLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            instructionLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20)
        ])
    }
    
    private func addCornerIndicators(to scanArea: CGRect) {
        let cornerLength: CGFloat = 20
        let cornerWidth: CGFloat = 3
        let cornerColor = UIColor.systemBlue
        
        // Top-left
        let topLeft = UIView()
        topLeft.backgroundColor = cornerColor
        topLeft.frame = CGRect(x: scanArea.minX, y: scanArea.minY, width: cornerLength, height: cornerWidth)
        view.addSubview(topLeft)
        
        let topLeftVertical = UIView()
        topLeftVertical.backgroundColor = cornerColor
        topLeftVertical.frame = CGRect(x: scanArea.minX, y: scanArea.minY, width: cornerWidth, height: cornerLength)
        view.addSubview(topLeftVertical)
        
        // Top-right
        let topRight = UIView()
        topRight.backgroundColor = cornerColor
        topRight.frame = CGRect(x: scanArea.maxX - cornerLength, y: scanArea.minY, width: cornerLength, height: cornerWidth)
        view.addSubview(topRight)
        
        let topRightVertical = UIView()
        topRightVertical.backgroundColor = cornerColor
        topRightVertical.frame = CGRect(x: scanArea.maxX - cornerWidth, y: scanArea.minY, width: cornerWidth, height: cornerLength)
        view.addSubview(topRightVertical)
        
        // Bottom-left
        let bottomLeft = UIView()
        bottomLeft.backgroundColor = cornerColor
        bottomLeft.frame = CGRect(x: scanArea.minX, y: scanArea.maxY - cornerWidth, width: cornerLength, height: cornerWidth)
        view.addSubview(bottomLeft)
        
        let bottomLeftVertical = UIView()
        bottomLeftVertical.backgroundColor = cornerColor
        bottomLeftVertical.frame = CGRect(x: scanArea.minX, y: scanArea.maxY - cornerLength, width: cornerWidth, height: cornerLength)
        view.addSubview(bottomLeftVertical)
        
        // Bottom-right
        let bottomRight = UIView()
        bottomRight.backgroundColor = cornerColor
        bottomRight.frame = CGRect(x: scanArea.maxX - cornerLength, y: scanArea.maxY - cornerWidth, width: cornerLength, height: cornerWidth)
        view.addSubview(bottomRight)
        
        let bottomRightVertical = UIView()
        bottomRightVertical.backgroundColor = cornerColor
        bottomRightVertical.frame = CGRect(x: scanArea.maxX - cornerWidth, y: scanArea.maxY - cornerLength, width: cornerWidth, height: cornerLength)
        view.addSubview(bottomRightVertical)
    }
    
    private func startScanning() {
        if !captureSession.isRunning {
            DispatchQueue.global(qos: .userInitiated).async {
                self.captureSession.startRunning()
            }
        }
    }
    
    private func stopScanning() {
        if captureSession.isRunning {
            captureSession.stopRunning()
        }
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = view.layer.bounds
        scannerOverlay?.frame = view.bounds
    }
}

// MARK: - Metadata Output Delegate
extension QRCodeScannerViewController: AVCaptureMetadataOutputObjectsDelegate {
    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        if let metadataObject = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
           let stringValue = metadataObject.stringValue {
            
            // Provide haptic feedback
            let impactFeedback = UIImpactFeedbackGenerator(style: .light)
            impactFeedback.impactOccurred()
            
            // Stop scanning to prevent multiple reads
            stopScanning()
            
            delegate?.didScanCode(stringValue)
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
