import Foundation
import Combine

enum ActivationState {
    case checking
    case needsServerConfig
    case waitingForActivation
    case active
    case inactive
    case error
    
    var description: String {
        switch self {
        case .checking: return "Checking"
        case .needsServerConfig: return "Needs Server Config"
        case .waitingForActivation: return "Waiting for Activation"
        case .active: return "Active"
        case .inactive: return "Inactive"
        case .error: return "Error"
        }
    }
}

@MainActor
class KioskService: ObservableObject {
    static let shared = KioskService()
    private let token: String
    
    @Published var state: ActivationState = .checking
    @Published var activationError: Bool = false
    @Published var statusMessage: String = ""
    
    private var timer: Timer?
    private static let minInterval: TimeInterval = 30
    private static let maxInterval: TimeInterval = 300
    private var pollInterval: TimeInterval = minInterval
    private var cancellables = Set<AnyCancellable>()

    let id: String = {
        if let saved = KeychainService.string(for: "kioskId") {
            return saved
        }
        if let migrated = UserDefaults.standard.string(forKey: "kioskId") {
            KeychainService.set(migrated, for: "kioskId")
            UserDefaults.standard.removeObject(forKey: "kioskId")
            return migrated
        }
        let new = UUID().uuidString
        KeychainService.set(new, for: "kioskId")
        return new
    }()
    
    private init() {
        token = Bundle.main.object(forInfoDictionaryKey: "KIOSK_TOKEN") as? String ?? ""
        checkInitialState()
    }
    
    private func checkInitialState() {
        // Check if server URL is configured (not using default)
        let defaultURL = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String ?? "http://127.0.0.1:3000"
        if APIConfig.baseURL == defaultURL && UserDefaults.standard.string(forKey: "serverURL") == nil {
            state = .needsServerConfig
            statusMessage = "Server configuration required"
        } else {
            state = .checking
            statusMessage = "Connecting to server..."
            startPolling()
        }
    }
    
    func configureServer(_ url: String) {
        APIConfig.baseURL = url
        statusMessage = "Connecting to server..."
        state = .checking
        startPolling()
    }

    func register(version: String) async {
        statusMessage = "Registering kiosk..."
        guard let url = URL(string: "\(APIConfig.baseURL)/api/register-kiosk") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        var body: [String: Any] = ["id": id, "version": version]
        if !token.isEmpty {
            body["token"] = token
        }
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        _ = try? await URLSession.shared.data(for: req)
    }

    func checkActive() async {
        statusMessage = "Checking activation status..."
        guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(id)") else { 
            state = .error
            activationError = true
            statusMessage = "Invalid server URL"
            return 
        }
        
