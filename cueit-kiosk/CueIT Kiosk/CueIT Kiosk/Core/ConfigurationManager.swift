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
        
        let success = await APIService.shared.activateKiosk(
            id: getKioskId(),
            activationCode: code,
            serverURL: serverConfig.baseURL
        )
        
        if success {
            isActivated = true
            userDefaults.set(true, forKey: UserDefaultsKeys.isActivated)
            await refreshConfiguration()
        }
        
        return success
    }
    
    func checkActivationStatus() async -> Bool {
        guard let serverConfig = serverConfiguration else { return false }
        
        let status = await APIService.shared.checkKioskStatus(
            id: getKioskId(),
            serverURL: serverConfig.baseURL
        )
        
        isActivated = status?.isActive ?? false
        userDefaults.set(isActivated, forKey: UserDefaultsKeys.isActivated)
        
        return isActivated
    }
    
    // MARK: - Configuration Updates
    func refreshConfiguration() async {
        guard let serverConfig = serverConfiguration, isActivated else { return }
        
        if let config = await APIService.shared.getKioskConfiguration(
            id: getKioskId(),
            serverURL: serverConfig.baseURL
        ) {
            kioskConfiguration = config
            lastConfigUpdate = Date()
            saveKioskConfiguration()
        }
    }
    
    func loadKioskInfo() async -> KioskInfo {
        let id = getKioskId()
        let name = kioskConfiguration?.displayName ?? "Conference Room Kiosk"
        let location = kioskConfiguration?.location
        
        return KioskInfo(id: id, name: name, location: location)
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
    
    // MARK: - Private Methods
    private func loadLocalConfiguration() {
        // Load server configuration
        if let data = userDefaults.data(forKey: UserDefaultsKeys.serverConfig),
           let config = try? JSONDecoder().decode(ServerConfiguration.self, from: data) {
            serverConfiguration = config
        }
        
        // Load kiosk configuration
        if let data = userDefaults.data(forKey: UserDefaultsKeys.kioskConfig),
           let config = try? JSONDecoder().decode(KioskConfiguration.self, from: data) {
            kioskConfiguration = config
        }
        
        // Load activation status
        isActivated = userDefaults.bool(forKey: UserDefaultsKeys.isActivated)
        
        // Load last update time
        if let timestamp = userDefaults.object(forKey: UserDefaultsKeys.lastConfigUpdate) as? Date {
            lastConfigUpdate = timestamp
        }
    }
    
    private func saveServerConfiguration() {
        if let config = serverConfiguration,
           let data = try? JSONEncoder().encode(config) {
            userDefaults.set(data, forKey: UserDefaultsKeys.serverConfig)
        }
    }
    
    private func saveKioskConfiguration() {
        if let config = kioskConfiguration,
           let data = try? JSONEncoder().encode(config) {
            userDefaults.set(data, forKey: UserDefaultsKeys.kioskConfig)
        }
        
        if let lastUpdate = lastConfigUpdate {
            userDefaults.set(lastUpdate, forKey: UserDefaultsKeys.lastConfigUpdate)
        }
    }
    
    private func setupConfigUpdateTimer() {
        // Check for config updates every 5 minutes
        configUpdateTimer = Timer.scheduledTimer(withTimeInterval: 300, repeats: true) { _ in
            Task { @MainActor in
                await self.refreshConfiguration()
            }
        }
    }
    
    deinit {
        configUpdateTimer?.invalidate()
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
