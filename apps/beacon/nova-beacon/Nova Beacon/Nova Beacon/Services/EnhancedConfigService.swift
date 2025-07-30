//
//  EnhancedConfigService.swift
//  CueIT Kiosk
//
//  Enhanced configuration service with sync capabilities and offline PIN support
//

import Foundation
import SwiftUI
import CryptoKit

// Configuration structures
struct KioskRemoteConfig: Codable {
    var config: KioskConfig
    var adminPins: AdminPins
    var lastUpdate: String
    var version: Int
    var permissions: ConfigPermissions
}

struct KioskConfig: Codable {
    var statusEnabled: Bool
    var currentStatus: String
    var openMsg: String
    var closedMsg: String
    var errorMsg: String
    var logoUrl: String
    var backgroundUrl: String?
    var welcomeMessage: String
    var helpMessage: String
    var schedule: ScheduleConfig?
    var officeHours: OfficeHoursConfig? // Read-only
}

struct AdminPins: Codable {
    var global: String? // Encrypted PIN hash
    var kiosk: String?  // Kiosk-specific PIN hash
}

struct ConfigPermissions: Codable {
    var canEditStatus: Bool
    var canEditSchedule: Bool
    var canEditBranding: Bool
    var canEditOfficeHours: Bool // Always false for kiosk
}

struct ScheduleConfig: Codable {
    var enabled: Bool
    var schedule: WeeklySchedule
    var timezone: String
}

struct WeeklySchedule: Codable {
    var monday: DaySchedule
    var tuesday: DaySchedule
    var wednesday: DaySchedule
    var thursday: DaySchedule
    var friday: DaySchedule
    var saturday: DaySchedule
    var sunday: DaySchedule
}

struct DaySchedule: Codable {
    var enabled: Bool
    var slots: [TimeSlot]
}

struct TimeSlot: Codable {
    var start: String
    var end: String
}

struct OfficeHoursConfig: Codable {
    var enabled: Bool
    var title: String
    var schedule: WeeklySchedule
    var timezone: String
    var showNextOpen: Bool
}

struct ConfigUpdate: Codable {
    var type: String // "status", "schedule", "branding"
    var data: Data
    var timestamp: String
    var source: String // "kiosk" or "admin"
                throw ConfigError.invalidURL
}

struct AdminPinValidation: Codable {
    var valid: Bool
    var token: String?
    var permissions: [String]
    var expiresAt: String
    var pinType: String?
}

class EnhancedConfigService: ObservableObject {
    static let shared = EnhancedConfigService()
    
    @Published var remoteConfig: KioskRemoteConfig?
    @Published var localConfig: KioskConfig?
    @Published var errorMessage: String?
    @Published var syncStatus: SyncStatus = .offline
    @Published var adminSession: AdminSession?
    @Published var activationState: ActivationState = .notActivated
    
    private let kioskId: String
    private var syncTimer: Timer?
    
    enum SyncStatus {
        case synced
        case pending
        case conflict
        case offline
    }
    
    enum ActivationState {
        case notActivated
        case activating
        case activated
        case revoked
        case expired
        case error(String)
    }
    
    struct AdminSession {
        let token: String
        let expiresAt: Date
        let permissions: [String]
        let pinType: String
        let createdAt: Date
    }
    
    private init() {
        self.kioskId = UserDefaults.standard.string(forKey: "kioskId") ?? "unknown"
        loadCachedConfig()
        startPeriodicSync()
    }
    
    // MARK: - Configuration Management
    
    @MainActor
    func loadRemoteConfig() async {
        do {
            guard let url = URL(string: "\(APIConfig.baseURL)/api/v1/kiosks/\(kioskId)/remote-config") else {
                throw ConfigError.invalidURL
            }
            
            let (data, _) = try await URLSession.shared.data(from: url)
            let config = try JSONDecoder().decode(KioskRemoteConfig.self, from: data)
            
            self.remoteConfig = config
            self.localConfig = config.config
            self.errorMessage = nil
            self.syncStatus = .synced
            
            // Cache configuration and encrypted PINs
            cacheConfig(config)
            cacheAdminPins(config.adminPins)
            updateLastSyncTime()
            
        } catch {
            print("Failed to load remote config: \(error)")
            
            // Try to continue with cached config if available
            if localConfig != nil && canOperateOffline() {
                self.errorMessage = "Running in offline mode"
                self.syncStatus = .offline
            } else {
                self.errorMessage = "Unable to load configuration"
                self.syncStatus = .offline
            }
        }
    }
    
