//
//  AdminLoginView.swift
//  CueIT Kiosk
//
//  Created by Tristen Neibarger on 7/2/25.
//

import SwiftUI
import AuthenticationServices

struct AdminLoginView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var configService: ConfigService
    @State private var pin = ""
    @State private var email = ""
    @State private var password = ""
    @State private var loginMode: LoginMode = .pin
    @State private var errorText: String?
    @State private var loading = false
    @State private var showPolicy = false
    @State private var isAuthenticated = false
    @State private var showServerConfig = false
    @State private var adminToken: String?
    @FocusState private var isFocused: Bool
    
    enum LoginMode {
        case pin
        case emailPassword
        case passkey
    }
    
    // Admin session management
    private static let adminSessionKey = "adminSessionExpiry"
    private static let adminTokenKey = "adminToken"
    private static let sessionDuration: TimeInterval = 14400 // 4 hours
    
    private var isSessionValid: Bool {
        guard let expiry = UserDefaults.standard.object(forKey: Self.adminSessionKey) as? Date else {
            return false
        }
        return expiry > Date()
    }
    
    private func startAdminSession(token: String? = nil) {
        let expiry = Date().addingTimeInterval(Self.sessionDuration)
        UserDefaults.standard.set(expiry, forKey: Self.adminSessionKey)
        if let token = token {
            UserDefaults.standard.set(token, forKey: Self.adminTokenKey)
            adminToken = token
        }
    }
    
    private func endAdminSession() {
        UserDefaults.standard.removeObject(forKey: Self.adminSessionKey)
        UserDefaults.standard.removeObject(forKey: Self.adminTokenKey)
        adminToken = nil
    }
    
    private func loadStoredToken() {
        adminToken = UserDefaults.standard.string(forKey: Self.adminTokenKey)
    }
    
    private var isLoginFormValid: Bool {
        switch loginMode {
        case .pin:
            return pin.count == 6
        case .emailPassword:
            return !email.isEmpty && !password.isEmpty
        case .passkey:
            return true // Passkey authentication doesn't require form validation
        }
    }

    var body: some View {
        NavigationView {
            if isAuthenticated {
                AdminPanelView(
                    adminToken: adminToken,
                    onDismiss: { 
                        endAdminSession()
                        dismiss() 
                    }
                )
            } else {
                ScrollView {
                    VStack(spacing: 32) {
                        // Logo/Header
                        VStack(spacing: 16) {
                            Image(systemName: "lock.shield")
                                .font(.system(size: 64))
                                .foregroundColor(Theme.Colors.primary)
                            
                            Text("CueIT Portal")
                                .font(.largeTitle)
                                .fontWeight(.bold)
                                .foregroundColor(Theme.Colors.content)
                            
                            Text("Admin Authentication")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        .padding(.top, 40)
                        
                        // Login Form Card
                        VStack(spacing: 24) {
                            // Login mode selector
                            Picker("Login Mode", selection: $loginMode) {
                                Text("PIN").tag(LoginMode.pin)
                                Text("Email & Password").tag(LoginMode.emailPassword)
                                Text("Passkey").tag(LoginMode.passkey)
                            }
                            .pickerStyle(.segmented)
                            
                            // Login Form Content
                            if loginMode == .pin {
                                VStack(spacing: 20) {
                                    Text("Enter 6-digit PIN")
                                        .font(.headline)
                                        .foregroundColor(Theme.Colors.content)
                                    
                                    HStack(spacing: 12) {
                                        ForEach(0..<6, id: \.self) { index in
                                            PinDigitView(
                                                digit: pin.count > index ? String(pin[pin.index(pin.startIndex, offsetBy: index)]) : "",
                                                isFilled: pin.count > index
                                            )
                                        }
                                    }
                                    .onTapGesture {
                                        isFocused = true
                                    }
                                    
                                    // Hidden text field for PIN input
                                    TextField("", text: $pin)
                                        .keyboardType(.numberPad)
                                        .textContentType(.oneTimeCode)
                                        .opacity(0)
                                        .frame(height: 0)
                                        .focused($isFocused)
                                        .onChange(of: pin) { _, newValue in
                                            pin = String(newValue.filter { $0.isNumber }.prefix(6))
                                        }
                                }
                            } else if loginMode == .passkey {
                                VStack(spacing: 20) {
                                    Image(systemName: "key.fill")
                                        .font(.system(size: 48))
                                        .foregroundColor(Theme.Colors.primary)
                                    
                                    Text("Passkey Authentication")
                                        .font(.headline)
                                        .foregroundColor(Theme.Colors.content)
                                    
                                    Text("Use Face ID, Touch ID, or your security key to authenticate")
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                        .multilineTextAlignment(.center)
                                }
                            } else {
                                VStack(spacing: 16) {
                                    Text("Email & Password")
                                        .font(.headline)
                                        .foregroundColor(Theme.Colors.content)
                                    
                                    VStack(spacing: 12) {
                                        TextField("Email", text: $email)
                                            .textFieldStyle(.roundedBorder)
                                            .keyboardType(.emailAddress)
                                            .autocapitalization(.none)
                                            .autocorrectionDisabled()
                                            .focused($isFocused)
                                        
                                        SecureField("Password", text: $password)
                                            .textFieldStyle(.roundedBorder)
                                            .focused($isFocused)
                                    }
                                }
                            }
                            
                            // Error Message
                            if let msg = errorText {
                                Text(msg)
                                    .foregroundColor(Theme.Colors.accent)
                                    .font(.subheadline)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal)
                            }
                            
                            // Loading Indicator
                            if loading {
                                ProgressView()
                                    .scaleEffect(1.2)
                            }
                            
                            // Login Button
                            Button(action: login) {
                                HStack {
                                    if loading {
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: Theme.Colors.base))
                                            .scaleEffect(0.8)
                                    }
                                    Text(loginMode == .passkey ? "Authenticate with Passkey" : "Sign In")
                                        .fontWeight(.semibold)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(isLoginFormValid && !loading ? Theme.Colors.primary : Color.gray)
                                .foregroundColor(Theme.Colors.base)
                                .cornerRadius(8)
                            }
                            .disabled(!isLoginFormValid || loading)
                        }
                        .padding(24)
                        .background(Color(.systemBackground))
                        .cornerRadius(16)
                        .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 4)
                        
                        Spacer(minLength: 40)
                    }
                    .padding(.horizontal, 24)
                }
                .background(Color(.systemGroupedBackground))
                .navigationTitle("")
                .navigationBarHidden(true)
                .onAppear {
                    loadStoredToken()
                    if isSessionValid {
                        isAuthenticated = true
                    } else {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                            isFocused = true
                        }
                    }
                }
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Privacy") { showPolicy = true }
                    }
                }
                .sheet(isPresented: $showPolicy) {
                    PrivacyPolicyView()
                }
            }
        }
        .sheet(isPresented: $showServerConfig) {
            ServerConfigView()
        }
    }
    
    private func login() {
        loading = true
        errorText = nil
        
        switch loginMode {
        case .pin:
            configService.verifyPin(pin) { ok, error in
                loading = false
                if ok {
                    startAdminSession()
                    isAuthenticated = true
                    pin = "" // Clear PIN for security
                } else if let error = error {
                    handleLoginError(error)
                } else {
                    errorText = "Invalid PIN"
                }
            }
            
        case .emailPassword:
            Task {
                do {
                    let response = try await performKioskAdminLogin()
                    await MainActor.run {
                        loading = false
                        if response.success, let token = response.token {
                            startAdminSession(token: token)
                            isAuthenticated = true
                            email = ""
                            password = ""
                        } else {
                            errorText = response.error ?? "Login failed"
                        }
                    }
                } catch {
                    await MainActor.run {
                        loading = false
                        handleLoginError(error)
                    }
                }
            }
            
        case .passkey:
            Task {
                do {
                    let response = try await performPasskeyAuthentication()
                    await MainActor.run {
                        loading = false
                        if response.success, let token = response.token {
                            startAdminSession(token: token)
                            isAuthenticated = true
                        } else {
                            errorText = response.error ?? "Passkey authentication failed"
                        }
                    }
                } catch {
                    await MainActor.run {
                        loading = false
                        handleLoginError(error)
                    }
                }
            }
        }
    }
    
    private func handleLoginError(_ error: Error) {
        let nsError = error as NSError
        switch nsError.code {
        case -1004: // Cannot connect to host
            errorText = "Cannot reach server"
        case -1001: // Request timeout
            errorText = "Connection timeout"
        case -1009: // Internet connection appears to be offline
            errorText = "No internet connection"
        case (-1204)...(-1200): // SSL errors
            errorText = "SSL connection error"
        default:
            if nsError.domain == NSURLErrorDomain {
                errorText = "Network error"
            } else {
                errorText = "Connection failed"
            }
        }
    }
    
    private func performKioskAdminLogin() async throws -> KioskAdminLoginResponse {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosk-admin-login") else {
            throw URLError(.badURL)
        }
        
        let request = KioskAdminLoginRequest(
            email: email,
            password: password,
            kioskId: KioskService.shared.id
        )
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try JSONEncoder().encode(request)
        
        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        return try JSONDecoder().decode(KioskAdminLoginResponse.self, from: data)
    }
    
    private func performPasskeyAuthentication() async throws -> KioskAdminLoginResponse {
        // First, get authentication options from the server
        guard let optionsUrl = URL(string: "\(APIConfig.baseURL)/api/passkey/authenticate/begin") else {
            throw URLError(.badURL)
        }
        
        var optionsRequest = URLRequest(url: optionsUrl)
        optionsRequest.httpMethod = "POST"
        optionsRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let (optionsData, optionsResponse) = try await URLSession.shared.data(for: optionsRequest)
        
        guard let httpOptionsResponse = optionsResponse as? HTTPURLResponse,
              httpOptionsResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        let authOptions = try JSONSerialization.jsonObject(with: optionsData) as? [String: Any]
        guard let challenge = authOptions?["challenge"] as? String else {
            throw URLError(.cannotParseResponse)
        }
        
        // Create authentication request using AuthenticationServices
        let authRequest = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: APIConfig.baseURL)
            .createCredentialAssertionRequest(challenge: Data(base64URLEncoded: challenge) ?? Data())
        
        authRequest.userVerificationPreference = .preferred
        
        // If there are allowCredentials, add them
        if let allowCredentials = authOptions?["allowCredentials"] as? [[String: Any]] {
            let credentialDescriptors = allowCredentials.compactMap { cred -> ASAuthorizationPlatformPublicKeyCredentialDescriptor? in
                guard let credId = cred["id"] as? String,
                      let credIdData = Data(base64URLEncoded: credId) else { return nil }
                return ASAuthorizationPlatformPublicKeyCredentialDescriptor(credentialID: credIdData)
            }
            authRequest.allowedCredentials = credentialDescriptors
        }
        
        // Perform the authentication
        let authController = ASAuthorizationController(authorizationRequests: [authRequest])
        
        return try await withCheckedThrowingContinuation { continuation in
            let delegate = PasskeyAuthDelegate { result in
                switch result {
                case .success(let credential):
                    Task {
                        do {
                            let response = try await self.completePasskeyAuthentication(credential: credential)
                            continuation.resume(returning: response)
                        } catch {
                            continuation.resume(throwing: error)
                        }
                    }
                case .failure(let error):
                    continuation.resume(throwing: error)
                }
            }
            
            authController.delegate = delegate
            authController.presentationContextProvider = delegate
            authController.performRequests()
        }
    }
    
    private func completePasskeyAuthentication(credential: ASAuthorizationPlatformPublicKeyCredentialAssertion) async throws -> KioskAdminLoginResponse {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/passkey/authenticate/complete") else {
            throw URLError(.badURL)
        }
        
        let credentialData: [String: Any] = [
            "id": credential.credentialID.base64URLEncodedString(),
            "rawId": credential.credentialID.base64URLEncodedString(),
            "response": [
                "clientDataJSON": credential.rawClientDataJSON.base64URLEncodedString(),
                "authenticatorData": credential.rawAuthenticatorData.base64URLEncodedString(),
                "signature": credential.signature.base64URLEncodedString(),
                "userHandle": credential.userID?.base64URLEncodedString() ?? ""
            ],
            "type": "public-key",
            "kioskId": KioskService.shared.id
        ]
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: credentialData)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        return try JSONDecoder().decode(KioskAdminLoginResponse.self, from: data)
    }
}