        struct KioskResponse: Codable { 
            var active: Int
            var directoryEnabled: Bool?
            var directoryProvider: String?
            var id: String?
            var last_seen: String?
            var version: String?
            var logoUrl: String?
            var bgUrl: String?
            var statusEnabled: Int?
            var currentStatus: String?
            var openMsg: String?
            var closedMsg: String?
            var errorMsg: String?
            var schedule: String?
        }
        var success = false
        do {
            // Configure URLSession for iOS simulator compatibility
            let config = URLSessionConfiguration.default
            config.timeoutIntervalForRequest = 10
            config.timeoutIntervalForResource = 30
            let session = URLSession(configuration: config)
            
            let (data, response) = try await session.data(from: url)
            
            // Check HTTP response status
            if let httpResponse = response as? HTTPURLResponse {
                print("HTTP Status: \(httpResponse.statusCode) for URL: \(url)")
                if httpResponse.statusCode != 200 {
                    self.state = .error
                    self.activationError = true
                    self.statusMessage = "Server error (HTTP \(httpResponse.statusCode))"
                    return
                }
            }
            
            // Log the raw response for debugging
            if let jsonString = String(data: data, encoding: .utf8) {
                print("Raw JSON response: \(jsonString)")
            }
            
            if let kioskData = try? JSONDecoder().decode(KioskResponse.self, from: data) {
                if kioskData.active == 1 {
                    self.state = .active
                    self.statusMessage = "Kiosk is active"
                } else {
                    self.state = .waitingForActivation  
                    self.statusMessage = "Waiting for admin activation..."
                }
                self.activationError = false
                success = true
            } else {
                // Try to parse as a generic dictionary to see what we're getting
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    print("Parsed JSON: \(json)")
                    // Check if it's an empty object (kiosk not found)
                    if json.isEmpty {
                        self.state = .waitingForActivation
                        self.statusMessage = "Kiosk not registered - waiting for activation..."
                        self.activationError = false
                        success = true
                    } else {
                        self.state = .error
                        self.activationError = true
                        self.statusMessage = "Failed to parse server response structure"
                    }
                } else {
                    self.state = .error
                    self.activationError = true
                    self.statusMessage = "Failed to parse server response"
                }
            }
        } catch {
            self.state = .error
            self.activationError = true
            // Clean up connection error message
            let errorDesc = error.localizedDescription
            if errorDesc.contains("Could not connect to the server") || errorDesc.contains("The Internet connection appears to be offline") {
                self.statusMessage = "Unable to reach server"
            } else if errorDesc.contains("timeout") {
                self.statusMessage = "Connection timeout"
            } else if errorDesc.contains("DNS") || errorDesc.contains("host") {
                self.statusMessage = "Server not found"
            } else {
                self.statusMessage = "Connection failed"
            }
            print("Connection error: \(error)")
        }

        if success {
            pollInterval = Self.minInterval
        } else {
            pollInterval = min(pollInterval * 2, Self.maxInterval)
        }
    }

    func activate() async -> Bool {
        statusMessage = "Activating kiosk..."
        guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(id)/active") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "PUT"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONEncoder().encode(["active": true])
        do {
            _ = try await URLSession.shared.data(for: req)
            state = .active
            activationError = false
            statusMessage = "Kiosk activated successfully"
            return true
        } catch {
            activationError = true
            statusMessage = "Activation failed"
            return false
        }
    }
    
    func activateWithCode(_ activationCode: String) async -> Bool {
        // Validate activation code format
        guard !activationCode.isEmpty, 
              activationCode.count >= 6 && activationCode.count <= 8,
              activationCode.range(of: "^[A-Z0-9]+$", options: .regularExpression) != nil else {
            statusMessage = "Invalid activation code format"
            activationError = true
            return false
        }
        
        statusMessage = "Processing activation code..."
        guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosks/activate") else { 
            statusMessage = "Invalid server URL"
            activationError = true
            return false 
        }
        
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 30.0 // Add timeout
        
        let body = ["kioskId": id, "activationCode": activationCode.uppercased()]
        req.httpBody = try? JSONEncoder().encode(body)
        
        do {
            let (data, response) = try await URLSession.shared.data(for: req)
            
            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode == 200 {
                    state = .active
                    activationError = false
                    statusMessage = "Kiosk activated successfully"
                    return true
                } else if httpResponse.statusCode == 400 {
                    // Parse error message from response
                    if let errorData = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                       let errorMessage = errorData["error"] as? String {
                        statusMessage = errorMessage
                    } else {
                        statusMessage = "Invalid or expired activation code"
                    }
                    activationError = true
                    return false
                } else {
                    statusMessage = "Server error (HTTP \(httpResponse.statusCode))"
                    activationError = true
                    return false
                }
            } else {
                statusMessage = "Invalid server response"
                activationError = true
                return false
            }
        } catch {
            statusMessage = "Network error: \(error.localizedDescription)"
            activationError = true
            return false
        }
    }

    private func pollAndScheduleNext() async {
        await checkActive()
        scheduleNextPoll()
    }

    private func scheduleNextPoll() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: pollInterval, repeats: false) { _ in
            Task { await self.pollAndScheduleNext() }
        }
    }

    private func startPolling() {
        guard state != .needsServerConfig else { return }
        Task { await pollAndScheduleNext() }
    }
}
