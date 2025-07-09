//
//  KioskModels.swift
//  CueIT Kiosk
//
//  Core data models for the kiosk application
//

import Foundation

// MARK: - Kiosk Info Model
struct KioskInfo: Codable {
    let id: String
    let name: String
    let location: String?
    let lastUpdated: Date
    let version: String
    
    init(id: String = UUID().uuidString, name: String = "Conference Room Kiosk", location: String? = nil) {
        self.id = id
        self.name = name
        self.location = location
        self.lastUpdated = Date()
        self.version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }
}

// MARK: - Kiosk State
enum KioskState: Equatable {
    case initializing
    case setup
    case activated
    case deactivated
    case error(String)
    case maintenance
    
    static func == (lhs: KioskState, rhs: KioskState) -> Bool {
        switch (lhs, rhs) {
        case (.initializing, .initializing),
             (.setup, .setup),
             (.activated, .activated),
             (.deactivated, .deactivated),
             (.maintenance, .maintenance):
            return true
        case (.error(let lhsMessage), .error(let rhsMessage)):
            return lhsMessage == rhsMessage
        default:
            return false
        }
    }
}

// MARK: - Kiosk View
enum KioskView {
    case loading
    case setup
    case home
    case ticket
    case feedback
    case error
}
