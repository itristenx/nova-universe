//
//  StatusManager.swift
//  CueIT Kiosk
//
//  Manages kiosk status (Available/In Use) with backend sync and manual override
//

import SwiftUI
import Combine

@MainActor
class StatusManager: ObservableObject {
    static let shared = StatusManager()
    
    // MARK: - Published Properties
    @Published var isAvailable: Bool = true
    @Published var statusDescription: String = "Ready to help"
    @Published var isManualOverride: Bool = false
    @Published var lastUpdate: Date = Date()
    
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
        // Start periodic status sync
        statusTimer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { [weak self] _ in
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
    
    func setManualStatus(_ available: Bool) {
        isAvailable = available
        isManualOverride = true
        updateStatusDescription()
        saveStatus()
        
        // Sync with backend if connected
        Task {
            await syncManualStatusToBackend()
        }
    }
    
    func clearManualOverride() {
        isManualOverride = false
        updateStatusDescription()
        saveStatus()
        
        // Re-sync with backend
        Task {
            await syncWithBackend()
        }
    }
    
    func refreshStatus() {
        Task {
            await syncWithBackend()
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
                } else {
                    self?.updateStatusDescription()
                }
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
        guard connectionManager.isConnected else {
            updateStatusDescription()
            return
        }
        
        // For now, just update the description
        // TODO: Implement actual backend sync when API is ready
        updateStatusDescription()
    }
    
    private func syncManualStatusToBackend() async {
        guard connectionManager.isConnected else {
            return
        }
        
        // TODO: Implement actual backend sync when API is ready
        print("Would sync manual status to backend: \(isAvailable)")
    }
    
    private func updateStatusDescription() {
        if !connectionManager.isConnected {
            statusDescription = "Offline mode"
        } else if isManualOverride {
            statusDescription = "Manual override active"
        } else if isAvailable {
            statusDescription = "Ready to help"
        } else {
            statusDescription = "Room occupied"
        }
    }
    
    private func saveStatus() {
        UserDefaults.standard.set(isAvailable, forKey: "lastKnownStatus")
        UserDefaults.standard.set(isManualOverride, forKey: "isManualOverride")
        UserDefaults.standard.set(lastUpdate, forKey: "lastStatusUpdate")
    }
    
    private func loadSavedStatus() {
        isAvailable = UserDefaults.standard.object(forKey: "lastKnownStatus") as? Bool ?? true
        isManualOverride = UserDefaults.standard.bool(forKey: "isManualOverride")
        lastUpdate = UserDefaults.standard.object(forKey: "lastStatusUpdate") as? Date ?? Date()
        updateStatusDescription()
    }
}
