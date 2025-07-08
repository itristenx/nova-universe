//
//  KioskController.swift
//  CueIT Kiosk
//
//  Central controller for the kiosk application
//  Manages state transitions and coordination between components
//

import SwiftUI
import Combine

@MainActor
class KioskController: ObservableObject {
    static let shared = KioskController()
    
    // MARK: - Published Properties
    @Published var currentState: KioskState = .initializing
    @Published var showSettings = false
    @Published var showNotification = false
    @Published var notificationMessage = ""
    @Published var kioskInfo: KioskInfo?
    @Published var isActivated = false
    
    // MARK: - Dependencies
    private let configManager = ConfigurationManager.shared
    private let connectionManager = ConnectionManager.shared
    private let authManager = AuthenticationManager.shared
    
    private var cancellables = Set<AnyCancellable>()
    
    private init() {
        setupBindings()
    }
    
    // MARK: - Public Methods
    func initialize() {
        currentState = .initializing
        
        Task {
            await performInitialization()
        }
    }
    
    func openSettings() {
        self.showSettings = true
    }
    
    func closeSettings() {
        self.showSettings = false
    }
    
    func showNotification(message: String) {
        notificationMessage = message
        showNotification = true
        
        // Auto-hide after 3 seconds
        Task {
            try? await Task.sleep(for: .seconds(3))
            hideNotification()
        }
    }
    
    func hideNotification() {
        showNotification = false
    }
    
    func transitionTo(_ state: KioskState) {
        withAnimation(.easeInOut(duration: 0.3)) {
            currentState = state
        }
    }
    
    func handleAppActivation() async {
        // Handle app coming to foreground
        await connectionManager.testConnection()
        await configManager.refreshConfiguration()
        
        // Check if we need to re-authenticate
        if authManager.isAdminAuthenticated {
            // Session timeout logic can be added here
            // For now, just check if a reasonable time has passed
        }
    }
    
    // MARK: - Private Methods
    private func setupBindings() {
        // Listen for configuration changes
        configManager.$serverConfiguration
            .sink { [weak self] config in
                if config == nil {
                    self?.transitionTo(.serverSetup)
                }
            }
            .store(in: &cancellables)
        
        // Listen for activation changes
        configManager.$isActivated
            .sink { [weak self] activated in
                self?.isActivated = activated
                if activated {
                    self?.transitionTo(.ready)
                } else if self?.currentState != .initializing && self?.currentState != .serverSetup {
                    self?.transitionTo(.activation)
                }
            }
            .store(in: &cancellables)
        
        // Listen for connection status
        connectionManager.$isConnected
            .sink { [weak self] connected in
                if !connected && self?.currentState == .ready {
                    self?.showNotification(message: "Connection lost - operating in offline mode")
                }
            }
            .store(in: &cancellables)
    }
    
    private func performInitialization() async {
        // Check if server is configured
        guard configManager.serverConfiguration != nil else {
            transitionTo(.serverSetup)
            return
        }
        
        // Test connection
        let connectionSuccess = await connectionManager.testConnection()
        guard connectionSuccess else {
            transitionTo(.error("Unable to connect to server"))
            return
        }
        
        // Load kiosk info
        kioskInfo = await configManager.loadKioskInfo()
        
        // Check activation status
        let activationStatus = await configManager.checkActivationStatus()
        if activationStatus {
            transitionTo(.ready)
        } else {
            transitionTo(.activation)
        }
    }
}

// MARK: - Kiosk State
enum KioskState: Equatable {
    case initializing
    case serverSetup
    case activation
    case ready
    case error(String)
    case maintenance
    
    static func == (lhs: KioskState, rhs: KioskState) -> Bool {
        switch (lhs, rhs) {
        case (.initializing, .initializing),
             (.serverSetup, .serverSetup),
             (.activation, .activation),
             (.ready, .ready),
             (.maintenance, .maintenance):
            return true
        case (.error(let lhsMessage), .error(let rhsMessage)):
            return lhsMessage == rhsMessage
        default:
            return false
        }
    }
}

// MARK: - Kiosk Info
struct KioskInfo: Codable {
    let id: String
    let name: String
    let location: String?
    let lastUpdated: Date
    let version: String
    
    init(id: String = UUID().uuidString, name: String = "Conference Room Kiosk", location: String? = nil) {
        self.id = id
        self.name = name
        self.location = location
        self.lastUpdated = Date()
        self.version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }
}
