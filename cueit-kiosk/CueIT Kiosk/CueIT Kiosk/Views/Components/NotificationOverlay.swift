import SwiftUI

struct NotificationOverlay: View {
    let notification: KioskNotification
    let onDismiss: () -> Void
    
    @State private var isVisible = false
    @State private var animateIcon = false
    
    var body: some View {
        VStack(spacing: 0) {
            if isVisible {
                notificationContent
                    .transition(.move(edge: .top).combined(with: .opacity))
            }
            
            Spacer()
        }
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                isVisible = true
            }
            
            // Auto-dismiss after duration if specified
            if let duration = notification.duration {
                DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
                    dismissNotification()
                }
            }
        }
    }
    
    private var notificationContent: some View {
        HStack(spacing: 16) {
            // Icon
            iconView
                .scaleEffect(animateIcon ? 1.1 : 1.0)
                .animation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true), value: animateIcon)
                .onAppear {
                    animateIcon = notification.type == .warning
                }
            
            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text(notification.title)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(textColor)
                
                if let message = notification.message {
                    Text(message)
                        .font(.body)
                        .foregroundColor(textColor.opacity(0.9))
                        .lineLimit(3)
                }
            }
            
            Spacer()
            
            // Dismiss Button
            if notification.isDismissible {
                Button(action: dismissNotification) {
                    Image(systemName: "xmark")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(textColor.opacity(0.8))
                        .padding(8)
                        .background(Color.white.opacity(0.2))
                        .clipShape(Circle())
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .background(backgroundColor)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4)
        .padding(.horizontal, 20)
        .padding(.top, 60) // Account for status bar
    }
    
    private var iconView: some View {
        Image(systemName: iconName)
            .font(.system(size: 24, weight: .medium))
            .foregroundColor(iconColor)
            .frame(width: 32, height: 32)
    }
    
    private var iconName: String {
        switch notification.type {
        case .info:
            return "info.circle.fill"
        case .success:
            return "checkmark.circle.fill"
        case .warning:
            return "exclamationmark.triangle.fill"
        case .error:
            return "xmark.circle.fill"
        case .update:
            return "arrow.down.circle.fill"
        }
    }
    
    private var iconColor: Color {
        switch notification.type {
        case .info:
            return .blue
        case .success:
            return .green
        case .warning:
            return .orange
        case .error:
            return .red
        case .update:
            return .purple
        }
    }
    
    private var backgroundColor: Color {
        switch notification.type {
        case .info:
            return .blue
        case .success:
            return .green
        case .warning:
            return .orange
        case .error:
            return .red
        case .update:
            return .purple
        }
    }
    
    private var textColor: Color {
        return .white
    }
    
    private func dismissNotification() {
        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
            isVisible = false
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            onDismiss()
        }
    }
}

// MARK: - Notification Model
struct KioskNotification {
    let id = UUID()
    let type: NotificationType
    let title: String
    let message: String?
    let duration: TimeInterval? // Auto-dismiss after this duration
    let isDismissible: Bool
    let actionTitle: String?
    let action: (() -> Void)?
    
    enum NotificationType {
        case info
        case success
        case warning
        case error
        case update
    }
    
    init(
        type: NotificationType,
        title: String,
        message: String? = nil,
        duration: TimeInterval? = 5.0,
        isDismissible: Bool = true,
        actionTitle: String? = nil,
        action: (() -> Void)? = nil
    ) {
        self.type = type
        self.title = title
        self.message = message
        self.duration = duration
        self.isDismissible = isDismissible
        self.actionTitle = actionTitle
        self.action = action
    }
}

// MARK: - Preview
struct NotificationOverlay_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            ZStack {
                Color.gray.opacity(0.1)
                    .ignoresSafeArea()
                
                NotificationOverlay(
                    notification: KioskNotification(
                        type: .info,
                        title: "Configuration Updated",
                        message: "New settings have been applied successfully"
                    )
                ) {
                    print("Notification dismissed")
                }
            }
            .previewDisplayName("Info Notification")
            
            ZStack {
                Color.gray.opacity(0.1)
                    .ignoresSafeArea()
                
                NotificationOverlay(
                    notification: KioskNotification(
                        type: .warning,
                        title: "Connection Issue",
                        message: "Network connection is unstable. Some features may be limited.",
                        duration: nil,
                        isDismissible: true
                    )
                ) {
                    print("Warning dismissed")
                }
            }
            .previewDisplayName("Warning Notification")
            
            ZStack {
                Color.gray.opacity(0.1)
                    .ignoresSafeArea()
                
                NotificationOverlay(
                    notification: KioskNotification(
                        type: .error,
                        title: "Error",
                        message: "Failed to submit ticket. Please try again.",
                        duration: 10.0
                    )
                ) {
                    print("Error dismissed")
                }
            }
            .previewDisplayName("Error Notification")
        }
    }
}
