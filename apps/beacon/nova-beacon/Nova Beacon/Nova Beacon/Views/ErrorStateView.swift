import SwiftUI

struct ErrorStateView: View {
    let error: Error
    let retryAction: () -> Void
    
    @State private var showDetails = false
    
    var body: some View {
        VStack(spacing: 30) {
            // Error Icon
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 80))
                .foregroundColor(.orange)
                .scaleEffect(showDetails ? 1.1 : 1.0)
                .animation(.easeInOut(duration: 0.3), value: showDetails)
            
            VStack(spacing: 16) {
                Text("Something went wrong")
                    .font(.title)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                Text(errorMessage)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(showDetails ? nil : 3)
            }
            
            VStack(spacing: 16) {
                // Retry Button
                Button(action: retryAction) {
                    HStack {
                        Image(systemName: "arrow.clockwise")
                        Text("Try Again")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(12)
                }
                .frame(maxWidth: 300)
                
                // Details Toggle
                Button(action: {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        showDetails.toggle()
                    }
                }) {
                    HStack {
                        Text(showDetails ? "Hide Details" : "Show Details")
                        Image(systemName: showDetails ? "chevron.up" : "chevron.down")
                    }
                    .font(.caption)
                    .foregroundColor(.blue)
                }
            }
            
            if showDetails {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Technical Details:")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.secondary)
                    
                    Text(error.localizedDescription)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding()
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(8)
                }
                .frame(maxWidth: 400)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
        .onAppear {
            // Log error for debugging
            print("Error displayed: \(error.localizedDescription)")
        }
    }
    
    private var errorMessage: String {
        if let apiError = error as? APIError {
            switch apiError {
            case .networkError:
                return "Network connection failed. Please check your internet connection and try again."
            case .serverError:
                return "Server is temporarily unavailable. Please try again in a few moments."
            case .authenticationFailed:
                return "Authentication failed. Please contact your administrator."
            case .configurationError:
                return "Configuration error detected. Please check your settings."
            default:
                return "An unexpected error occurred. Please try again."
            }
        } else {
            return "An unexpected error occurred. Please try again or contact support if the problem persists."
        }
    }
}

// MARK: - Preview
struct ErrorStateView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            ErrorStateView(error: APIError.networkError) {
                print("Retry tapped")
            }
            .previewDisplayName("Network Error")
            
            ErrorStateView(error: APIError.serverError(message: "Internal server error")) {
                print("Retry tapped")
            }
            .previewDisplayName("Server Error")
        }
    }
}
