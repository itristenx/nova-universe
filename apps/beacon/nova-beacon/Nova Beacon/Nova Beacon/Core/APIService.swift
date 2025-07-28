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
        guard let url = URL(string: "\(serverURL)/api/v1/health") else { return false }
        
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
    
    func checkKioskStatus(id: String, serverURL: String) async -> [String: Any]? {
        guard let url = URL(string: "\(serverURL)/api/kiosks/\(id)") else { return nil }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                
                return try JSONSerialization.jsonObject(with: data) as? [String: Any]
            }
        } catch {
            print("Kiosk status check failed: \(error)")
        }
        
        return nil
    }
    
    // MARK: - Status Configuration (TODO: Implement when types are resolved)
    /*
    func getStatusConfiguration(kioskId: String, serverURL: String) async -> StatusConfiguration? {
        guard let url = URL(string: "\(serverURL)/api/status-config?kioskId=\(kioskId)") else { return nil }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    return parseStatusConfiguration(from: json)
                }
            }
        } catch {
            print("Status configuration fetch failed: \(error)")
        }
        
        return nil
    }
    
    func updateKioskStatus(kioskId: String, status: KioskStatus, serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/kiosks/\(kioskId)/status") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        let payload = [
            "status": status.rawValue,
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload)
            let (_, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse {
                return httpResponse.statusCode == 200
            }
        } catch {
            print("Status update failed: \(error)")
        }
        
        return false
    }
    */
    
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
    func getKioskConfiguration(id: String, serverURL: String) async -> [String: Any]? {
        guard let url = URL(string: "\(serverURL)/api/kiosks/\(id)/remote-config") else { return nil }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                
                // Return raw JSON for now
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    return json["config"] as? [String: Any]
                }
            }
        } catch {
            print("Configuration fetch failed: \(error)")
        }
        
        return nil
    }
    
    // MARK: - Ticket Submission
    func submitTicket(kioskId: String, category: String, description: String, serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/submit-ticket") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let payload = [
            "kioskId": kioskId,
            "category": category,
            "description": description,
            "priority": "medium",
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload)
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
    
    /*
    private func parseStatusConfiguration(from data: [String: Any]) -> StatusConfiguration {
        return StatusConfiguration(
            availableMessage: data["availableMessage"] as? String ?? "Ready to help",
            inUseMessage: data["inUseMessage"] as? String ?? "Room occupied",
            meetingMessage: data["meetingMessage"] as? String ?? "In a meeting",
            brbMessage: data["brbMessage"] as? String ?? "Will be back shortly",
            lunchMessage: data["lunchMessage"] as? String ?? "Out for lunch",
            unavailableMessage: data["unavailableMessage"] as? String ?? "Status unknown"
        )
    }
    */
}