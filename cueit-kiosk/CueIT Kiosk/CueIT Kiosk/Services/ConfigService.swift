import Foundation
import SwiftUI

struct AppConfig: Codable {
    var logoUrl: String
    var backgroundUrl: String?
    var welcomeMessage: String
    var helpMessage: String
    var scimToken: String?
}

class ConfigService: ObservableObject {
    @Published var config: AppConfig = AppConfig(logoUrl: "/logo.png", backgroundUrl: nil, welcomeMessage: "Welcome", helpMessage: "Need help?")
    @Published var errorMessage: String?

    @MainActor
    func load() async {
        // Load cached config first
        if let data = UserDefaults.standard.data(forKey: "config") {
            do {
                var cfg = try JSONDecoder().decode(AppConfig.self, from: data)
                cfg.scimToken = nil
                self.config = cfg
                self.errorMessage = nil // Clear any previous errors since we have cached config
            } catch {
                print("Failed to load cached config: \(error)")
            }
        }

        // Try to fetch fresh config from server
        guard let url = URL(string: "\(APIConfig.baseURL)/api/config") else {
            // Only show error if we don't have cached config
            if UserDefaults.standard.data(forKey: "config") == nil {
                self.errorMessage = "Unable to load configuration"
            }
            return
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            var cfg = try JSONDecoder().decode(AppConfig.self, from: data)
            if let token = cfg.scimToken { DirectoryService.shared.updateToken(token) }
            cfg.scimToken = nil
            self.config = cfg
            self.errorMessage = nil
            if let d = try? JSONEncoder().encode(cfg) {
                UserDefaults.standard.set(d, forKey: "config")
            }
        } catch {
            // Only show error if we don't have cached config and kiosk is active
            if UserDefaults.standard.data(forKey: "config") == nil && KioskService.shared.state == .active {
                self.errorMessage = "Unable to load configuration"
            }
        }

        // kiosk specific overrides
        if let kioskId = UserDefaults.standard.string(forKey: "kioskId"),
           let kurl = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(kioskId)") {
            struct KioskConfig: Codable { var logoUrl: String?; var bgUrl: String? }
            do {
                let (data, _) = try await URLSession.shared.data(from: kurl)
                if let row = try? JSONDecoder().decode(KioskConfig.self, from: data) {
                    if let bg = row.bgUrl { self.config.backgroundUrl = bg }
                    if let l = row.logoUrl { self.config.logoUrl = l }
                    self.errorMessage = nil
                } else {
                    self.errorMessage = "Unable to load configuration"
                }
            } catch {
                self.errorMessage = "Unable to load configuration"
            }
        }
    }

    struct VerifyResponse: Decodable { let valid: Bool }

    func verifyPassword(_ password: String, completion: @escaping (Bool, Error?) -> Void) {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/verify-password") else {
            completion(false, nil)
            return
        }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["password": password]
        req.httpBody = try? JSONEncoder().encode(body)
        URLSession.shared.dataTask(with: req) { data, _, error in
            if let error = error {
                DispatchQueue.main.async { completion(false, error) }
                return
            }
            guard let data = data,
                  let resp = try? JSONDecoder().decode(VerifyResponse.self, from: data) else {
                DispatchQueue.main.async { completion(false, URLError(.badServerResponse)) }
                return
            }
            DispatchQueue.main.async { completion(resp.valid, nil) }
        }.resume()
    }
    
    func verifyPin(_ pin: String, completion: @escaping (Bool, Error?) -> Void) {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/verify-admin-pin") else {
            completion(false, URLError(.badURL))
            return
        }
        
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 10.0 // 10 second timeout
        
        let body = ["pin": pin]
        do {
            req.httpBody = try JSONEncoder().encode(body)
        } catch {
            completion(false, error)
            return
        }
        
        URLSession.shared.dataTask(with: req) { data, response, error in
            if let error = error {
                DispatchQueue.main.async { completion(false, error) }
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                DispatchQueue.main.async { completion(false, URLError(.badServerResponse)) }
                return
            }
            
            // Check for HTTP error status codes
            guard httpResponse.statusCode == 200 else {
                let error: Error
                switch httpResponse.statusCode {
                case 401, 403:
                    error = URLError(.userAuthenticationRequired)
                case 404:
                    error = URLError(.fileDoesNotExist)
                case 500...599:
                    error = URLError(.badServerResponse)
                default:
                    error = URLError(.unknown)
                }
                DispatchQueue.main.async { completion(false, error) }
                return
            }
            
            guard let data = data,
                  let resp = try? JSONDecoder().decode(VerifyResponse.self, from: data) else {
                DispatchQueue.main.async { completion(false, URLError(.cannotParseResponse)) }
                return
            }
            
            DispatchQueue.main.async { completion(resp.valid, nil) }
        }.resume()
    }
}
