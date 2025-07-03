import Foundation
import SwiftUI

struct AppConfig: Codable {
    var logoUrl: String
    var welcomeMessage: String
    var helpMessage: String
    var adminPassword: String
}

class ConfigService: ObservableObject {
    @Published var config: AppConfig = AppConfig(logoUrl: "/logo.png", welcomeMessage: "Welcome", helpMessage: "Need help?", adminPassword: "admin")

    func load() {
        if let data = UserDefaults.standard.data(forKey: "config"),
           let cfg = try? JSONDecoder().decode(AppConfig.self, from: data) {
            self.config = cfg
        }
        guard let url = URL(string: "http://localhost:3000/api/config") else { return }
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
    }
}
