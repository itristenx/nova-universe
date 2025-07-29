import Foundation

class MailroomService {
    static let shared = MailroomService()

    func createPackage(tracking: String, recipientId: String) async -> Bool {
        guard let url = URL(string: "\(APIConfig.baseURL)/api/v1/mailroom/packages") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = [
            "tracking_number": tracking,
            "recipient_id": recipientId
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        do {
            _ = try await URLSession.shared.data(for: req)
            return true
        } catch {
            return false
        }
    }
}
