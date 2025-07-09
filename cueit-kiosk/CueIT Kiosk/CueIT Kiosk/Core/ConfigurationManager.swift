//
//  ConfigurationManager.swift
//  CueIT Kiosk
//
//  Manages all kiosk configuration including server settings,
//  activation status, and remote configuration updates
//

import SwiftUI
import Combine

@MainActor
class ConfigurationManager: ObservableObject {
    static let shared = ConfigurationManager()
    
    // MARK: - Published Properties
    @Published var serverConfiguration: ServerConfiguration?
    @Published var kioskConfiguration: KioskConfiguration?
    @Published var isActivated = false
    @Published var isDeactivated = false
    @Published var lastConfigUpdate: Date?
    
    // MARK: - Private Properties
    private let userDefaults = UserDefaults.standard
    private let keychain = KeychainManager()
    private var configUpdateTimer: Timer?
    
    // Keys for UserDefaults
    private enum UserDefaultsKeys {
        static let serverConfig = "serverConfiguration"
        static let kioskConfig = "kioskConfiguration"
        static let isActivated = "isActivated"
        static let isDeactivated = "isDeactivated"
        static let lastConfigUpdate = "lastConfigUpdate"
        static let kioskId = "kioskId"
    }
    
    private init() {
        loadLocalConfiguration()
        setupConfigUpdateTimer()
    }
    
    // MARK: - Server Configuration
    func setServerConfiguration(_ config: ServerConfiguration) {
        serverConfiguration = config
        saveServerConfiguration()
    }
    
    func clearServerConfiguration() {
        serverConfiguration = nil
        userDefaults.removeObject(forKey: UserDefaultsKeys.serverConfig)
    }
    
    // MARK: - Activation Management
    func activateKiosk(with code: String) async -> Bool {
        guard let serverConfig = serverConfiguration else { return false }
        
        // TODO: Implement proper API call
        let success = await APIService.shared.testConnection(serverURL: serverConfig.baseURL)
        
        if success {
            isActivated = true
            isDeactivated = false
            userDefaults.set(true, forKey: UserDefaultsKeys.isActivated)
            await refreshConfiguration()
        }
        
        return success
    }
    
    // MARK: - Configuration Updates
    func refreshConfiguration() async {
        guard let serverConfig = serverConfiguration, isActivated else { return }
        
        // TODO: Implement proper API call to get kiosk configuration
        // For now, create a basic configuration
        let roomName = userDefaults.string(forKey: "kioskRoomName") ?? "Conference Room"
        
        // Create a basic configuration if none exists
        if kioskConfiguration == nil {
            // We'll need to create this when we have the proper structure
            lastConfigUpdate = Date()
            userDefaults.set(lastConfigUpdate, forKey: UserDefaultsKeys.lastConfigUpdate)
        }
    }
    
    // MARK: - Kiosk ID Management
    func getKioskId() -> String {
        if let existingId = userDefaults.string(forKey: UserDefaultsKeys.kioskId) {
            return existingId
        }
        
        let newId = UUID().uuidString
        userDefaults.set(newId, forKey: UserDefaultsKeys.kioskId)
        return newId
    }
    
    // MARK: - Activation Wizard Support
    func updateServerURL(_ url: String) async {
        let config = ServerConfiguration(baseURL: url)
        setServerConfiguration(config)
    }
    
    func updateAdminPIN(_ pin: String) async {
        _ = keychain.store(key: "adminPIN", value: pin)
    }
    
    func updateRoomName(_ name: String) async {
        userDefaults.set(name, forKey: "kioskRoomName")
    }
    
    // MARK: - Deactivation Management
    func deactivateKiosk() async {
        await MainActor.run {
            isActivated = false
            isDeactivated = true
            userDefaults.set(false, forKey: UserDefaultsKeys.isActivated)
            userDefaults.set(true, forKey: UserDefaultsKeys.isDeactivated)
        }
    }
    
    func performFactoryReset() async {
        await MainActor.run {
            // Clear all stored data
            isActivated = false
            isDeactivated = false
            serverConfiguration = nil
            kioskConfiguration = nil
            lastConfigUpdate = nil
            
            // Clear UserDefaults
            userDefaults.removeObject(forKey: UserDefaultsKeys.serverConfig)
            userDefaults.removeObject(forKey: UserDefaultsKeys.kioskConfig)
            userDefaults.removeObject(forKey: UserDefaultsKeys.isActivated)
            userDefaults.removeObject(forKey: UserDefaultsKeys.isDeactivated)
            userDefaults.removeObject(forKey: UserDefaultsKeys.lastConfigUpdate)
            userDefaults.removeObject(forKey: "isSetupComplete")
            userDefaults.removeObject(forKey: "kioskRoomName")
            
            // Clear keychain
            _ = keychain.delete(key: "adminPIN")
            
            // Generate new kiosk ID for fresh start
            let newId = UUID().uuidString
            userDefaults.set(newId, forKey: UserDefaultsKeys.kioskId)
        }
    }
    
