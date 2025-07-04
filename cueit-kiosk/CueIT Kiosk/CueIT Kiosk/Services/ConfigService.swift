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
        if let data = UserDefaults.standard.data(forKey: "config") {
            do {
                var cfg = try JSONDecoder().decode(AppConfig.self, from: data)
                cfg.scimToken = nil
                self.config = cfg
            } catch {
                self.errorMessage = "Unable to load configuration"
            }
        }

        guard let url = URL(string: "\(APIConfig.baseURL)/api/config") else {
            self.errorMessage = "Unable to load configuration"
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
            self.errorMessage = "Unable to load configuration"
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
            completion(false)
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
}
