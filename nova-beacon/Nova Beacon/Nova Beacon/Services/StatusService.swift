import Foundation
import Combine

struct StatusUpdate: Codable {
    let status: String
    let message: String
}

class StatusService: ObservableObject {
    static let shared = StatusService()
    @Published var latest: StatusUpdate?

    private var task: Task<Void, Never>?

    private init() {
        loadCached()
        connect()
    }

    private func loadCached() {
        if let data = UserDefaults.standard.data(forKey: "lastStatus"),
           let update = try? JSONDecoder().decode(StatusUpdate.self, from: data) {
            latest = update
        }
    }

    private func cacheCurrent() {
        if let update = latest,
           let data = try? JSONEncoder().encode(update) {
            UserDefaults.standard.set(data, forKey: "lastStatus")
        }
    }

    private func connect() {
        task?.cancel()
        guard let url = URL(string: "\(APIConfig.baseURL)/api/events") else { return }
        task = Task {
            do {
                let (bytes, _) = try await URLSession.shared.bytes(from: url)
                for try await line in bytes.lines {
                    if line.hasPrefix("data: ") {
                        let json = line.dropFirst(6)
                        if let data = json.data(using: .utf8),
                           let update = try? JSONDecoder().decode(StatusUpdate.self, from: data) {
                            await MainActor.run {
                                self.latest = update
                                self.cacheCurrent()
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
