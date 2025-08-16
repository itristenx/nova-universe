//
//  ConnectionManager.swift
//  Nova Beacon
//
//  Manages network connectivity and server communication
//

import SwiftUI
import Network
import Combine

@MainActor
class ConnectionManager: ObservableObject {
    static let shared = ConnectionManager()
    
    // MARK: - Published Properties
    @Published var isConnected = false
    @Published var connectionQuality: ConnectionQuality = .unknown
    @Published var serverReachable = false
    @Published var lastPingTime: Date?
    @Published var connectionHistory: [ConnectionEvent] = []
    
    // MARK: - Private Properties
    private let monitor = NWPathMonitor()
    private let monitorQueue = DispatchQueue(label: "ConnectionMonitor")
    private var pingTimer: Timer?
    private var heartbeatTimer: Timer?
    
    private init() {}
    
    // MARK: - Public Methods
    func startMonitoring() async {
        await setupNetworkMonitoring()
        startServerPing()
        startHeartbeat()
    }
    
    nonisolated func stopMonitoring() {
        monitor.cancel()
        Task { @MainActor in
            pingTimer?.invalidate()
            pingTimer = nil
            heartbeatTimer?.invalidate()
            heartbeatTimer = nil
        }
    }
    
    func testConnection() async -> Bool {
        guard let serverConfig = ConfigurationManager.shared.serverConfiguration else {
            return false
        }
        
        let success = await APIService.shared.testConnection(serverURL: serverConfig.baseURL)
        
        await MainActor.run {
            serverReachable = success
            lastPingTime = Date()
            
            let event = ConnectionEvent(
                timestamp: Date(),
                type: success ? .connected : .disconnected,
                details: success ? "Server reachable" : "Server unreachable"
            )
            addConnectionEvent(event)
        }
        
        return success
    }
    
    func forceReconnect() async {
        let event = ConnectionEvent(
            timestamp: Date(),
            type: .reconnecting,
            details: "Manual reconnection attempt"
        )
        addConnectionEvent(event)
        
        _ = await testConnection()
    }
    
    // MARK: - Private Methods
    private func setupNetworkMonitoring() async {
        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor in
                self?.handlePathUpdate(path)
            }
        }
        
        monitor.start(queue: monitorQueue)
    }
    
    private func handlePathUpdate(_ path: NWPath) {
        let wasConnected = isConnected
        isConnected = path.status == .satisfied
        
        // Determine connection quality
        if path.status == .satisfied {
            if path.usesInterfaceType(.wifi) {
                connectionQuality = .excellent
            } else if path.usesInterfaceType(.wiredEthernet) {
                connectionQuality = .excellent
            } else if path.usesInterfaceType(.cellular) {
                connectionQuality = .good
            } else {
                connectionQuality = .fair
            }
        } else {
            connectionQuality = .none
        }
        
        // Log connection change
        if wasConnected != isConnected {
            let event = ConnectionEvent(
                timestamp: Date(),
                type: isConnected ? .connected : .disconnected,
                details: getConnectionDetails(path)
            )
            addConnectionEvent(event)
            
            // Test server connection when network comes back
            if isConnected {
                Task {
                    await testConnection()
                }
            } else {
                serverReachable = false
            }
        }
    }
    
    private func getConnectionDetails(_ path: NWPath) -> String {
        if path.status != .satisfied {
            return "Network unavailable"
        }
        
        var details: [String] = []
        
        if path.usesInterfaceType(.wifi) {
            details.append("WiFi")
        }
        if path.usesInterfaceType(.wiredEthernet) {
            details.append("Ethernet")
        }
        if path.usesInterfaceType(.cellular) {
            details.append("Cellular")
        }
        
        return details.isEmpty ? "Connected" : details.joined(separator: ", ")
    }
    
    private func startServerPing() {
        // Ping server every 30 seconds
        pingTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { _ in
            Task {
                await self.testConnection()
            }
        }
    }
    
    private func startHeartbeat() {
        // Kiosk heartbeat every 60 seconds to check-in
        heartbeatTimer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { _ in
            Task { @MainActor in
                guard self.isConnected, let serverConfig = ConfigurationManager.shared.serverConfiguration else { return }
                let urlString = "\(serverConfig.baseURL)/api/v2/beacon/check-in"
                guard let url = URL(string: urlString) else { return }
                var req = URLRequest(url: url)
                req.httpMethod = "POST"
                // Include kiosk identity for auth/context
                let kioskId = ConfigurationManager.shared.getKioskId()
                req.setValue(kioskId, forHTTPHeaderField: "X-Kiosk-ID")
                if let token = Bundle.main.object(forInfoDictionaryKey: "KIOSK_TOKEN") as? String, !token.isEmpty {
                    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
                }
                URLSession.shared.dataTask(with: req).resume()
            }
        }
    }
    
    private func addConnectionEvent(_ event: ConnectionEvent) {
        connectionHistory.append(event)
        
        // Keep only last 50 events
        if connectionHistory.count > 50 {
            connectionHistory.removeFirst()
        }
    }
    
    deinit {
        monitor.cancel()
        // pingTimer cleanup will be handled by async task in stopMonitoring()
    }
}

// MARK: - Supporting Types
enum ConnectionQuality: String, CaseIterable {
    case excellent = "Excellent"
    case good = "Good"
    case fair = "Fair"
    case poor = "Poor"
    case none = "No Connection"
    case unknown = "Unknown"
    
    var color: Color {
        switch self {
        case .excellent: return .green
        case .good: return .blue
        case .fair: return .yellow
        case .poor: return .orange
        case .none: return .red
        case .unknown: return .gray
        }
    }
    
    var systemImage: String {
        switch self {
        case .excellent: return "wifi"
        case .good: return "wifi"
        case .fair: return "wifi"
        case .poor: return "wifi"
        case .none: return "wifi.slash"
        case .unknown: return "wifi.exclamationmark"
        }
    }
}

struct ConnectionEvent: Identifiable {
    let id = UUID()
    let timestamp: Date
    let type: ConnectionEventType
    let details: String
}

enum ConnectionEventType {
    case connected
    case disconnected
    case reconnecting
    case error
    
    var color: Color {
        switch self {
        case .connected: return .green
        case .disconnected: return .red
        case .reconnecting: return .yellow
        case .error: return .orange
        }
    }
    
    var systemImage: String {
        switch self {
        case .connected: return "checkmark.circle.fill"
        case .disconnected: return "xmark.circle.fill"
        case .reconnecting: return "arrow.clockwise.circle.fill"
        case .error: return "exclamationmark.triangle.fill"
        }
    }
}
