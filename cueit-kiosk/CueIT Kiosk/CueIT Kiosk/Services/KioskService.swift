import Foundation

class KioskService {
    static let shared = KioskService()
    private init() {}

    let id: String = {
        if let saved = UserDefaults.standard.string(forKey: "kioskId") {
            return saved
        }
        let new = UUID().uuidString
        UserDefaults.standard.set(new, forKey: "kioskId")
        return new
    }()

    func register(version: String) {
        guard let url = URL(string: "http://localhost:3000/api/register-kiosk") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["id": id, "version": version]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        URLSession.shared.dataTask(with: req).resume()
    }
}
