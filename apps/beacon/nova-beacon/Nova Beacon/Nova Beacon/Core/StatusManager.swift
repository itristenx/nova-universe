//
//  StatusManager.swift
//  Nova Beacon
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
              let serverConfig = configManager.serverConfiguration else {
            return
        }
        
        // Sync kiosk status to Nova Universe backend
        do {
            let statusPayload = [
                "status": currentStatus.rawValue,
                "timestamp": ISO8601DateFormatter().string(from: Date())
            ]
            guard let url = URL(string: "\(serverConfig.baseURL)/api/v2/beacon/kiosks/\(configManager.getKioskId())/status") else {
                print("Invalid status sync URL")
                return
            }
            var request = URLRequest(url: url)
            request.httpMethod = "PUT"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONSerialization.data(withJSONObject: statusPayload)
            let (_, response) = try await URLSession.shared.data(for: request)
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                print("Status synced successfully to backend: \(currentStatus.rawValue)")
            } else {
                print("Failed to sync status to backend")
            }
        } catch {
            print("Error syncing status to backend: \(error)")
        }
    }
    
    private func fetchStatusConfiguration(serverURL: String) async {
        // Fetch status configuration from Nova Universe backend
        do {
            guard let url = URL(string: "\(serverURL)/api/v2/beacon/config?kiosk_id=\(configManager.getKioskId())") else {
                print("Invalid configuration URL")
                return
            }
            let (data, response) = try await URLSession.shared.data(from: url)
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                let config = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                if let cfg = config?["config"] as? [String: Any],
                   let messages = cfg["statusMessages"] as? [String: Any] {
                    var newConfig = StatusConfiguration()
                    newConfig.availableMessage = messages["available"] as? String ?? newConfig.availableMessage
                    newConfig.inUseMessage = messages["inUse"] as? String ?? newConfig.inUseMessage
                    newConfig.meetingMessage = messages["meeting"] as? String ?? newConfig.meetingMessage
                    newConfig.brbMessage = messages["brb"] as? String ?? newConfig.brbMessage
                    newConfig.lunchMessage = messages["lunch"] as? String ?? newConfig.lunchMessage
                    newConfig.unavailableMessage = messages["unavailable"] as? String ?? newConfig.unavailableMessage
                    await MainActor.run {
                        self.statusConfiguration = newConfig
                        self.saveStatusConfiguration()
                    }
                }
            } else {
                print("Failed to fetch status configuration")
            }
        } catch {
            print("Error fetching status configuration: \(error)")
        }
    }
    
    private func fetchCurrentStatus(serverURL: String) async {
        // Fetch current kiosk status from Nova Universe backend
        do {
            guard let url = URL(string: "\(serverURL)/api/v2/beacon/kiosks/\(configManager.getKioskId())") else {
                print("Invalid status URL")
                return
            }
            let (data, response) = try await URLSession.shared.data(from: url)
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                let statusResponse = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                if let statusString = statusResponse?["status"] as? String,
                   let serverStatus = KioskStatus(rawValue: statusString) {
                    await MainActor.run {
                        self.currentStatus = serverStatus
                    }
                }
            } else {
                print("Failed to fetch current status from server")
            }
        } catch {
            print("Error fetching current status: \(error)")
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
