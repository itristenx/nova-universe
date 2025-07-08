//
//  APIService.swift
//  CueIT Kiosk
//
//  Handles all API communication with the CueIT backend
//

import Foundation

class APIService {
    static let shared = APIService()
    
    private let session: URLSession
    private let timeout: TimeInterval = 30
    
    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = timeout
        config.timeoutIntervalForResource = timeout * 2
        config.waitsForConnectivity = true
        
        self.session = URLSession(configuration: config)
    }
    
    // MARK: - Connection Testing
    func testConnection(serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/health") else { return false }
        
        do {
            let (data, response) = try await session.data(from: url)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                
                // Try to parse health response
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   json["status"] as? String == "ok" {
                    return true
                }
            }
        } catch {
            print("Connection test failed: \(error)")
        }
        
        return false
    }
    
    // MARK: - Kiosk Registration & Status
    func registerKiosk(id: String, version: String, serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/register-kiosk") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let payload = [
            "id": id,
            "version": version,
            "token": getKioskToken()
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload)
            let (_, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse {
                return httpResponse.statusCode == 200
            }
        } catch {
            print("Kiosk registration failed: \(error)")
        }
        
        return false
    }
    
    func checkKioskStatus(id: String, serverURL: String) async -> KioskStatus? {
        guard let url = URL(string: "\(serverURL)/api/kiosks/\(id)") else { return nil }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                
                let decoder = JSONDecoder()
                let status = try decoder.decode(KioskStatus.self, from: data)
                return status
            }
        } catch {
            print("Kiosk status check failed: \(error)")
        }
        
        return nil
    }
    
    // MARK: - Activation
    func activateKiosk(id: String, activationCode: String, serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/kiosks/activate") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let payload = [
            "kioskId": id,
            "activationCode": activationCode.uppercased()
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload)
            let (_, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse {
                return httpResponse.statusCode == 200
            }
        } catch {
            print("Kiosk activation failed: \(error)")
        }
        
        return false
    }
    
    // MARK: - Configuration
    func getKioskConfiguration(id: String, serverURL: String) async -> KioskConfiguration? {
        guard let url = URL(string: "\(serverURL)/api/kiosks/\(id)/remote-config") else { return nil }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                
                // Parse the remote config response
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let configData = json["config"] as? [String: Any] {
                    
                    return parseKioskConfiguration(from: configData)
                }
            }
        } catch {
            print("Configuration fetch failed: \(error)")
        }
        
        return nil
    }
    
    // MARK: - Ticket Submission
    func submitTicket(_ ticket: TicketSubmission, serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/submit-ticket") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            request.httpBody = try encoder.encode(ticket)
            
            let (_, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse {
                return httpResponse.statusCode == 200
            }
        } catch {
            print("Ticket submission failed: \(error)")
        }
        
        return false
    }
    
    // MARK: - Helper Methods
    private func getKioskToken() -> String {
        return Bundle.main.object(forInfoDictionaryKey: "KIOSK_TOKEN") as? String ?? ""
    }
    
    private func parseKioskConfiguration(from data: [String: Any]) -> KioskConfiguration {
        // Create default configuration and override with server values
        let theme = KioskConfiguration.KioskTheme(
            primaryColor: data["primaryColor"] as? String ?? "#007AFF",
            secondaryColor: data["secondaryColor"] as? String ?? "#5856D6",
            accentColor: data["accentColor"] as? String ?? "#FF9500",
            backgroundStyle: data["backgroundStyle"] as? String ?? "gradient"
        )
        
        let features = KioskConfiguration.KioskFeatures(
            showClock: data["showClock"] as? Bool ?? true,
            showWeather: data["showWeather"] as? Bool ?? false,
            showCalendar: data["showCalendar"] as? Bool ?? true,
            enableFeedback: data["enableFeedback"] as? Bool ?? true,
            allowGuestAccess: data["allowGuestAccess"] as? Bool ?? true
        )
        
        let messaging = KioskConfiguration.MessagingConfiguration(
            welcomeMessage: data["welcomeMessage"] as? String ?? "Welcome to Conference Support",
            helpText: data["helpMessage"] as? String ?? "How can we help you today?",
            showTicker: data["showTicker"] as? Bool ?? false,
            tickerText: data["tickerText"] as? String
        )
        
        let statusIndicator = KioskConfiguration.StatusIndicatorConfiguration(
            enabled: data["statusEnabled"] as? Bool ?? true,
            position: data["statusPosition"] as? String ?? "top",
            showConnectionStatus: data["showConnectionStatus"] as? Bool ?? true,
            showLastUpdate: data["showLastUpdate"] as? Bool ?? true
        )
        
        return KioskConfiguration(
            displayName: data["displayName"] as? String ?? "Conference Room Kiosk",
            location: data["location"] as? String,
            logoURL: data["logoUrl"] as? String,
            backgroundURL: data["bgUrl"] as? String,
            theme: theme,
            features: features,
            messaging: messaging,
            statusIndicator: statusIndicator
        )
    }
}

// MARK: - API Models
struct KioskStatus: Codable {
    let id: String
    let isActive: Bool
    let lastSeen: String?
    let version: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case isActive = "active"
        case lastSeen = "last_seen"
        case version
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        
        // Handle both integer and boolean for active field
        if let activeInt = try? container.decode(Int.self, forKey: .isActive) {
            isActive = activeInt == 1
        } else {
            isActive = try container.decode(Bool.self, forKey: .isActive)
        }
        
        lastSeen = try container.decodeIfPresent(String.self, forKey: .lastSeen)
        version = try container.decodeIfPresent(String.self, forKey: .version)
    }
}

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