    func updateLocalConfig(_ updates: [String: Any], source: String = "kiosk") async {
        guard var config = localConfig else { return }
        
        // Apply updates locally
        for (key, value) in updates {
            switch key {
            case "currentStatus":
                config.currentStatus = value as? String ?? config.currentStatus
            case "statusEnabled":
                config.statusEnabled = value as? Bool ?? config.statusEnabled
            case "logoUrl":
                config.logoUrl = value as? String ?? config.logoUrl
            case "backgroundUrl":
                config.backgroundUrl = value as? String ?? config.backgroundUrl
            case "welcomeMessage":
                config.welcomeMessage = value as? String ?? config.welcomeMessage
            case "helpMessage":
                config.helpMessage = value as? String ?? config.helpMessage
            case "primaryColor":
                config.theme.primaryColor = value as? String ?? config.theme.primaryColor
            case "secondaryColor":
                config.theme.secondaryColor = value as? String ?? config.theme.secondaryColor
            default:
                break
            }
        }
        
        // Create a local copy to avoid captured variable issues
        let updatedConfig = config
        
        // Update local state
        await MainActor.run {
            self.localConfig = updatedConfig
            self.syncStatus = .pending
        }
        
        // Cache locally
        cacheLocalConfig(updatedConfig)
        
        // Sync to server
        await syncToServer(updates, source: source)
    }
    
    private func syncToServer(_ updates: [String: Any], source: String) async {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(kioskId)/sync-config") else {
            return
        }
        
        let configUpdate = [
            "type": determineUpdateType(updates),
            "data": updates,
            "timestamp": ISO8601DateFormatter().string(from: Date()),
            "source": source,
            "kioskId": kioskId
        ] as [String: Any]
        
