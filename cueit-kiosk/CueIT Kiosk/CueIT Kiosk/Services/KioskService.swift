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
    @Published var activationError: Bool = false
    private var timer: Timer?

    let id: String = {
        if let saved = KeychainService.string(for: "kioskId") {
            return saved
        }
        if let migrated = UserDefaults.standard.string(forKey: "kioskId") {
            KeychainService.set(migrated, for: "kioskId")
            UserDefaults.standard.removeObject(forKey: "kioskId")
            return migrated
        }
        let new = UUID().uuidString
        KeychainService.set(new, for: "kioskId")
        return new
    }()

    func register(version: String) async {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/register-kiosk") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["id": id, "version": version]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        _ = try? await URLSession.shared.data(for: req)
    }

    @MainActor
    func checkActive() async {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(id)") else { return }
        struct KioskRow: Codable { var active: Int }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let row = try? JSONDecoder().decode(KioskRow.self, from: data) {
                self.state = row.active == 1 ? .active : .inactive
                self.activationError = false
            } else {
                self.state = .error
                self.activationError = true
            }
        } catch {
            self.state = .error
            self.activationError = true
        }
    }

    private func startPolling() {
        Task { await checkActive() }
        timer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { _ in
            Task { await self.checkActive() }
        }
    }
}
