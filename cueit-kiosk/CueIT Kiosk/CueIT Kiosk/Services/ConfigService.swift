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

    func load() {
        if let data = UserDefaults.standard.data(forKey: "config"),
           let cfg = try? JSONDecoder().decode(AppConfig.self, from: data) {
            self.config = cfg
        }
        guard let url = URL(string: "\(APIConfig.baseURL)/api/config") else { return }
        URLSession.shared.dataTask(with: url) { data, _, _ in
            if let data = data, let cfg = try? JSONDecoder().decode(AppConfig.self, from: data) {
                DispatchQueue.main.async {
                    self.config = cfg
                    if let d = try? JSONEncoder().encode(cfg) {
                        UserDefaults.standard.set(d, forKey: "config")
                    }
                }
            }
        }.resume()

        // kiosk specific overrides
        if let kioskId = UserDefaults.standard.string(forKey: "kioskId"),
           let kurl = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(kioskId)") {
            struct KioskConfig: Codable { var logoUrl: String?; var bgUrl: String? }
            URLSession.shared.dataTask(with: kurl) { data, _, _ in
                if let data = data, let row = try? JSONDecoder().decode(KioskConfig.self, from: data) {
                    DispatchQueue.main.async {
                        if let bg = row.bgUrl { self.config.backgroundUrl = bg }
                        if let l = row.logoUrl { self.config.logoUrl = l }
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
