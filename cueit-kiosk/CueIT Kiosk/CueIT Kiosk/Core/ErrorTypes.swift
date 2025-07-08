import Foundation

// MARK: - API Error Types
enum APIError: Error, LocalizedError {
    case networkError
    case serverError(message: String? = nil)
    case authenticationFailed
    case configurationError
    case invalidResponse
    case timeout
    case offline
    
    var errorDescription: String? {
        switch self {
        case .networkError:
            return "Network connection failed"
        case .serverError(let message):
            return message ?? "Server error occurred"
        case .authenticationFailed:
            return "Authentication failed"
        case .configurationError:
            return "Configuration error"
        case .invalidResponse:
            return "Invalid server response"
        case .timeout:
            return "Request timed out"
        case .offline:
            return "Device is offline"
        }
    }
}

// MARK: - Configuration Error Types
enum ConfigurationError: Error, LocalizedError {
    case invalidServerURL
    case missingActivationCode
    case invalidActivationCode
    case networkTimeout
    case serverUnreachable
    case unauthorized
    
    var errorDescription: String? {
        switch self {
        case .invalidServerURL:
            return "Invalid server URL"
        case .missingActivationCode:
            return "Activation code is required"
        case .invalidActivationCode:
            return "Invalid activation code"
        case .networkTimeout:
            return "Network request timed out"
        case .serverUnreachable:
            return "Server is unreachable"
        case .unauthorized:
            return "Unauthorized access"
        }
    }
}

// MARK: - Kiosk Error Types
enum KioskError: Error, LocalizedError {
    case initializationFailed(String)
    case configurationLoadFailed
    case activationFailed(String)
    case networkConnectionLost
    case authenticationRequired
    case maintenanceMode
    
    var errorDescription: String? {
        switch self {
        case .initializationFailed(let message):
            return "Initialization failed: \(message)"
        case .configurationLoadFailed:
            return "Failed to load configuration"
        case .activationFailed(let message):
            return "Activation failed: \(message)"
        case .networkConnectionLost:
            return "Network connection lost"
        case .authenticationRequired:
            return "Authentication required"
        case .maintenanceMode:
            return "System is in maintenance mode"
        }
    }
}
