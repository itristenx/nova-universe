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

class KioskService: ObservableObject {
    static let shared = KioskService()
    private let token: String
    private init() {
        token = Bundle.main.object(forInfoDictionaryKey: "KIOSK_TOKEN") as? String ?? ""
        Task {
            await checkInitialState()
        }
    }

    @Published var state: ActivationState = .checking
    @Published var activationError: Bool = false
    @Published var statusMessage: String = ""
    private var timer: Timer?
    private static let minInterval: TimeInterval = 30
    private static let maxInterval: TimeInterval = 300
    private var pollInterval: TimeInterval = minInterval

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
    
    @MainActor
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
    
    @MainActor
    func configureServer(_ url: String) {
        APIConfig.baseURL = url
        statusMessage = "Connecting to server..."
        state = .checking
        startPolling()
    }

    func register(version: String) async {
        await MainActor.run { statusMessage = "Registering kiosk..." }
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

    @MainActor
    func checkActive() async {
        statusMessage = "Checking activation status..."
        guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(id)") else { 
            state = .error
            activationError = true
            statusMessage = "Invalid server URL"
            return 
        }
        
        struct KioskRow: Codable { var active: Int }
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
            
            if let row = try? JSONDecoder().decode(KioskRow.self, from: data) {
                if row.active == 1 {
                    self.state = .active
                    self.statusMessage = "Kiosk is active"
                } else {
                    self.state = .waitingForActivation  
                    self.statusMessage = "Waiting for admin activation..."
                }
                self.activationError = false
                success = true
            } else {
                self.state = .error
                self.activationError = true
                self.statusMessage = "Failed to parse server response"
            }
        } catch {
            self.state = .error
            self.activationError = true
            self.statusMessage = "Cannot connect to server: \(error.localizedDescription)"
            print("Connection error: \(error)")
        }

        if success {
            pollInterval = Self.minInterval
        } else {
            pollInterval = min(pollInterval * 2, Self.maxInterval)
        }
    }

    @MainActor
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
    
    @MainActor
    func activateWithCode(_ activationCode: String) async -> Bool {
        statusMessage = "Processing activation code..."
        guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosks/activate") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["kioskId": id, "activationCode": activationCode]
        req.httpBody = try? JSONEncoder().encode(body)
        
        do {
            let (_, response) = try await URLSession.shared.data(for: req)
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                state = .active
                activationError = false
                statusMessage = "Kiosk activated successfully"
                return true
            } else {
                activationError = true
                statusMessage = "Invalid activation code"
                return false
            }
        } catch {
            activationError = true
            statusMessage = "Activation failed"
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
