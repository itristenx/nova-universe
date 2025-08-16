import Foundation

struct DirectoryUser: Identifiable {
    let id: String
    let displayName: String
    let userName: String
    let title: String?
    let manager: String?
}

class DirectoryService: ObservableObject {
    static let shared = DirectoryService()
    @Published var suggestions: [DirectoryUser] = []
    @Published var isSearching = false

    private let baseURL: String

    private init() {
        if let url = Bundle.main.object(forInfoDictionaryKey: "SCIM_URL") as? String {
            baseURL = url
        } else {
            baseURL = "\(APIConfig.baseURL)/api/v2/helix/scim/v2"
        }
    }

    var token: String {
        KeychainService.string(for: "scimToken") ?? ""
    }

    func updateToken(_ value: String) {
        KeychainService.set(value, for: "scimToken")
    }

    func search(email: String) {
        guard email.count >= 3 else {
            DispatchQueue.main.async { 
                self.suggestions = []
                self.isSearching = false
            }
            return
        }
        
        DispatchQueue.main.async { self.isSearching = true }
        
        let filter = "userName co \"\(email)\""
        guard let encoded = filter.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "\(baseURL)/Users?filter=\(encoded)") else { 
            DispatchQueue.main.async { self.isSearching = false }
            return 
        }
        var req = URLRequest(url: url)
        if !token.isEmpty {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        URLSession.shared.dataTask(with: req) { data, _, _ in
            var results: [DirectoryUser] = []
            if let data = data,
               let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let res = obj["Resources"] as? [[String: Any]] {
                results = res.compactMap { DirectoryService.parseUser($0) }
            }
            DispatchQueue.main.async {
                self.suggestions = results
                self.isSearching = false
            }
        }.resume()
    }

    private static func parseUser(_ dict: [String: Any]) -> DirectoryUser? {
        guard let id = dict["id"] as? String else { return nil }
        let userName = dict["userName"] as? String ?? ""
        let displayName = dict["displayName"] as? String ?? userName
        let title = dict["title"] as? String
        var manager: String?
        if let ent = dict["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"] as? [String: Any],
           let mgr = ent["manager"] as? [String: Any] {
            manager = mgr["displayName"] as? String
        }
        return DirectoryUser(id: id, displayName: displayName, userName: userName, title: title, manager: manager)
    }
}

