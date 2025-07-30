//
//  StatusManager.swift
//  CueIT Kiosk
//
//  Manages kiosk status with backend sync and manual override
//

import SwiftUI
import Combine

@MainActor
class StatusManager: ObservableObject {
    static let shared = StatusManager()
    
    // MARK: - Published Properties
    @Published var currentStatus: KioskStatus = .available
    @Published var statusConfiguration: StatusConfiguration = StatusConfiguration()
    @Published var isManualOverride: Bool = false
    @Published var lastUpdate: Date = Date()
    
    // Legacy support
    var isAvailable: Bool {
        currentStatus == .available
    }
    
    var statusDescription: String {
        if !connectionManager.isConnected {
            return "Offline mode"
        } else if isManualOverride {
            return "Manual override active"
        } else {
            return statusConfiguration.message(for: currentStatus)
        }
    }
    
    // MARK: - Dependencies
    private let configManager = ConfigurationManager.shared
    private let connectionManager = ConnectionManager.shared
    private let apiService = APIService.shared
    
    private var cancellables = Set<AnyCancellable>()
    private var statusTimer: Timer?
    
    private init() {
        setupBindings()
        loadSavedStatus()
    }
    
    // MARK: - Public Methods
    func startMonitoring() {
        // Start periodic status sync - reduced frequency to avoid too frequent refreshes
        statusTimer = Timer.scheduledTimer(withTimeInterval: 120.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.syncWithBackend()
            }
        }
        
        // Initial sync
        Task {
            await syncWithBackend()
        }
    }
    
    func stopMonitoring() {
        statusTimer?.invalidate()
        statusTimer = nil
    }
    
    private func setManualStatus(_ status: KioskStatus) {
        currentStatus = status
        isManualOverride = true
        lastUpdate = Date()
        saveStatus()
        
        // Sync with backend if connected
        Task {
            await syncManualStatusToBackend()
        }
    }
    
    private func setManualStatus(_ available: Bool) {
        // Legacy support for existing code
        setManualStatus(available ? .available : .inUse)
    }
    
    // Admin-only method for status changes that require authentication
    func setAdminStatus(_ status: KioskStatus, requireAuth: Bool = true) -> Bool {
        if requireAuth {
            // Check if admin is authenticated through AuthenticationManager
            let authManager = AuthenticationManager.shared
            guard authManager.isAdminAuthenticated else {
                return false
            }
        }
        
        setManualStatus(status)
        return true
    }
    
    func clearManualOverride() {
        isManualOverride = false
        lastUpdate = Date()
        saveStatus()
        
        // Re-sync with backend
        Task {
            await syncWithBackend()
        }
    }
    
    // Admin-only method for clearing override that requires authentication
    func clearAdminOverride(requireAuth: Bool = true) -> Bool {
        if requireAuth {
            guard AuthenticationManager.shared.isAdminAuthenticated else {
                return false
            }
        }
        
        clearManualOverride()
        return true
    }
    
    func refreshStatus() {
        Task {
            await syncWithBackend()
        }
    }
    
    func updateStatusConfiguration(_ config: StatusConfiguration) {
        statusConfiguration = config
        saveStatusConfiguration()
    }
    
    // Force refresh configuration when admin authenticates
    func refreshConfigurationForAdmin() {
        guard AuthenticationManager.shared.isAdminAuthenticated else { return }
        
        Task {
            guard connectionManager.isConnected,
                  let serverConfig = configManager.serverConfiguration else {
                return
            }
            
            await fetchStatusConfiguration(serverURL: serverConfig.baseURL)
        }
    }
    
    // MARK: - Private Methods
    private func setupBindings() {
        // Listen for connection changes
        connectionManager.$isConnected
            .sink { [weak self] (connected: Bool) in
                if connected {
                    Task { @MainActor in
                        await self?.syncWithBackend()
                    }
                }
                // Status description is now computed, no need to update manually
            }
            .store(in: &cancellables)
        
        // Listen for configuration changes
        configManager.$kioskConfiguration
            .sink { [weak self] _ in
                Task { @MainActor in
                    await self?.syncWithBackend()
                }
            }
            .store(in: &cancellables)
    }
    
    private func syncWithBackend() async {
        guard connectionManager.isConnected,
              let serverConfig = configManager.serverConfiguration else {
            return
        }
        
        // Only fetch configuration updates if admin is authenticated
        // This prevents unauthorized changes from being pulled from server
        let authManager = AuthenticationManager.shared
        if authManager.isAdminAuthenticated {
            await fetchStatusConfiguration(serverURL: serverConfig.baseURL)
        }
        
        // Always sync current status (read-only operation)
        if !isManualOverride {
            await fetchCurrentStatus(serverURL: serverConfig.baseURL)
        }
    }
    
    private func syncManualStatusToBackend() async {
        guard connectionManager.isConnected,
              let _ = configManager.serverConfiguration else {
            return
        }
        
        guard let serverConfig = configManager.serverConfiguration else { return }

        let kioskId = configManager.getKioskId()
        let success = await apiService.updateKioskStatus(
            kioskId: kioskId,
            status: currentStatus,
            serverURL: serverConfig.baseURL
        )
        if success {
            lastUpdate = Date()
            saveStatus()
        }
    }

    private func fetchStatusConfiguration(serverURL: String) async {
        let kioskId = configManager.getKioskId()
        if let config = await apiService.getStatusConfiguration(kioskId: kioskId, serverURL: serverURL) {
            statusConfiguration = config
            saveStatusConfiguration()
        }
    }

    private func fetchCurrentStatus(serverURL: String) async {
        let kioskId = configManager.getKioskId()
        if let statusInfo = await apiService.checkKioskStatus(id: kioskId, serverURL: serverURL),
           let statusString = statusInfo["status"] as? String,
           let status = KioskStatus(rawValue: statusString) {
            currentStatus = status
            lastUpdate = Date()
            saveStatus()
        }
    }
    
    private func saveStatus() {
        UserDefaults.standard.set(currentStatus.rawValue, forKey: "lastKnownStatus")
        UserDefaults.standard.set(isManualOverride, forKey: "isManualOverride")
        UserDefaults.standard.set(lastUpdate, forKey: "lastStatusUpdate")
    }
    
    private func saveStatusConfiguration() {
        if let data = try? JSONEncoder().encode(statusConfiguration) {
            UserDefaults.standard.set(data, forKey: "statusConfiguration")
        }
    }
    
    private func loadSavedStatus() {
        // Load status
        if let statusString = UserDefaults.standard.string(forKey: "lastKnownStatus"),
           let status = KioskStatus(rawValue: statusString) {
            currentStatus = status
        } else {
            // Legacy support - convert old boolean to new enum
            let wasAvailable = UserDefaults.standard.object(forKey: "lastKnownStatus") as? Bool ?? true
            currentStatus = wasAvailable ? .available : .inUse
        }
        
        isManualOverride = UserDefaults.standard.bool(forKey: "isManualOverride")
        lastUpdate = UserDefaults.standard.object(forKey: "lastStatusUpdate") as? Date ?? Date()
        
        // Load status configuration
        if let data = UserDefaults.standard.data(forKey: "statusConfiguration"),
           let config = try? JSONDecoder().decode(StatusConfiguration.self, from: data) {
            statusConfiguration = config
        }
    }
}
