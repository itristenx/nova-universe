import Foundation
import Network

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

  private init() {
    let fm = FileManager.default
    let dir = fm.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
    try? fm.createDirectory(at: dir, withIntermediateDirectories: true)
    fileURL = dir.appendingPathComponent("queued-tickets.json")
    load()
    monitor.pathUpdateHandler = { path in
      if path.status == .satisfied {
        self.retry()
      }
    }
    monitor.start(queue: DispatchQueue.global(qos: .background))
  }

  private func load() {
    if let data = try? Data(contentsOf: fileURL),
       let decoded = try? JSONDecoder().decode([QueuedTicket].self, from: data) {
      tickets = decoded
    }
  }

  private func save() {
    if let data = try? JSONEncoder().encode(tickets) {
      try? data.write(to: fileURL)
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
    guard let url = URL(string: "\(APIConfig.baseURL)/submit-ticket") else {
      completion(false)
      return
    }
    var req = URLRequest(url: url)
    req.httpMethod = "POST"
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    let body: [String: String] = [
      "name": ticket.name,
      "email": ticket.email,
      "title": ticket.title,
      "manager": ticket.manager,
      "system": ticket.system,
      "urgency": ticket.urgency
    ]
    req.httpBody = try? JSONSerialization.data(withJSONObject: body)
    URLSession.shared.dataTask(with: req) { _, _, err in
      completion(err == nil)
    }.resume()
  }
}
