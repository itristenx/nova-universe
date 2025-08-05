//
//  ConfigurationModels.swift
//  Nova Beacon
//
//  Configuration data models for the kiosk application
//

import Foundation

// MARK: - Kiosk Configuration
struct KioskConfiguration: Codable {
    let displayName: String
    let location: String?
    let logoURL: String?
    let backgroundURL: String?
    let theme: KioskTheme
    let features: KioskFeatures
    let messaging: MessagingConfiguration
    let statusIndicator: StatusIndicatorConfiguration
    
    struct KioskTheme: Codable {
        let primaryColor: String
        let secondaryColor: String
        let accentColor: String
        let backgroundStyle: String // "solid", "gradient", "image"
    }
    
    struct KioskFeatures: Codable {
        let showClock: Bool
        let showWeather: Bool
        let showCalendar: Bool
        let enableFeedback: Bool
        let allowGuestAccess: Bool
    }
    
    struct MessagingConfiguration: Codable {
        let welcomeMessage: String
        let helpText: String
        let showTicker: Bool
        let tickerText: String?
    }
    
    struct StatusIndicatorConfiguration: Codable {
        let enabled: Bool
        let position: String // "top", "bottom", "floating"
        let showConnectionStatus: Bool
        let showLastUpdate: Bool
    }
}

// MARK: - Server Configuration
struct ServerConfiguration: Codable {
    let baseURL: String
    let name: String
    let isSecure: Bool
    let lastTested: Date
    
    init(baseURL: String, name: String = "Nova Universe Server") {
        self.baseURL = baseURL
        self.name = name
        self.isSecure = baseURL.hasPrefix("https")
        self.lastTested = Date()
    }
}
