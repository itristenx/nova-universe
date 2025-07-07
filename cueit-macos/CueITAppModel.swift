import SwiftUI
import Foundation
import Combine

enum NavigationItem: String, CaseIterable {
    case dashboard = "Dashboard"
    case tickets = "Tickets"
    case kiosks = "Kiosks"
    case kioskManagement = "Kiosk Management"
    case users = "Users"
    case analytics = "Analytics"
    case notifications = "Notifications"
    case integrations = "Integrations"
    case settings = "Settings"
    case services = "Services"
    
    var icon: String {
        switch self {
        case .dashboard: return "house"
        case .tickets: return "doc.text"
        case .kiosks: return "desktopcomputer"
        case .kioskManagement: return "qrcode.viewfinder"
        case .users: return "person.2"
        case .analytics: return "chart.bar"
        case .notifications: return "bell"
        case .integrations: return "gear.2"
        case .settings: return "gearshape"
        case .services: return "server.rack"
        }
    }
}

struct ServiceStatus {
    let name: String
    let port: Int
    let isRunning: Bool
    let url: String
}

class CueITAppModel: ObservableObject {
    @Published var selectedNavigation: NavigationItem = .dashboard
    @Published var isLoggedIn: Bool = false
    @Published var currentUser: String = ""
    @Published var services: [ServiceStatus] = []
    @Published var logs: String = ""
    @Published var showSetup: Bool = false
    
    // Service management
    @Published var startAPI = true
    @Published var startAdmin = true
    @Published var startSlack = false
    
    private var cancellables = Set<AnyCancellable>()
    private var processes: [String: Process] = [:]
    
    init() {
        checkInitialSetup()
        loadServices()
        startStatusTimer()
    }
    
    private func checkInitialSetup() {
        showSetup = ensureEnvFiles()
    }
    
    private func ensureEnvFiles() -> Bool {
        let fm = FileManager.default
        let currentDir = FileManager.default.currentDirectoryPath
        let packages = ["cueit-api", "cueit-admin", "cueit-slack"]
        
        var needsSetup = false
        for package in packages {
            let envPath = "\(currentDir)/\(package)/.env"
            let examplePath = "\(currentDir)/\(package)/.env.example"
            
            if !fm.fileExists(atPath: envPath) && fm.fileExists(atPath: examplePath) {
                try? fm.copyItem(atPath: examplePath, toPath: envPath)
                needsSetup = true
            }
        }
        return needsSetup
    }
    
    private func loadServices() {
        services = [
            ServiceStatus(name: "CueIT API", port: 3000, isRunning: false, url: "http://localhost:3000"),
            ServiceStatus(name: "CueIT Admin", port: 5175, isRunning: false, url: "http://localhost:5175"),
            ServiceStatus(name: "CueIT Slack", port: 3001, isRunning: false, url: "http://localhost:3001")
        ]
    }
    
    private func startStatusTimer() {
        Timer.publish(every: 5.0, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.checkServiceStatus()
            }
            .store(in: &cancellables)
    }
    
    private func checkServiceStatus() {
        for (index, service) in services.enumerated() {
            checkPortStatus(port: service.port) { [weak self] isRunning in
                DispatchQueue.main.async {
                    self?.services[index] = ServiceStatus(
                        name: service.name,
                        port: service.port,
                        isRunning: isRunning,
                        url: service.url
                    )
                }
            }
        }
    }
    
    private func checkPortStatus(port: Int, completion: @escaping (Bool) -> Void) {
        let task = Process()
        task.launchPath = "/usr/bin/lsof"
        task.arguments = ["-i", ":\(port)", "-t"]
        
        let pipe = Pipe()
        task.standardOutput = pipe
        task.standardError = pipe
        
        task.terminationHandler = { _ in
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let output = String(data: data, encoding: .utf8) ?? ""
            completion(!output.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
        
        try? task.run()
    }
    
    func startServices() {
        let selectedServices = [
            startAPI ? "api" : nil,
            startAdmin ? "admin" : nil,
            startSlack ? "slack" : nil
        ].compactMap { $0 }
        
        for service in selectedServices {
            startService(service)
        }
    }
    
    private func startService(_ service: String) {
        let serviceMap = [
            "api": ("cueit-api", "npm start"),
            "admin": ("cueit-admin", "npm run dev"),
            "slack": ("cueit-slack", "npm start")
        ]
        
        guard let (directory, command) = serviceMap[service] else { return }
        
        let task = Process()
        task.launchPath = "/bin/bash"
        task.arguments = ["-c", "cd \(directory) && \(command)"]
        
        let pipe = Pipe()
        task.standardOutput = pipe
        task.standardError = pipe
        
        pipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            if let output = String(data: data, encoding: .utf8) {
                DispatchQueue.main.async {
                    self?.logs += "[\(service.uppercased())] \(output)"
                }
            }
        }
        
        do {
            try task.run()
            processes[service] = task
            DispatchQueue.main.async {
                self.logs += "Started \(service) service\n"
            }
        } catch {
            DispatchQueue.main.async {
                self.logs += "Failed to start \(service): \(error)\n"
            }
        }
    }
    
    func stopServices() {
        for (service, process) in processes {
            process.terminate()
            DispatchQueue.main.async {
                self.logs += "Stopped \(service) service\n"
            }
        }
        processes.removeAll()
    }
    
    func openAdminUI() {
        if let url = URL(string: "http://localhost:5175") {
            NSWorkspace.shared.open(url)
        }
    }
    
    func openAPIDocumentation() {
        if let url = URL(string: "http://localhost:3000/api") {
            NSWorkspace.shared.open(url)
        }
    }
    
    func clearLogs() {
        logs = ""
    }
    
    func completeSetup() {
        showSetup = false
    }
}
