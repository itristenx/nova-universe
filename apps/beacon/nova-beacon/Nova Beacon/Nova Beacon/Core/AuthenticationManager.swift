//
//  AuthenticationManager.swift
//  Nova Beacon
//
//  Manages admin authentication and permissions
//

import SwiftUI
import Combine
import LocalAuthentication

@MainActor
class AuthenticationManager: ObservableObject {
    static let shared = AuthenticationManager()
    
    // MARK: - Published Properties
    @Published var isAdminAuthenticated = false
    @Published var currentAdminSession: AdminSession?
    @Published var authenticationMethod: AuthMethod = .pin
    @Published var biometricType: BiometricType = .none
    
    // MARK: - Private Properties
    private var sessionTimer: Timer?
    private let sessionTimeout: TimeInterval = 900 // 15 minutes
    private let keychain = KeychainManager()
    
    private init() {
        checkBiometricAvailability()
    }
    
    // MARK: - Admin Authentication
    func authenticateAdmin(with credential: String) async -> Bool {
        let success = await validateCredential(credential)
        
        if success {
            startAdminSession()
        }
        
        return success
    }
    
    func authenticateWithBiometrics() async -> Bool {
        guard biometricType != .none else { return false }
        
        let context = LAContext()
        var error: NSError?
        
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            return false
        }
        
        do {
            let reason = "Authenticate to access kiosk admin settings"
            let success = try await context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason)
            
            if success {
                startAdminSession()
            }
            
            return success
        } catch {
            print("Biometric authentication failed: \(error)")
            return false
        }
    }
    
    func logout() {
        isAdminAuthenticated = false
        currentAdminSession = nil
        sessionTimer?.invalidate()
        sessionTimer = nil
    }
    
    func extendSession() {
        guard isAdminAuthenticated else { return }
        
        currentAdminSession?.extendSession()
        setupSessionTimer()
    }
    
    // MARK: - PIN Management
    func setAdminPIN(_ pin: String) -> Bool {
        let hashedPIN = hashPIN(pin)
        return keychain.store(key: "admin_pin", value: hashedPIN)
    }
    
    func hasAdminPINSet() -> Bool {
        return keychain.retrieve(key: "admin_pin") != nil
    }
    
    func changeAdminPIN(currentPIN: String, newPIN: String) async -> Bool {
        let isCurrentValid = await validateCredential(currentPIN)
        guard isCurrentValid else { return false }
        
        return setAdminPIN(newPIN)
    }
    
    // MARK: - Permissions
    func hasPermission(_ permission: AdminPermission) -> Bool {
        guard let session = currentAdminSession else { return false }
        return session.permissions.contains(permission)
    }
    
    func requestElevatedAccess(for permission: AdminPermission) async -> Bool {
        // For now, all authenticated admins have all permissions
        // This can be extended for role-based access control
        return isAdminAuthenticated
    }
    
    // MARK: - Private Methods
    private func validateCredential(_ credential: String) async -> Bool {
        // Check against stored PIN
        if let storedHash = keychain.retrieve(key: "admin_pin") {
            let credentialHash = hashPIN(credential)
            return credentialHash == storedHash
        }
        
        // If no PIN is set, check against server admin authentication
        if let serverConfig = ConfigurationManager.shared.serverConfiguration {
            return await validateServerAdminCredential(credential, serverURL: serverConfig.baseURL)
        }
        
        // Default PIN for first-time setup
        return credential == "admin123"
    }
    
    private func validateServerAdminCredential(_ credential: String, serverURL: String) async -> Bool {
        // This would validate against the server's admin PIN endpoint
        // For now, return false to force local PIN usage
        return false
    }
    
    private func startAdminSession() {
        isAdminAuthenticated = true
        currentAdminSession = AdminSession()
        setupSessionTimer()
    }
    
    private func setupSessionTimer() {
        sessionTimer?.invalidate()
        sessionTimer = Timer.scheduledTimer(withTimeInterval: sessionTimeout, repeats: false) { _ in
            Task { @MainActor in
                self.logout()
            }
        }
    }
    
    private func checkBiometricAvailability() {
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            switch context.biometryType {
            case .faceID:
                biometricType = .faceID
            case .touchID:
                biometricType = .touchID
            default:
                biometricType = .none
            }
        } else {
            biometricType = .none
        }
    }
    
    private func hashPIN(_ pin: String) -> String {
        // Simple hash for demo - in production, use proper password hashing
        return pin.data(using: .utf8)?.base64EncodedString() ?? ""
    }
}

// MARK: - Supporting Types
enum AuthMethod: String, CaseIterable {
    case pin = "PIN"
    case biometric = "Biometric"
    case server = "Server"
    
    var displayName: String {
        switch self {
        case .pin: return "PIN Code"
        case .biometric: return "Biometric"
        case .server: return "Server Authentication"
        }
    }
}

enum BiometricType {
    case none
    case touchID
    case faceID
    
    var displayName: String {
        switch self {
        case .none: return "Not Available"
        case .touchID: return "Touch ID"
        case .faceID: return "Face ID"
        }
    }
    
    var systemImage: String {
        switch self {
        case .none: return "person.crop.circle.badge.xmark"
        case .touchID: return "touchid"
        case .faceID: return "faceid"
        }
    }
}

enum AdminPermission: String, CaseIterable {
    case viewSettings = "view_settings"
    case modifySettings = "modify_settings"
    case viewLogs = "view_logs"
    case clearLogs = "clear_logs"
    case rebootKiosk = "reboot_kiosk"
    case changeServer = "change_server"
    case viewDiagnostics = "view_diagnostics"
    case factoryReset = "factory_reset"
    
    var displayName: String {
        switch self {
        case .viewSettings: return "View Settings"
        case .modifySettings: return "Modify Settings"
        case .viewLogs: return "View Logs"
        case .clearLogs: return "Clear Logs"
        case .rebootKiosk: return "Reboot Kiosk"
        case .changeServer: return "Change Server"
        case .viewDiagnostics: return "View Diagnostics"
        case .factoryReset: return "Factory Reset"
        }
    }
}

class AdminSession: ObservableObject {
    let id = UUID()
    let startTime = Date()
    @Published var lastActivity = Date()
    let permissions: Set<AdminPermission>
    
    init(permissions: Set<AdminPermission> = Set(AdminPermission.allCases)) {
        self.permissions = permissions
    }
    
    func extendSession() {
        lastActivity = Date()
    }
    
    var duration: TimeInterval {
        Date().timeIntervalSince(startTime)
    }
    
    var formattedDuration: String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
}
