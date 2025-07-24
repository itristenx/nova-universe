import Foundation
import Combine

struct CueNotification: Codable {
    let id: Int
    let message: String
    let level: String
    let active: Int
    let created_at: String
}

class NotificationService: ObservableObject {
    static let shared = NotificationService()
    @Published var latest: CueNotification?
    private var task: Task<Void, Never>?
    private init() {
        connect()
    }

    private func connect() {
        task?.cancel()
        guard let url = URL(string: "\(APIConfig.baseURL)/api/notifications/stream") else { return }
        task = Task {
            do {
                let (bytes, _) = try await URLSession.shared.bytes(from: url)
                for try await line in bytes.lines {
                    if line.hasPrefix("data: ") {
                        let json = line.dropFirst(6)
                        if let data = json.data(using: .utf8),
                           let arr = try? JSONDecoder().decode([CueNotification].self, from: data) {
                            await MainActor.run {
                                self.latest = arr.first
                            }
                        }
                    }
                }
            } catch {
                try? await Task.sleep(nanoseconds: 5_000_000_000)
                self.connect()
            }
        }
    }
}
