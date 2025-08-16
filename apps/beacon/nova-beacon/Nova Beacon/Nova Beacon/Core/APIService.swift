//
//  APIService.swift
//  Nova Beacon
//
//  Handles all API communication with the Nova Universe backend
//

import Foundation
import UIKit // Added for UIDevice

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
        guard let url = URL(string: "\(serverURL)/api/v2/status") else { return false }
        
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
    
    // MARK: - Kiosk Registration & Status (API v2)
    func registerKiosk(id: String, version: String, serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/v2/beacon/register") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let payload: [String: Any] = [
            "id": id,
            "version": version,
            "token": getKioskToken(),
            "deviceInfo": [
                "deviceId": UIDevice.current.identifierForVendor?.uuidString ?? "unknown",
                "deviceName": UIDevice.current.name,
                "osVersion": UIDevice.current.systemVersion,
                "model": UIDevice.current.model
            ]
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
        guard let url = URL(string: "\(serverURL)/api/v2/beacon/kiosks/\(id)") else { return nil }
        
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
    
    // MARK: - Kiosk Activation
    func activateKiosk(id: String, activationCode: String, serverURL: String) async -> Bool {
        guard let url = URL(string: "\(serverURL)/api/v2/beacon/activate") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let payload: [String: Any] = [
            "kioskId": id,
            "activationCode": activationCode,
            "deviceInfo": [
                "deviceId": UIDevice.current.identifierForVendor?.uuidString ?? "unknown",
                "deviceName": UIDevice.current.name,
                "osVersion": UIDevice.current.systemVersion,
                "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "",
                "model": UIDevice.current.model
            ]
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
    
    // MARK: - Kiosk Configuration
    func getKioskConfiguration(id: String, serverURL: String) async -> [String: Any]? {
        guard let url = URL(string: "\(serverURL)/api/v2/beacon/config?kiosk_id=\(id)") else { return nil }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let config = json["config"] as? [String: Any] {
                    return config
                }
            }
        } catch {
            print("Configuration fetch failed: \(error)")
        }
        
        return nil
    }

    // MARK: - Status Configuration
    func getStatusConfiguration(kioskId: String, serverURL: String) async -> StatusConfiguration? {
        guard let url = URL(string: "\(serverURL)/api/v2/beacon/config?kiosk_id=\(kioskId)") else { return nil }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getKioskToken())", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, response) = try await session.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               httpResponse.statusCode == 200 {
                
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let config = json["config"] as? [String: Any] {
                    return parseStatusConfiguration(from: config)
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
    
    // Duplicate activation removed; use the API v2 function above
    
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
        guard let url = URL(string: "\(serverURL)/api/v2/beacon/ticket") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let payload = [
            "kioskId": kioskId,
            "category": category,
            "description": description,
            "priority": "medium",
            "timestamp": ISO8601DateFormatter().string(from: Date()),
            "offline": false
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
    
    // MARK: - Core Config for Remote Skinning
    func getCoreConfig(kioskId: String, serverURL: String) async -> [String: Any]? {
        guard let url = URL(string: "\(serverURL)/core/config?kiosk_id=\(kioskId)") else { return nil }
        do {
            let (data, response) = try await session.data(from: url)
            if let http = response as? HTTPURLResponse, http.statusCode == 200 {
                return try JSONSerialization.jsonObject(with: data) as? [String: Any]
            }
        } catch {
            print("Core config fetch failed: \(error)")
        }
        return nil
    }
    
    // MARK: - Helper Methods
    private func getKioskToken() -> String {
        return Bundle.main.object(forInfoDictionaryKey: "KIOSK_TOKEN") as? String ?? ""
    }
    
    private func parseStatusConfiguration(from data: [String: Any]) -> StatusConfiguration {
        let statusMessages = data["statusMessages"] as? [String: Any] ?? [:]
        
        return StatusConfiguration(
            availableMessage: statusMessages["available"] as? String ?? "Ready to help",
            inUseMessage: statusMessages["inUse"] as? String ?? "Room occupied",
            meetingMessage: statusMessages["meeting"] as? String ?? "In a meeting",
            brbMessage: statusMessages["brb"] as? String ?? "Will be back shortly",
            lunchMessage: statusMessages["lunch"] as? String ?? "Out for lunch",
            unavailableMessage: statusMessages["unavailable"] as? String ?? "Status unknown"
        )
    }
}