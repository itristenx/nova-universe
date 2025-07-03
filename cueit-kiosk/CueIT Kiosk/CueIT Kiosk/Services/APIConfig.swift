import Foundation

enum APIConfig {
    static var baseURL: String {
        if let url = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String {
            return url
        }
        return "http://localhost:3000"
    }
}
