//
//  ConfigurationManager.swift
//  Nova Beacon
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
    @Published var currentRoomName: String = "Conference Room"
    @Published var isServerLocked: Bool = false
    
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
        
        // Use proper API call for kiosk activation
        let kioskId = Bundle.main.object(forInfoDictionaryKey: "KIOSK_ID") as? String ?? UIDevice.current.identifierForVendor?.uuidString ?? "unknown"
        let success = await APIService.shared.activateKiosk(id: kioskId, activationCode: code, serverURL: serverConfig.baseURL)
        
        if success {
            isActivated = true
            isDeactivated = false
            isServerLocked = true
            userDefaults.set(true, forKey: UserDefaultsKeys.isActivated)
            userDefaults.set(true, forKey: "isServerLocked")
            userDefaults.set(kioskId, forKey: "kioskId")
            // Persist the baseURL to lock configuration source
            userDefaults.set(serverConfig.baseURL, forKey: "lockedServerURL")
            await refreshConfiguration()
        }
        
        return success
    }
    
    // MARK: - Configuration Updates
    func refreshConfiguration() async {
        guard let serverConfig = serverConfiguration, isActivated else { return }
        
        // Get kiosk configuration from API
        let kioskId = userDefaults.string(forKey: "kioskId") ?? Bundle.main.object(forInfoDictionaryKey: "KIOSK_ID") as? String ?? "unknown"
        
        // 1) Existing remote-config for kiosk
        if let configData = await APIService.shared.getKioskConfiguration(id: kioskId, serverURL: serverConfig.baseURL) {
            // Update local configuration with remote data
            if let roomName = configData["roomName"] as? String {
                userDefaults.set(roomName, forKey: "kioskRoomName")
            }
            if let logoUrl = configData["logoUrl"] as? String {
                userDefaults.set(logoUrl, forKey: "kioskLogoUrl")
            }
            if let backgroundUrl = configData["backgroundUrl"] as? String {
                userDefaults.set(backgroundUrl, forKey: "kioskBackgroundUrl")
            }
            if let statusMessages = configData["statusMessages"] as? [String: String] {
                for (key, message) in statusMessages {
                    userDefaults.set(message, forKey: "statusMessage_\(key)")
                }
            }
            if let features = configData["features"] as? [String: Bool] {
                for (key, enabled) in features {
                    userDefaults.set(enabled, forKey: "feature_\(key)")
                }
            }
        }
        
        // 2) Optional core config for remote skinning parity
        if let coreConfig = await APIService.shared.getCoreConfig(kioskId: kioskId, serverURL: serverConfig.baseURL) {
            if let theme = coreConfig["theme"] as? [String: Any] {
                if let logo = theme["logo_url"] as? String { userDefaults.set(logo, forKey: "kioskLogoUrl") }
                if let primary = theme["primary_color"] as? String { userDefaults.set(primary, forKey: "kioskPrimaryColor") }
            }
            if let forms = coreConfig["forms"] as? [String: Any] {
                if let defForm = forms["default_ticket_form_id"] as? String { userDefaults.set(defForm, forKey: "kioskDefaultFormId") }
            }
            if let cosmo = coreConfig["cosmo"] as? [String: Any] {
                if let enabled = cosmo["enabled"] as? Bool { userDefaults.set(enabled, forKey: "feature_cosmoEnabled") }
                if let prompt = cosmo["preset_prompt"] as? String { userDefaults.set(prompt, forKey: "cosmoPresetPrompt") }
            }
        }
        
        // Notify UI of configuration update
        lastConfigUpdate = Date()
        userDefaults.set(lastConfigUpdate, forKey: UserDefaultsKeys.lastConfigUpdate)
        NotificationCenter.default.post(name: .configurationUpdated, object: nil)
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
        await MainActor.run {
            currentRoomName = name
            userDefaults.set(name, forKey: "kioskRoomName")
        }
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
            currentRoomName = "Conference Room"
            
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
        isServerLocked = userDefaults.bool(forKey: "isServerLocked")
        
        // Load room name
        currentRoomName = userDefaults.string(forKey: "kioskRoomName") ?? "Conference Room"
        
        // Load server configuration
        if let data = userDefaults.data(forKey: UserDefaultsKeys.serverConfig),
           let config = try? JSONDecoder().decode(ServerConfiguration.self, from: data) {
            serverConfiguration = config
        }
        // If locked, ensure serverConfiguration baseURL matches locked value
        if isServerLocked, let locked = userDefaults.string(forKey: "lockedServerURL") {
            if var cfg = serverConfiguration { cfg.baseURL = locked; serverConfiguration = cfg }
        }
        
        // Load last config update
        lastConfigUpdate = userDefaults.object(forKey: UserDefaultsKeys.lastConfigUpdate) as? Date
    }
    
    private func setupConfigUpdateTimer() {
        // Setup periodic configuration updates from Nova Universe server
        // Checks every 5 minutes if the kiosk has been deactivated or config changed
        configUpdateTimer = Timer.scheduledTimer(withTimeInterval: 300, repeats: true) { _ in
            Task {
                await self.checkServerStatus()
                await self.fetchLatestConfiguration()
            }
        }
    }
    
    private func checkServerStatus() async {
        // Check with Nova Universe server if kiosk is still activated
        guard let serverConfig = serverConfiguration else { return }
        
        do {
            guard let url = URL(string: "\(serverConfig.serverURL)/api/kiosks/\(deviceId)") else {
                print("Invalid kiosk status URL")
                return
            }
            
            var request = URLRequest(url: url)
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("Bearer \(serverConfig.token)", forHTTPHeaderField: "Authorization")
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode == 200 {
                    let kioskData = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                    
                    if let isActive = kioskData?["isActive"] as? Bool, !isActive {
                        // Kiosk has been deactivated on the server
                        await MainActor.run {
                            self.deactivateKiosk()
                        }
                        print("Kiosk deactivated by server")
                    }
                    
                    // Update last successful check
                    lastConfigUpdate = Date()
                    userDefaults.set(lastConfigUpdate, forKey: UserDefaultsKeys.lastConfigUpdate)
                } else if httpResponse.statusCode == 404 {
                    // Kiosk not found on server - deactivate
                    await MainActor.run {
                        self.deactivateKiosk()
                    }
                    print("Kiosk not found on server - deactivating")
                }
            }
        } catch {
            print("Error checking server status: \(error)")
        }
    }
    
    private func fetchLatestConfiguration() async {
        // Fetch latest configuration from Nova Universe server
        guard let serverConfig = serverConfiguration else { return }
        
        do {
            guard let url = URL(string: "\(serverConfig.serverURL)/api/kiosks/\(deviceId)/config") else {
                return
            }
            
            var request = URLRequest(url: url)
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("Bearer \(serverConfig.token)", forHTTPHeaderField: "Authorization")
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                let configData = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                
                // Update configuration if changed
                if let newLocation = configData?["location"] as? String {
                    await MainActor.run {
                        self.location = newLocation
                        self.userDefaults.set(newLocation, forKey: UserDefaultsKeys.location)
                    }
                }
                
                print("Configuration updated from server")
            }
        } catch {
            print("Error fetching latest configuration: \(error)")
        }
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
