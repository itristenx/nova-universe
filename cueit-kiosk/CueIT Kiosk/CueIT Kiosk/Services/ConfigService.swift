import Foundation
import SwiftUI

struct AppConfig: Codable {
    var logoUrl: String
    var backgroundUrl: String?
    var welcomeMessage: String
    var helpMessage: String
}

class ConfigService: ObservableObject {
    @Published var config: AppConfig = AppConfig(logoUrl: "/logo.png", backgroundUrl: nil, welcomeMessage: "Welcome", helpMessage: "Need help?")
    @Published var errorMessage: String?

    func load() {
        if let data = UserDefaults.standard.data(forKey: "config") {
            do {
                let cfg = try JSONDecoder().decode(AppConfig.self, from: data)
                self.config = cfg
            } catch {
                self.errorMessage = "Unable to load configuration"
            }
        }

        guard let url = URL(string: "\(APIConfig.baseURL)/api/config") else {
            self.errorMessage = "Unable to load configuration"
            return
        }

        URLSession.shared.dataTask(with: url) { data, _, _ in
            DispatchQueue.main.async {
                guard let data = data else {
                    self.errorMessage = "Unable to load configuration"
                    return
                }
                do {
                    let cfg = try JSONDecoder().decode(AppConfig.self, from: data)
                    self.config = cfg
                    self.errorMessage = nil
                    if let d = try? JSONEncoder().encode(cfg) {
                        UserDefaults.standard.set(d, forKey: "config")
                    }
                } catch {
                    self.errorMessage = "Unable to load configuration"
                }
            }
        }.resume()

        // kiosk specific overrides
        if let kioskId = UserDefaults.standard.string(forKey: "kioskId"),
           let kurl = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(kioskId)") {
            struct KioskConfig: Codable { var logoUrl: String?; var bgUrl: String? }
            URLSession.shared.dataTask(with: kurl) { data, _, _ in
                DispatchQueue.main.async {
                    if let data = data, let row = try? JSONDecoder().decode(KioskConfig.self, from: data) {
                        if let bg = row.bgUrl { self.config.backgroundUrl = bg }
                        if let l = row.logoUrl { self.config.logoUrl = l }
                        self.errorMessage = nil
                    } else {
                        self.errorMessage = "Unable to load configuration"
                    }
                }
            }.resume()
        }
    }

    struct VerifyResponse: Decodable { let valid: Bool }

    func verifyPassword(_ password: String, completion: @escaping (Bool) -> Void) {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/verify-password") else {
            completion(false)
            return
        }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["password": password]
        req.httpBody = try? JSONEncoder().encode(body)
        URLSession.shared.dataTask(with: req) { data, _, _ in
            var ok = false
            if let data = data,
               let resp = try? JSONDecoder().decode(VerifyResponse.self, from: data) {
                ok = resp.valid
            }
            DispatchQueue.main.async { completion(ok) }
        }.resume()
    }
}