// MARK: - Passkey Authentication Delegate
class PasskeyAuthDelegate: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    private let completion: (Result<ASAuthorizationPlatformPublicKeyCredentialAssertion, Error>) -> Void
    
    init(completion: @escaping (Result<ASAuthorizationPlatformPublicKeyCredentialAssertion, Error>) -> Void) {
        self.completion = completion
    }
    
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialAssertion {
            completion(.success(credential))
        } else {
            completion(.failure(URLError(.userAuthenticationRequired)))
        }
    }
    
    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        completion(.failure(error))
    }
    
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first else {
            return UIWindow()
        }
        return window
    }
}

// MARK: - Data Extension for Base64URL
extension Data {
    init?(base64URLEncoded string: String) {
        var base64 = string
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        
        // Add padding if needed
        let remainder = base64.count % 4
        if remainder > 0 {
            base64 += String(repeating: "=", count: 4 - remainder)
        }
        
        self.init(base64Encoded: base64)
    }
    
    func base64URLEncodedString() -> String {
        return self.base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}

// MARK: - Data Structures for Kiosk Admin Login
struct KioskAdminLoginRequest: Codable {
    let email: String
    let password: String
    let kioskId: String
}

struct KioskAdminLoginResponse: Codable {
    let success: Bool
    let token: String?
    let admin: AdminInfo?
    let error: String?
}

struct AdminInfo: Codable {
    let id: String
    let email: String
    let name: String
}

// MARK: - Office Hours and Schedule Data Structures
struct OfficeHoursInfo {
    let enabled: Bool
    let title: String
    let schedule: [DayScheduleDisplay]
    let showNextOpen: Bool
}

struct DayScheduleDisplay {
    let day: String
    let enabled: Bool
    let slots: [TimeSlotDisplay]
}

struct TimeSlotDisplay {
    let start: String
    let end: String
}

struct KioskScheduleConfig: Codable {
    let schedule: ScheduleConfigData?
    let officeHours: OfficeHoursData?
}

struct ScheduleConfigData: Codable {
    let enabled: Bool
    let schedule: [String: DayScheduleData]
    let timezone: String
}

struct OfficeHoursData: Codable {
    let enabled: Bool
    let title: String
    let schedule: [String: DayScheduleData]
    let timezone: String
    let showNextOpen: Bool
}

struct DayScheduleData: Codable {
    let enabled: Bool
    let slots: [TimeSlotData]
}

struct TimeSlotData: Codable {
    let start: String
    let end: String
}

struct AdminPanelView: View {
    let adminToken: String?
    let onDismiss: () -> Void
    @State private var showServerConfig = false
    @State private var currentStatus: String = "open"
    @State private var updatingStatus = false
    @State private var officeHours: OfficeHoursInfo?
    @StateObject private var kioskService = KioskService.shared
    @StateObject private var statusService = StatusService.shared
    
