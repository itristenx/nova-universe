import Foundation
import Combine

enum ActivationState {
    case checking
    case active
    case inactive
    case error
}

class KioskService: ObservableObject {
    static let shared = KioskService()
    private init() {
        startPolling()
    }

    @Published var state: ActivationState = .checking
    private var timer: Timer?

    let id: String = {
        if let saved = UserDefaults.standard.string(forKey: "kioskId") {
            return saved
        }
        let new = UUID().uuidString
        UserDefaults.standard.set(new, forKey: "kioskId")
        return new
    }()

    func register(version: String) {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/register-kiosk") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["id": id, "version": version]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        URLSession.shared.dataTask(with: req).resume()
    }

    func checkActive() {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(id)") else { return }
        struct KioskRow: Codable { var active: Int }
        URLSession.shared.dataTask(with: url) { data, _, _ in
            DispatchQueue.main.async {
                if let data = data,
                   let row = try? JSONDecoder().decode(KioskRow.self, from: data) {
                    self.state = row.active == 1 ? .active : .inactive
                } else {
                    self.state = .error
                }
            }
        }.resume()
    }

    private func startPolling() {
        checkActive()
        timer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { _ in
            self.checkActive()
        }
    }
}
