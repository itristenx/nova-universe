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
    private let token: String
    private init() {
        token = Bundle.main.object(forInfoDictionaryKey: "KIOSK_TOKEN") as? String ?? ""
        startPolling()
    }

    @Published var state: ActivationState = .checking
    @Published var activationError: Bool = false
    private var timer: Timer?
    private static let minInterval: TimeInterval = 30
    private static let maxInterval: TimeInterval = 300
    private var pollInterval: TimeInterval = minInterval

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
        var body: [String: Any] = ["id": id, "version": version]
        if !token.isEmpty {
            body["token"] = token
        }
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        _ = try? await URLSession.shared.data(for: req)
    }

    @MainActor
    func checkActive() async {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(id)") else { return }
        struct KioskRow: Codable { var active: Int }
        var success = false
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let row = try? JSONDecoder().decode(KioskRow.self, from: data) {
                self.state = row.active == 1 ? .active : .inactive
                self.activationError = false
                success = true
            } else {
                self.state = .error
                self.activationError = true
            }
        } catch {
            self.state = .error
            self.activationError = true
        }

        if success {
            pollInterval = Self.minInterval
        } else {
            pollInterval = min(pollInterval * 2, Self.maxInterval)
        }
    }

    @MainActor
    func activate() async -> Bool {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/kiosks/\(id)/active") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "PUT"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONEncoder().encode(["active": true])
        do {
            _ = try await URLSession.shared.data(for: req)
            state = .active
            activationError = false
            return true
        } catch {
            activationError = true
            return false
        }
    }

    private func pollAndScheduleNext() async {
        await checkActive()
        scheduleNextPoll()
    }

    private func scheduleNextPoll() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: pollInterval, repeats: false) { _ in
            Task { await self.pollAndScheduleNext() }
        }
    }

    private func startPolling() {
        Task { await pollAndScheduleNext() }
    }
}
