import Foundation
import Combine

// MARK: - Connection Status Types
enum ConnectionState: String, CaseIterable {
    case connecting = "connecting"
    case connected = "connected"
    case disconnected = "disconnected"
    case error = "error"
    
    var displayName: String {
        switch self {
        case .connecting:
            return "Connecting"
        case .connected:
            return "Connected"
        case .disconnected:
            return "Disconnected"
        case .error:
            return "Connection Error"
        }
    }
    
    var systemColor: String {
        switch self {
        case .connecting:
            return "systemYellow"
        case .connected:
            return "systemGreen"
        case .disconnected:
            return "systemOrange"
        case .error:
            return "systemRed"
        }
    }
    
    var iconName: String {
        switch self {
        case .connecting:
            return "wifi.exclamationmark"
        case .connected:
            return "wifi"
        case .disconnected:
            return "wifi.slash"
        case .error:
            return "exclamationmark.triangle.fill"
        }
    }
}

// MARK: - Connection Status Model
class ConnectionStatus: ObservableObject {
    @Published var state: ConnectionState = .disconnected
    @Published var lastConnected: Date?
    @Published var serverUrl: String = ""
    @Published var kioskId: String = ""
    @Published var retryCount: Int = 0
    @Published var isRetrying: Bool = false
    @Published var errorMessage: String?
    
    private var reconnectTimer: Timer?
    private var healthCheckTimer: Timer?
    private let maxRetryCount = 5
    private let retryInterval: TimeInterval = 10.0
    private let healthCheckInterval: TimeInterval = 30.0
    
    init() {
        startHealthCheck()
    }
    
    deinit {
        stopTimers()
    }
    
    // MARK: - Public Methods
    func updateStatus(_ newState: ConnectionState, errorMessage: String? = nil) {
        DispatchQueue.main.async {
            self.state = newState
            self.errorMessage = errorMessage
            
            if newState == .connected {
                self.lastConnected = Date()
                self.retryCount = 0
                self.isRetrying = false
                self.stopReconnectTimer()
            } else if newState == .disconnected || newState == .error {
                if !self.isRetrying {
                    self.startReconnectTimer()
                }
            }
        }
    }
    
    func setServerInfo(url: String, kioskId: String) {
        DispatchQueue.main.async {
            self.serverUrl = url
            self.kioskId = kioskId
        }
    }
    
    func manualRetry() {
        guard !isRetrying else { return }
        
        DispatchQueue.main.async {
            self.retryCount = 0
            self.isRetrying = true
            self.state = .connecting
            self.errorMessage = nil
        }
        
        // Notify observers to attempt reconnection
        NotificationCenter.default.post(name: .connectionRetryRequested, object: nil)
    }
    
    func reset() {
        DispatchQueue.main.async {
            self.state = .disconnected
            self.lastConnected = nil
            self.retryCount = 0
            self.isRetrying = false
            self.errorMessage = nil
        }
        stopTimers()
    }
    
    // MARK: - Private Methods
    private func startReconnectTimer() {
        stopReconnectTimer()
        
        guard retryCount < maxRetryCount else {
            DispatchQueue.main.async {
                self.isRetrying = false
                self.state = .error
                self.errorMessage = "Connection failed after \(self.maxRetryCount) attempts"
            }
            return
        }
        
        DispatchQueue.main.async {
            self.isRetrying = true
            self.retryCount += 1
        }
        
        reconnectTimer = Timer.scheduledTimer(withTimeInterval: retryInterval, repeats: false) { [weak self] _ in
            guard let self = self else { return }
            
            DispatchQueue.main.async {
                self.state = .connecting
            }
            
            NotificationCenter.default.post(name: .connectionRetryRequested, object: nil)
        }
    }
    
    private func stopReconnectTimer() {
        reconnectTimer?.invalidate()
        reconnectTimer = nil
    }
    
    private func startHealthCheck() {
        healthCheckTimer = Timer.scheduledTimer(withTimeInterval: healthCheckInterval, repeats: true) { [weak self] _ in
            guard let self = self, self.state == .connected else { return }
            
            // Post health check notification
            NotificationCenter.default.post(name: .connectionHealthCheck, object: nil)
        }
    }
    
    private func stopTimers() {
        stopReconnectTimer()
        healthCheckTimer?.invalidate()
        healthCheckTimer = nil
    }
}

// MARK: - Notification Names
extension Notification.Name {
    static let connectionRetryRequested = Notification.Name("connectionRetryRequested")
    static let connectionHealthCheck = Notification.Name("connectionHealthCheck")
    static let connectionStatusChanged = Notification.Name("connectionStatusChanged")
    static let configurationUpdated = Notification.Name("configurationUpdated")
}

// MARK: - Connection Error Types
enum ConnectionError: Error, LocalizedError {
    case invalidURL
    case noInternetConnection
    case serverUnreachable
    case authenticationFailed
    case invalidResponse
    case timeout
    case unknown(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid server URL"
        case .noInternetConnection:
            return "No internet connection"
        case .serverUnreachable:
            return "Server unreachable"
        case .authenticationFailed:
            return "Authentication failed"
        case .invalidResponse:
            return "Invalid server response"
        case .timeout:
            return "Connection timeout"
        case .unknown(let error):
            return error.localizedDescription
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .invalidURL:
            return "Check the server URL in settings"
        case .noInternetConnection:
            return "Check your internet connection"
        case .serverUnreachable:
            return "Verify the server is running and accessible"
        case .authenticationFailed:
            return "Check your authentication credentials"
        case .invalidResponse:
            return "Contact your administrator"
        case .timeout:
            return "Try again in a moment"
        case .unknown:
            return "Contact your administrator for assistance"
        }
    }
}
