import Foundation

enum APIConfig {
    static var baseURL: String {
        get {
            if let saved = UserDefaults.standard.string(forKey: "serverURL"), !saved.isEmpty {
                return saved
            }
            if let url = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String {
                return url
            }
            return "http://localhost:3000"
        }
        set {
            UserDefaults.standard.set(newValue, forKey: "serverURL")
        }
    }
    
    static func resetToDefault() {
        UserDefaults.standard.removeObject(forKey: "serverURL")
    }
    
    /// Check if the current URL is a local network address
    static var isLocalNetwork: Bool {
        let url = baseURL.lowercased()
        return url.contains("127.0.0.1") || 
               url.contains("localhost") ||
               url.contains("10.") ||
               url.contains("172.16.") ||
               url.contains("172.17.") ||
               url.contains("172.18.") ||
               url.contains("172.19.") ||
               url.contains("172.20.") ||
               url.contains("172.21.") ||
               url.contains("172.22.") ||
               url.contains("172.23.") ||
               url.contains("172.24.") ||
               url.contains("172.25.") ||
               url.contains("172.26.") ||
               url.contains("172.27.") ||
               url.contains("172.28.") ||
               url.contains("172.29.") ||
               url.contains("172.30.") ||
               url.contains("172.31.") ||
               url.contains("192.168.")
    }
    
    /// Get the display name for the current server
    static var serverDisplayName: String {
        if let url = URL(string: baseURL) {
            return url.host ?? baseURL
        }
        return baseURL
    }
}