    // MARK: - Local Configuration Loading
    private func loadLocalConfiguration() {
        // Load activation status
        isActivated = userDefaults.bool(forKey: UserDefaultsKeys.isActivated)
        isDeactivated = userDefaults.bool(forKey: UserDefaultsKeys.isDeactivated)
        
        // Load server configuration
        if let data = userDefaults.data(forKey: UserDefaultsKeys.serverConfig),
           let config = try? JSONDecoder().decode(ServerConfiguration.self, from: data) {
            serverConfiguration = config
        }
        
        // Load last config update
        lastConfigUpdate = userDefaults.object(forKey: UserDefaultsKeys.lastConfigUpdate) as? Date
    }
    
    private func setupConfigUpdateTimer() {
        // TODO: Implement periodic configuration updates from server
        // This would periodically check if the kiosk has been deactivated
        configUpdateTimer = Timer.scheduledTimer(withTimeInterval: 300, repeats: true) { _ in
            Task {
                await self.checkServerStatus()
            }
        }
    }
    
    private func checkServerStatus() async {
        // TODO: Check with server if kiosk is still activated
        // If deactivated, call deactivateKiosk()
    }
    
    // MARK: - Kiosk Controller Methods
    func checkActivationStatus() async -> Bool {
        return isActivated && serverConfiguration != nil
    }
    
    func loadKioskInfo() async -> KioskInfo? {
        let roomName = userDefaults.string(forKey: "kioskRoomName") ?? "Conference Room"
        let kioskId = getKioskId()
        
        return KioskInfo(
            id: kioskId,
            name: roomName,
            location: nil
        )
    }
    
    deinit {
        configUpdateTimer?.invalidate()
    }
    
    // MARK: - Private Methods
    private func saveServerConfiguration() {
        if let config = serverConfiguration,
           let data = try? JSONEncoder().encode(config) {
            userDefaults.set(data, forKey: UserDefaultsKeys.serverConfig)
        }
    }
}

// MARK: - Configuration Models
struct ServerConfiguration: Codable {
    let baseURL: String
    let name: String
    let isSecure: Bool
    let lastTested: Date
    
    init(baseURL: String, name: String = "CueIT Server") {
        self.baseURL = baseURL
        self.name = name
        self.isSecure = baseURL.hasPrefix("https")
        self.lastTested = Date()
    }
}

struct KioskConfiguration: Codable {
    let displayName: String
    let location: String?
    let logoURL: String?
    let backgroundURL: String?
    let theme: KioskTheme
    let features: KioskFeatures
    let messaging: MessagingConfiguration
    let statusIndicator: StatusIndicatorConfiguration
    
    struct KioskTheme: Codable {
        let primaryColor: String
        let secondaryColor: String
        let accentColor: String
        let backgroundStyle: String // "solid", "gradient", "image"
    }
    
    struct KioskFeatures: Codable {
        let showClock: Bool
        let showWeather: Bool
        let showCalendar: Bool
        let enableFeedback: Bool
        let allowGuestAccess: Bool
    }
    
    struct MessagingConfiguration: Codable {
        let welcomeMessage: String
        let helpText: String
        let showTicker: Bool
        let tickerText: String?
    }
    
    struct StatusIndicatorConfiguration: Codable {
        let enabled: Bool
        let position: String // "top", "bottom", "floating"
        let showConnectionStatus: Bool
        let showLastUpdate: Bool
    }
}

// MARK: - Keychain Manager
class KeychainManager {
    func store(key: String, value: String) -> Bool {
        let data = value.data(using: .utf8)!
        let query = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ] as [String: Any]
        
        SecItemDelete(query as CFDictionary)
        return SecItemAdd(query as CFDictionary, nil) == errSecSuccess
    }
    
    func retrieve(key: String) -> String? {
        let query = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: kCFBooleanTrue!,
            kSecMatchLimit as String: kSecMatchLimitOne
        ] as [String: Any]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        if status == errSecSuccess {
            if let data = dataTypeRef as? Data {
                return String(data: data, encoding: .utf8)
            }
        }
        
        return nil
    }
    
    func delete(key: String) -> Bool {
        let query = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ] as [String: Any]
        
        return SecItemDelete(query as CFDictionary) == errSecSuccess
    }
}