    private let statusOptions: [(key: String, label: String, color: Color)] = [
        ("open", "Open", .green),
        ("closed", "Closed", .red),
        ("meeting", "In a Meeting", .purple),
        ("brb", "Be Right Back", .yellow),
        ("lunch", "Out to Lunch", .orange)
    ]
    
    var body: some View {
        List {
            Section("Status Control") {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Change Kiosk Status")
                        .font(.headline)
                    
                    if let status = statusService.latest {
                        HStack {
                            Text("Current:")
                            Spacer()
                            HStack {
                                Circle()
                                    .fill(Theme.Colors.color(for: status.status))
                                    .frame(width: 12, height: 12)
                                Text(statusLabel(for: status.status))
                                    .fontWeight(.medium)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                    
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 8) {
                        ForEach(statusOptions, id: \.key) { option in
                            Button(action: {
                                updateStatus(to: option.key)
                            }) {
                                HStack {
                                    Circle()
                                        .fill(option.color)
                                        .frame(width: 10, height: 10)
                                    Text(option.label)
                                        .font(.caption)
                                        .fontWeight(.medium)
                                }
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(Color.gray.opacity(0.1))
                                .cornerRadius(8)
                            }
                            .buttonStyle(.plain)
                            .disabled(updatingStatus)
                        }
                    }
                    
                    if updatingStatus {
                        HStack {
                            ProgressView()
                                .scaleEffect(0.8)
                            Text("Updating status...")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    }
                }
                .padding(.vertical, 4)
            }
            
            // Office Hours Display (if available)
            if let hours = officeHours, hours.enabled {
                Section("Office Hours") {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(hours.title)
                            .font(.headline)
                        
                        ForEach(hours.schedule, id: \.day) { daySchedule in
                            if daySchedule.enabled && !daySchedule.slots.isEmpty {
                                HStack {
                                    Text(daySchedule.day)
                                        .frame(width: 80, alignment: .leading)
                                        .font(.caption)
                                    VStack(alignment: .leading, spacing: 2) {
                                        ForEach(daySchedule.slots, id: \.start) { slot in
                                            Text("\(slot.start) - \(slot.end)")
                                                .font(.caption)
                                                .foregroundColor(.gray)
                                        }
                                    }
                                    Spacer()
                                }
                            }
                        }
                        
                        if hours.showNextOpen {
                            Text("Next open: \(nextOpenTime)")
                                .font(.caption)
                                .foregroundColor(.blue)
                                .padding(.top, 4)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            
            Section("Server Configuration") {
                HStack {
                    VStack(alignment: .leading) {
                        Text("Current Server")
                        Text(APIConfig.baseURL)
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    Spacer()
                    Button("Change") {
                        showServerConfig = true
                    }
                    .foregroundColor(.blue)
                }
            }
            
            Section("Kiosk Information") {
                HStack {
                    Text("State")
                    Spacer()
                    Text(kioskService.state.description)
                        .foregroundColor(.gray)
                }
                
                if !kioskService.statusMessage.isEmpty {
                    HStack {
                        Text("Status")
                        Spacer()
                        Text(kioskService.statusMessage)
                            .foregroundColor(.gray)
                    }
                }
                
                HStack {
                    Text("Kiosk ID")
                    Spacer()
                    Text(kioskService.id)
                        .font(.caption)
                        .foregroundColor(.gray)
                        .onTapGesture {
                            UIPasteboard.general.string = kioskService.id
                        }
                }
            }
            
            Section("Actions") {
                Button("Refresh Status") {
                    Task { await kioskService.checkActive() }
                }
                
                Button("Reset Configuration") {
                    APIConfig.resetToDefault()
                    Task {
                        await kioskService.checkActive()
                    }
                }
                .foregroundColor(.red)
            }
        }
        .navigationTitle("CueIT Portal")
        .onAppear {
            loadCurrentStatus()
            loadOfficeHours()
        }
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Done") { onDismiss() }
            }
        }
        .sheet(isPresented: $showServerConfig) {
            ServerConfigView()
        }
    }
    
    // Helper functions for AdminPanelView
    private func statusLabel(for status: String) -> String {
        switch status.lowercased() {
        case "open": return "Open"
        case "closed": return "Closed"
        case "meeting": return "In a Meeting"
        case "brb": return "Be Right Back"
        case "lunch": return "Out to Lunch"
        default: return status.capitalized
        }
    }
    
    private func updateStatus(to newStatus: String) {
        guard let token = adminToken else { return }
        
        updatingStatus = true
        Task {
            do {
                try await performStatusUpdate(to: newStatus, with: token)
                await MainActor.run {
                    updatingStatus = false
                    // Status will be updated via the status service automatically
                }
            } catch {
                await MainActor.run {
                    updatingStatus = false
                    // Could show an error message here
                }
            }
        }
    }
    
    private func performStatusUpdate(to status: String, with token: String) async throws {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(KioskService.shared.id)/admin-status") else {
            throw URLError(.badURL)
        }
        
        let requestBody = ["status": status]
        
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(token, forHTTPHeaderField: "X-Kiosk-Admin-Token")
        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
    }
    
    private func loadCurrentStatus() {
        // Current status is already loaded via StatusService
        if let status = statusService.latest {
            currentStatus = status.status
        }
    }
    
    private func loadOfficeHours() {
        Task {
            do {
                let config = try await fetchKioskScheduleConfig()
                await MainActor.run {
                    if let hoursData = config.officeHours, hoursData.enabled {
                        officeHours = convertToDisplayFormat(hoursData)
                    }
                }
            } catch {
                // Silently fail - office hours are optional
            }
        }
    }
    
    private func fetchKioskScheduleConfig() async throws -> KioskScheduleConfig {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(KioskService.shared.id)/schedule-config") else {
            throw URLError(.badURL)
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        return try JSONDecoder().decode(KioskScheduleConfig.self, from: data)
    }
    
    private func convertToDisplayFormat(_ hoursData: OfficeHoursData) -> OfficeHoursInfo {
        let days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        let dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
        let schedule = days.enumerated().compactMap { index, dayKey -> DayScheduleDisplay? in
            guard let dayData = hoursData.schedule[dayKey] else { return nil }
            return DayScheduleDisplay(
                day: dayNames[index],
                enabled: dayData.enabled,
                slots: dayData.slots.map { TimeSlotDisplay(start: $0.start, end: $0.end) }
            )
        }
        
        return OfficeHoursInfo(
            enabled: hoursData.enabled,
            title: hoursData.title,
            schedule: schedule,
            showNextOpen: hoursData.showNextOpen
        )
    }
    
    private var nextOpenTime: String {
        // This would calculate the actual next open time based on schedule
        // For now, return a placeholder
        return "Tomorrow 9:00 AM"
    }
}

struct PinDigitView: View {
    let digit: String
    let isFilled: Bool
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemBackground))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(isFilled ? Theme.Colors.primary : Color(.systemGray4), lineWidth: 2)
                )
                .frame(width: 48, height: 56)
            
            Text(digit)
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(isFilled ? Theme.Colors.primary : Color(.systemGray2))
        }
        .animation(.easeInOut(duration: 0.2), value: isFilled)
    }
}
