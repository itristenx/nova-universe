import Foundation
import Network
import CryptoKit

struct QueuedTicket: Codable, Identifiable {
  let id: UUID
  let name: String
  let email: String
  let title: String
  let manager: String
  let system: String
  let urgency: String

  init(name: String, email: String, title: String, manager: String, system: String, urgency: String) {
    self.id = UUID()
    self.name = name
    self.email = email
    self.title = title
    self.manager = manager
    self.system = system
    self.urgency = urgency
  }
}

class TicketQueue: ObservableObject {
  static let shared = TicketQueue()
  @Published private(set) var tickets: [QueuedTicket] = []

  private let fileURL: URL
  private let monitor = NWPathMonitor()
  private let key: SymmetricKey

  private init() {
    let fm = FileManager.default
    let dir = fm.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
    try? fm.createDirectory(at: dir, withIntermediateDirectories: true)
    fileURL = dir.appendingPathComponent("queued-tickets.json")
    if let saved = KeychainService.string(for: "ticketEncryptionKey"),
       let data = Data(base64Encoded: saved) {
      key = SymmetricKey(data: data)
    } else {
      let newKey = SymmetricKey(size: .bits256)
      key = newKey
      let keyData = newKey.withUnsafeBytes { Data($0) }
      KeychainService.set(keyData.base64EncodedString(), for: "ticketEncryptionKey")
    }
    load()
    monitor.pathUpdateHandler = { path in
      if path.status == .satisfied {
        self.retry()
      }
    }
    monitor.start(queue: DispatchQueue.global(qos: .background))
  }

  private func encrypt(_ data: Data) -> Data? {
    try? AES.GCM.seal(data, using: key).combined
  }

  private func decrypt(_ data: Data) -> Data? {
    guard let box = try? AES.GCM.SealedBox(combined: data) else { return nil }
    return try? AES.GCM.open(box, using: key)
  }

  private func load() {
    guard let stored = try? Data(contentsOf: fileURL) else { return }
    let jsonData = decrypt(stored) ?? stored
    if let decoded = try? JSONDecoder().decode([QueuedTicket].self, from: jsonData) {
      tickets = decoded
    }
  }

  private func save() {
    if let data = try? JSONEncoder().encode(tickets),
       let encrypted = encrypt(data) {
      try? encrypted.write(to: fileURL, options: .completeFileProtection)
    }
  }

  func enqueue(_ ticket: QueuedTicket) {
    tickets.append(ticket)
    save()
  }

  private func remove(_ ticket: QueuedTicket) {
    tickets.removeAll { $0.id == ticket.id }
    save()
  }

  func retry() {
    guard !tickets.isEmpty else { return }
    for ticket in tickets {
      send(ticket) { success in
        if success {
          DispatchQueue.main.async {
            self.remove(ticket)
          }
        }
      }
    }
  }

  private func send(_ ticket: QueuedTicket, completion: @escaping (Bool) -> Void) {
    guard let url = URL(string: "\(APIConfig.baseURL)/api/v2/beacon/ticket") else {
      completion(false)
      return
    }
    var req = URLRequest(url: url)
    req.httpMethod = "POST"
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    let body: [String: Any] = [
      "kioskId": KeychainService.string(for: "kioskId") ?? "unknown",
      "submitted_by": "anon_beacon",
      "details": [
        "name": ticket.name,
        "email": ticket.email,
        "title": ticket.title,
        "manager": ticket.manager,
        "system": ticket.system,
        "urgency": ticket.urgency
      ],
      "offline": true,
      "timestamp": ISO8601DateFormatter().string(from: Date())
    ]
    req.httpBody = try? JSONSerialization.data(withJSONObject: body)
    URLSession.shared.dataTask(with: req) { _, _, err in
      completion(err == nil)
    }.resume()
  }
}