        do {
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONSerialization.data(withJSONObject: configUpdate)
            
            let (_, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                await MainActor.run {
                    self.syncStatus = .synced
                }
            } else {
                await MainActor.run {
                    self.syncStatus = .conflict
                }
            }
        } catch {
            print("Failed to sync to server: \(error)")
            await MainActor.run {
                self.syncStatus = .offline
            }
        }
    }
    
    private func determineUpdateType(_ updates: [String: Any]) -> String {
        if updates.keys.contains(where: { ["currentStatus", "statusEnabled", "openMsg", "closedMsg", "errorMsg"].contains($0) }) {
            return "status"
        } else if updates.keys.contains(where: { ["schedule"].contains($0) }) {
            return "schedule"
        } else if updates.keys.contains(where: { ["logoUrl", "backgroundUrl", "welcomeMessage", "helpMessage"].contains($0) }) {
            return "branding"
        }
        return "unknown"
    }
    
    // MARK: - Admin PIN Management
    
    func validateAdminPIN(_ pin: String) async -> AdminPinValidation? {
        // First try offline validation with cached PINs
        if let cachedValidation = validatePINOffline(pin) {
            return cachedValidation
        }
        
        // Fallback to online validation
        return await validatePINOnline(pin)
    }
    
    private func validatePINOffline(_ pin: String) -> AdminPinValidation? {
        guard let cachedPins = getCachedAdminPinsPrivate() else { return nil }
        
        let hashedPin = hashPIN(pin)
        
        // Check global PIN
        if let globalPin = cachedPins.global, globalPin == hashedPin {
            return AdminPinValidation(
                valid: true,
                token: generateOfflineToken(),
                permissions: ["status.change", "schedule.change", "branding.change", "tickets.view"],
                expiresAt: ISO8601DateFormatter().string(from: Date().addingTimeInterval(4 * 60 * 60)), // 4 hours
                pinType: "global"
            )
        }
        
        // Check kiosk-specific PIN
        if let kioskPin = cachedPins.kiosk, kioskPin == hashedPin {
            return AdminPinValidation(
                valid: true,
                token: generateOfflineToken(),
                permissions: ["status.change", "schedule.change", "branding.change"],
                expiresAt: ISO8601DateFormatter().string(from: Date().addingTimeInterval(4 * 60 * 60)), // 4 hours
                pinType: "kiosk-specific"
            )
        }
        
        return nil
    }
    
    private func validatePINOnline(_ pin: String) async -> AdminPinValidation? {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/admin/validate-pin") else { return nil }
        
        let requestBody = ["pin": pin, "kioskId": kioskId]
        
        do {
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONEncoder().encode(requestBody)
            
            let (data, _) = try await URLSession.shared.data(for: request)
            let validation = try JSONDecoder().decode(AdminPinValidation.self, from: data)
            
            return validation
        } catch {
            print("Failed to validate PIN online: \(error)")
            return nil
        }
    }
    
    func startAdminSession(validation: AdminPinValidation) {
        guard let token = validation.token else { return }
        
        let expiresAt = ISO8601DateFormatter().date(from: validation.expiresAt) ?? Date().addingTimeInterval(4 * 60 * 60)
        
        adminSession = AdminSession(
            token: token,
            expiresAt: expiresAt,
            permissions: validation.permissions,
            pinType: validation.pinType ?? "unknown",
            createdAt: Date()
        )
        
        // Cache session securely
        cacheAdminSession(adminSession!)
    }
    
    func endAdminSession() {
        adminSession = nil
        clearCachedAdminSession()
    }
    
    var isAdminSessionValid: Bool {
        guard let session = adminSession else { return false }
        return session.expiresAt > Date()
    }
    
    // MARK: - Activation State Management
    
    func checkActivationStatus() async {
        guard isOnline() else {
            // Use cached activation state when offline
            if let cached = UserDefaults.standard.string(forKey: "activationState") {
                switch cached {
                case "activated":
                    await MainActor.run { self.activationState = .activated }
                case "revoked":
                    await MainActor.run { self.activationState = .revoked }
                case "expired":
                    await MainActor.run { self.activationState = .expired }
                default:
                    await MainActor.run { self.activationState = .notActivated }
                }
            }
            return
        }
        
        await MainActor.run { self.activationState = .activating }
        
        do {
            guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(kioskId)/activation-status") else {
                throw ConfigError.invalidURL
            }
            
            let (data, response) = try await URLSession.shared.data(from: url)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw ConfigError.networkError
            }
            
            switch httpResponse.statusCode {
            case 200:
                let result = try JSONDecoder().decode(ActivationResponse.self, from: data)
                await MainActor.run {
                    switch result.status {
                    case "activated":
                        self.activationState = .activated
                        UserDefaults.standard.set("activated", forKey: "activationState")
                    case "revoked":
                        self.activationState = .revoked
                        UserDefaults.standard.set("revoked", forKey: "activationState")
                    case "expired":
                        self.activationState = .expired
                        UserDefaults.standard.set("expired", forKey: "activationState")
                    default:
                        self.activationState = .notActivated
                        UserDefaults.standard.set("notActivated", forKey: "activationState")
                    }
                }
            case 404:
                await MainActor.run {
                    self.activationState = .notActivated
                    UserDefaults.standard.set("notActivated", forKey: "activationState")
                }
            case 401, 403:
                await MainActor.run {
                    self.activationState = .revoked
                    UserDefaults.standard.set("revoked", forKey: "activationState")
                }
            default:
                await MainActor.run {
                    self.activationState = .error("Server error: \(httpResponse.statusCode)")
                }
            }
            
        } catch {
            await MainActor.run {
                self.activationState = .error("Network error: \(error.localizedDescription)")
            }
        }
    }
    
    func getActivationMessage() -> String {
        switch activationState {
        case .notActivated:
            return "Kiosk not activated. Please contact your administrator."
        case .activating:
            return "Checking activation status..."
        case .activated:
            return "Kiosk is active and ready for use."
        case .revoked:
            return "Kiosk activation has been revoked. Please contact your administrator."
        case .expired:
            return "Kiosk activation has expired. Please contact your administrator."
        case .error(let message):
            return "Activation error: \(message)"
        }
    }
    
    func canPerformOperations() -> Bool {
        switch activationState {
        case .activated:
            return true
        case .notActivated, .revoked, .expired:
            return false
        case .activating, .error:
            // Allow operations during checking or if we have cached activated state
            return UserDefaults.standard.string(forKey: "activationState") == "activated"
        }
    }
    
    struct ActivationResponse: Codable {
        let status: String
        let message: String?
        let expiresAt: String?
    }
    
    // MARK: - Caching and Security
    
    private func cacheConfig(_ config: KioskRemoteConfig) {
        do {
            let data = try JSONEncoder().encode(config)
            UserDefaults.standard.set(data, forKey: "remoteConfig")
        } catch {
            print("Failed to cache remote config: \(error)")
        }
    }
    
    private func cacheLocalConfig(_ config: KioskConfig) {
        do {
            let data = try JSONEncoder().encode(config)
            UserDefaults.standard.set(data, forKey: "localConfig")
        } catch {
            print("Failed to cache local config: \(error)")
        }
    }
    
    private func loadCachedConfig() {
        // Load remote config
        if let data = UserDefaults.standard.data(forKey: "remoteConfig"),
           let config = try? JSONDecoder().decode(KioskRemoteConfig.self, from: data) {
            self.remoteConfig = config
        }
        
        // Load local config
        if let data = UserDefaults.standard.data(forKey: "localConfig"),
           let config = try? JSONDecoder().decode(KioskConfig.self, from: data) {
            self.localConfig = config
        }
        
        // Load cached admin session
        loadCachedAdminSession()
    }
    
    private func cacheAdminPins(_ pins: AdminPins) {
        // Store encrypted PINs in keychain for offline validation
        do {
            let data = try JSONEncoder().encode(pins)
            KeychainService.store(key: "adminPins", data: data)
        } catch {
            print("Failed to cache admin PINs: \(error)")
        }
    }
    
    // Public method for UI access
    func getCachedAdminPins() -> AdminPins? {
        guard let data = KeychainService.retrieve(key: "adminPins") else { return nil }
        return try? JSONDecoder().decode(AdminPins.self, from: data)
    }
    
    private func getCachedAdminPinsPrivate() -> AdminPins? {
        guard let data = KeychainService.retrieve(key: "adminPins") else { return nil }
        return try? JSONDecoder().decode(AdminPins.self, from: data)
    }
    
    private func cacheAdminSession(_ session: AdminSession) {
        do {
            let sessionData = [
                "token": session.token,
                "expiresAt": ISO8601DateFormatter().string(from: session.expiresAt),
                "permissions": session.permissions.joined(separator: ","),
                "pinType": session.pinType,
                "createdAt": ISO8601DateFormatter().string(from: session.createdAt)
            ]
            let data = try JSONSerialization.data(withJSONObject: sessionData)
            KeychainService.store(key: "adminSession", data: data)
        } catch {
            print("Failed to cache admin session: \(error)")
        }
    }
    
    private func loadCachedAdminSession() {
        guard let data = KeychainService.retrieve(key: "adminSession"),
              let sessionDict = try? JSONSerialization.jsonObject(with: data) as? [String: String],
              let token = sessionDict["token"],
              let expiresAtString = sessionDict["expiresAt"],
              let expiresAt = ISO8601DateFormatter().date(from: expiresAtString),
              let permissionsString = sessionDict["permissions"],
              let pinType = sessionDict["pinType"],
              let createdAtString = sessionDict["createdAt"],
              let createdAt = ISO8601DateFormatter().date(from: createdAtString) else { return }
        
        let permissions = permissionsString.split(separator: ",").map(String.init)
        
        // Only restore session if not expired
        if expiresAt > Date() {
            adminSession = AdminSession(
                token: token,
                expiresAt: expiresAt,
                permissions: permissions,
                pinType: pinType,
                createdAt: createdAt
            )
        }
    }
    
    private func clearCachedAdminSession() {
        KeychainService.delete(key: "adminSession")
    }
    
    private func hashPIN(_ pin: String) -> String {
        let data = Data(pin.utf8)
        let digest = SHA256.hash(data: data)
        return digest.compactMap { String(format: "%02x", $0) }.joined()
    }
    
    private func generateOfflineToken() -> String {
        return "offline_\(UUID().uuidString)_\(Date().timeIntervalSince1970)"
    }
    
    // MARK: - Periodic Sync
    
    private func startPeriodicSync() {
        syncTimer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { _ in
            Task {
                await self.loadRemoteConfig()
            }
        }
    }
    
    // MARK: - Offline Capabilities
    
    func canOperateOffline() -> Bool {
        // Check if we have cached config and it's not too old
        guard localConfig != nil else { return false }
        
        // Check cache age (allow up to 24 hours offline)
        if let lastSync = UserDefaults.standard.object(forKey: "lastConfigSync") as? Date,
           Date().timeIntervalSince(lastSync) > 24 * 60 * 60 {
            return false
        }
        
        return true
    }
    
    func getOfflineCapabilityTimeRemaining() -> TimeInterval {
        guard let lastSync = UserDefaults.standard.object(forKey: "lastConfigSync") as? Date else {
            return 0
        }
        
        let maxOfflineTime: TimeInterval = 24 * 60 * 60 // 24 hours
        let elapsed = Date().timeIntervalSince(lastSync)
        return max(0, maxOfflineTime - elapsed)
    }
    
    func isOnline() -> Bool {
        // Simple connectivity check
        guard let url = URL(string: APIConfig.baseURL) else { return false }
        
        var request = URLRequest(url: url)
        request.timeoutInterval = 5.0
        
        let semaphore = DispatchSemaphore(value: 0)
        var isReachable = false
        
        URLSession.shared.dataTask(with: request) { _, response, _ in
            isReachable = (response as? HTTPURLResponse)?.statusCode != nil
            semaphore.signal()
        }.resume()
        
        _ = semaphore.wait(timeout: .now() + 5)
        return isReachable
    }
    
    private func updateLastSyncTime() {
        UserDefaults.standard.set(Date(), forKey: "lastConfigSync")
    }
    
    deinit {
        syncTimer?.invalidate()
    }
}

// MARK: - Configuration Errors

enum ConfigError: Error {
    case invalidURL
    case networkError
    case invalidData
    case authenticationFailed
}
