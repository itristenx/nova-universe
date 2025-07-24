//
//  KioskModels.swift
//  CueIT Kiosk
//
//  Core data models for the kiosk application
//

import Foundation
import SwiftUI

// MARK: - Kiosk Status
enum KioskStatus: String, CaseIterable, Codable {
    case available = "available"
    case inUse = "inUse"
    case meeting = "meeting"
    case brb = "brb"
    case lunch = "lunch"
    case unavailable = "unavailable"
    
    var displayName: String {
        switch self {
        case .available: return "Available"
        case .inUse: return "In Use"
        case .meeting: return "In a Meeting"
        case .brb: return "Be Right Back"
        case .lunch: return "At Lunch"
        case .unavailable: return "Status Unavailable"
        }
    }
    
    var color: Color {
        switch self {
        case .available: return .green
        case .inUse: return .red
        case .meeting: return .purple
        case .brb: return .yellow
        case .lunch: return .blue
        case .unavailable: return .orange
        }
    }
    
    var description: String {
        switch self {
        case .available: return "Ready to help"
        case .inUse: return "Room occupied"
        case .meeting: return "In a meeting"
        case .brb: return "Will be back shortly"
        case .lunch: return "Out for lunch"
        case .unavailable: return "Status unknown"
        }
    }
}

// MARK: - Status Configuration
struct StatusConfiguration: Codable {
    let availableMessage: String
    let inUseMessage: String
    let meetingMessage: String
    let brbMessage: String
    let lunchMessage: String
    let unavailableMessage: String
    
    init(
        availableMessage: String = "Ready to help",
        inUseMessage: String = "Room occupied",
        meetingMessage: String = "In a meeting",
        brbMessage: String = "Will be back shortly",
        lunchMessage: String = "Out for lunch",
        unavailableMessage: String = "Status unknown"
    ) {
        self.availableMessage = availableMessage
        self.inUseMessage = inUseMessage
        self.meetingMessage = meetingMessage
        self.brbMessage = brbMessage
        self.lunchMessage = lunchMessage
        self.unavailableMessage = unavailableMessage
    }
    
    func message(for status: KioskStatus) -> String {
        switch status {
        case .available: return availableMessage
        case .inUse: return inUseMessage
        case .meeting: return meetingMessage
        case .brb: return brbMessage
        case .lunch: return lunchMessage
        case .unavailable: return unavailableMessage
        }
    }
}

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

// MARK: - Ticket Submission
struct TicketSubmission: Codable {
    let kioskId: String
    let category: String
    let subcategory: String?
    let description: String
    let priority: String
    let userInfo: UserInfo?
    let timestamp: Date
    
    struct UserInfo: Codable {
        let name: String?
        let email: String?
        let department: String?
    }
    
    init(kioskId: String, category: String, subcategory: String? = nil, description: String, priority: String = "medium", userInfo: UserInfo? = nil) {
        self.kioskId = kioskId
        self.category = category
        self.subcategory = subcategory
        self.description = description
        self.priority = priority
        self.userInfo = userInfo
        self.timestamp = Date()
    }
}
