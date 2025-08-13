//
//  AppCoordinator.swift
//  Nova Beacon
//
//  Main app coordinator with modern Apple UI design
//

import SwiftUI
import Combine

// MARK: - App State
enum AppState: String, CaseIterable {
    case launching = "launching"
    case serverConfiguration = "server_configuration"
    case activation = "activation"
    case active = "active"
    case error = "error"
    case maintenance = "maintenance"
    
    var displayName: String {
        switch self {
        case .launching:
            return "Starting Up"
        case .serverConfiguration:
            return "Server Setup"
        case .activation:
            return "Activation Required"
        case .active:
            return "Ready"
        case .error:
            return "Error"
        case .maintenance:
            return "Maintenance Mode"
        }
    }
}

// MARK: - App Coordinator
@MainActor
class AppCoordinator: ObservableObject {
    @Published var currentState: AppState = .launching
    @Published var connectionStatus = ConnectionStatus()
    @Published var showAdminPanel = false
    @Published var showFeedbackForm = false
    @Published var showServerConfig = false
    
    private var cancellables = Set<AnyCancellable>()
    private let kioskService = KioskService.shared
    private let configService = EnhancedConfigService.shared
    private let notificationManager = NotificationManager.shared
    
    static let shared = AppCoordinator()
    
    private init() {
        setupObservers()
        startInitialization()
    }
    
    // MARK: - Public Methods
    func retryActivation() {
        Task {
            await checkKioskStatus()
        }
    }
    
    func showServerConfiguration() {
        showServerConfig = true
    }
    
    func showAdminLogin() {
        showAdminPanel = true
    }
    
    func showFeedback() {
        showFeedbackForm = true
    }
    
    func handleDeepLink(url: URL) {
        // Handle activation URLs
        if url.scheme == "nova-beacon" && url.host == "activate" {
            if let code = url.queryParameters["code"] {
                Task {
                    await activateWithCode(code)
                }
            }
        }
    }
    
    // MARK: - Private Methods
    @MainActor
    private func setupObservers() {
        // Observe kiosk service state changes
        kioskService.$state
            .receive(on: DispatchQueue.main)
            .sink { [weak self] state in
                self?.handleKioskStateChange(state)
            }
            .store(in: &cancellables)
        
        // Observe connection retry requests
        NotificationCenter.default.publisher(for: .connectionRetryRequested)
            .sink { [weak self] _ in
                Task {
                    await self?.checkKioskStatus()
                }
            }
            .store(in: &cancellables)
        
        // Observe activation state changes
        configService.$activationState
            .receive(on: DispatchQueue.main)
            .sink { [weak self] state in
                self?.handleActivationStateChange(state)
            }
            .store(in: &cancellables)
    }
    
    private func startInitialization() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            Task {
                await self.performInitialSetup()
            }
        }
    }
    
    @MainActor
    private func performInitialSetup() async {
        currentState = .launching
        connectionStatus.updateStatus(.connecting)
        
        // Check if server URL is configured
        guard !APIConfig.baseURL.isEmpty && APIConfig.baseURL != "http://127.0.0.1:3000" else {
            currentState = .serverConfiguration
            connectionStatus.updateStatus(.disconnected, errorMessage: "Server not configured")
            return
        }
        
        // Set connection info
        connectionStatus.setServerInfo(url: APIConfig.baseURL, kioskId: kioskService.id)
        
        // Check kiosk status
        await checkKioskStatus()
    }
    
    private func checkKioskStatus() async {
        await MainActor.run {
            connectionStatus.updateStatus(.connecting)
        }
        
        do {
            // Test server connectivity
            try await testServerConnection()
            
            await MainActor.run {
                connectionStatus.updateStatus(.connected)
            }
            
            // Check activation status
            await configService.checkActivationStatus()
            await kioskService.checkActive()
            
        } catch {
            await MainActor.run {
                connectionStatus.updateStatus(.error, errorMessage: error.localizedDescription)
                currentState = .error
            }
            
            notificationManager.showError(
                title: "Connection Failed",
                message: error.localizedDescription,
                action: NotificationAction(title: "Retry") {
                    Task {
                        await self.checkKioskStatus()
                    }
                }
            )
        }
    }
    
    private func testServerConnection() async throws {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/v1/health") else {
            throw ConnectionError.invalidURL
        }
        
        let (_, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw ConnectionError.serverUnreachable
        }
    }
    
    private func handleKioskStateChange(_ state: ActivationState) {
        DispatchQueue.main.async {
            switch state {
            case .needsServerConfig:
                self.currentState = .serverConfiguration
            case .waitingForActivation:
                self.currentState = .activation
            case .active:
                self.currentState = .active
            case .error:
                self.currentState = .error
            case .checking:
                // Keep current state during checks
                break
            case .inactive:
                self.currentState = .maintenance
            }
        }
    }
    
    private func handleActivationStateChange(_ state: EnhancedConfigService.ActivationState) {
        DispatchQueue.main.async {
            switch state {
            case .notActivated, .expired, .revoked:
                if self.currentState != .serverConfiguration {
                    self.currentState = .activation
                }
            case .activated:
                self.currentState = .active
            case .activating:
                // Keep current state during activation
                break
            case .error:
                self.currentState = .error
            }
        }
    }
    
    private func activateWithCode(_ code: String) async {
        await MainActor.run {
            notificationManager.showInfo(title: "Activating Kiosk", message: "Processing activation code...")
        }
        
        let success = await kioskService.activateWithCode(code)
        
        await MainActor.run {
            if success {
                notificationManager.showSuccess(title: "Activation Successful", message: "Kiosk is now active")
                currentState = .active
            } else {
                notificationManager.showError(
                    title: "Activation Failed",
                    message: kioskService.statusMessage,
                    action: NotificationAction(title: "Try Again") {
                        self.showServerConfiguration()
                    }
                )
            }
        }
    }
}

// MARK: - URL Extensions
extension URL {
    var queryParameters: [String: String] {
        guard let components = URLComponents(url: self, resolvingAgainstBaseURL: false),
              let queryItems = components.queryItems else {
            return [:]
        }
        
        var parameters: [String: String] = [:]
        for item in queryItems {
            parameters[item.name] = item.value
        }
        return parameters
    }
}
