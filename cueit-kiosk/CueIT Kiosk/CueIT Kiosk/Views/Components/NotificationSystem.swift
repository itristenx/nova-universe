import SwiftUI
import Combine

// MARK: - Notification Types
enum NotificationType: String, CaseIterable {
    case info = "info"
    case success = "success"
    case warning = "warning"
    case error = "error"
    
    var iconName: String {
        switch self {
        case .info:
            return "info.circle.fill"
        case .success:
            return "checkmark.circle.fill"
        case .warning:
            return "exclamationmark.triangle.fill"
        case .error:
            return "xmark.circle.fill"
        }
    }
    
    var color: Color {
        switch self {
        case .info:
            return Theme.Colors.accent
        case .success:
            return Theme.Colors.success
        case .warning:
            return Theme.Colors.warning
        case .error:
            return Theme.Colors.destructive
        }
    }
    
    var backgroundColor: Color {
        switch self {
        case .info:
            return Theme.Colors.accent.opacity(0.1)
        case .success:
            return Theme.Colors.success.opacity(0.1)
        case .warning:
            return Theme.Colors.warning.opacity(0.1)
        case .error:
            return Theme.Colors.destructive.opacity(0.1)
        }
    }
}

// MARK: - Notification Model
struct AppNotification: Identifiable, Equatable {
    let id = UUID()
    let type: NotificationType
    let title: String
    let message: String?
    let action: NotificationAction?
    let duration: TimeInterval?
    let timestamp: Date
    
    init(
        type: NotificationType,
        title: String,
        message: String? = nil,
        action: NotificationAction? = nil,
        duration: TimeInterval? = 4.0
    ) {
        self.type = type
        self.title = title
        self.message = message
        self.action = action
        self.duration = duration
        self.timestamp = Date()
    }
    
    static func == (lhs: AppNotification, rhs: AppNotification) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - Notification Action
struct NotificationAction {
    let title: String
    let action: () -> Void
    
    init(title: String, action: @escaping () -> Void) {
        self.title = title
        self.action = action
    }
}

// MARK: - Notification Manager
class NotificationManager: ObservableObject {
    @Published var notifications: [AppNotification] = []
    @Published var isVisible = false
    
    private var cancellables = Set<AnyCancellable>()
    private var timers: [UUID: Timer] = [:]
    
    static let shared = NotificationManager()
    
    private init() {
        setupConnectionStatusObserver()
    }
    
    // MARK: - Public Methods
    func show(_ notification: AppNotification) {
        DispatchQueue.main.async {
            self.notifications.append(notification)
            self.isVisible = true
            
            // Auto-dismiss if duration is set
            if let duration = notification.duration {
                self.scheduleAutoDismiss(for: notification, after: duration)
            }
        }
    }
    
    func show(
        type: NotificationType,
        title: String,
        message: String? = nil,
        action: NotificationAction? = nil,
        duration: TimeInterval? = 4.0
    ) {
        let notification = AppNotification(
            type: type,
            title: title,
            message: message,
            action: action,
            duration: duration
        )
        show(notification)
    }
    
    func dismiss(_ notification: AppNotification) {
        DispatchQueue.main.async {
            self.notifications.removeAll { $0.id == notification.id }
            self.timers[notification.id]?.invalidate()
            self.timers.removeValue(forKey: notification.id)
            
            if self.notifications.isEmpty {
                self.isVisible = false
            }
        }
    }
    
    func dismissAll() {
        DispatchQueue.main.async {
            self.notifications.removeAll()
            self.timers.values.forEach { $0.invalidate() }
            self.timers.removeAll()
            self.isVisible = false
        }
    }
    
    // MARK: - Convenience Methods
    func showSuccess(title: String, message: String? = nil) {
        show(type: .success, title: title, message: message)
    }
    
    func showError(title: String, message: String? = nil, action: NotificationAction? = nil) {
        show(type: .error, title: title, message: message, action: action, duration: nil)
    }
    
    func showWarning(title: String, message: String? = nil) {
        show(type: .warning, title: title, message: message)
    }
    
    func showInfo(title: String, message: String? = nil) {
        show(type: .info, title: title, message: message)
    }
    
    func showConnectionStatus(_ status: ConnectionState, message: String? = nil) {
        let type: NotificationType
        let title: String
        
        switch status {
        case .connected:
            type = .success
            title = "Connected to Server"
        case .connecting:
            type = .info
            title = "Connecting to Server"
        case .disconnected:
            type = .warning
            title = "Disconnected from Server"
        case .error:
            type = .error
            title = "Connection Error"
        }
        
        let retryAction = status == .error || status == .disconnected ? 
            NotificationAction(title: "Retry") {
                NotificationCenter.default.post(name: .connectionRetryRequested, object: nil)
            } : nil
        
        show(type: type, title: title, message: message, action: retryAction)
    }
    
    // MARK: - Private Methods
    private func scheduleAutoDismiss(for notification: AppNotification, after duration: TimeInterval) {
        let timer = Timer.scheduledTimer(withTimeInterval: duration, repeats: false) { [weak self] _ in
            self?.dismiss(notification)
        }
        timers[notification.id] = timer
    }
    
    private func setupConnectionStatusObserver() {
        NotificationCenter.default.publisher(for: .connectionStatusChanged)
            .compactMap { $0.object as? ConnectionState }
            .sink { [weak self] status in
                self?.showConnectionStatus(status)
            }
            .store(in: &cancellables)
    }
}

// MARK: - Notification View
struct NotificationView: View {
    let notification: AppNotification
    let onDismiss: () -> Void
    
    @State private var isVisible = false
    @State private var dragOffset: CGSize = .zero
    
    var body: some View {
        HStack(spacing: Theme.Spacing.sm) {
            // Icon
            Image(systemName: notification.type.iconName)
                .font(.system(size: 20, weight: .medium))
                .foregroundColor(notification.type.color)
            
            // Content
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(notification.title)
                    .font(Theme.Typography.headline)
                    .foregroundColor(Theme.Colors.label)
                
                if let message = notification.message {
                    Text(message)
                        .font(Theme.Typography.body)
                        .foregroundColor(Theme.Colors.secondaryLabel)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            
            Spacer()
            
            // Action button
            if let action = notification.action {
                Button(action.title) {
                    action.action()
                    onDismiss()
                }
                .buttonStyle(TertiaryButtonStyle())
                .controlSize(.small)
            }
            
            // Dismiss button
            Button {
                withAnimation(.easeInOut(duration: 0.2)) {
                    onDismiss()
                }
            } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Theme.Colors.tertiaryLabel)
            }
        }
        .padding(Theme.Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: Theme.CornerRadius.medium)
                .fill(notification.type.backgroundColor)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.medium)
                        .stroke(notification.type.color.opacity(0.2), lineWidth: 1)
                )
        )
        .offset(dragOffset)
        .scaleEffect(isVisible ? 1 : 0.8)
        .opacity(isVisible ? 1 : 0)
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: isVisible)
        .gesture(
            DragGesture()
                .onChanged { value in
                    dragOffset = value.translation
                }
                .onEnded { value in
                    if abs(value.translation.x) > 100 || abs(value.translation.y) > 50 {
                        withAnimation(.easeOut(duration: 0.2)) {
                            onDismiss()
                        }
                    } else {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                            dragOffset = .zero
                        }
                    }
                }
        )
        .onAppear {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                isVisible = true
            }
        }
    }
}

// MARK: - Notification Container
struct NotificationContainer: View {
    @ObservedObject var notificationManager = NotificationManager.shared
    
    var body: some View {
        VStack(spacing: Theme.Spacing.sm) {
            ForEach(notificationManager.notifications) { notification in
                NotificationView(notification: notification) {
                    notificationManager.dismiss(notification)
                }
                .transition(.asymmetric(
                    insertion: .move(edge: .top).combined(with: .opacity),
                    removal: .move(edge: .top).combined(with: .opacity)
                ))
            }
        }
        .padding(.horizontal, Theme.Spacing.md)
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: notificationManager.notifications)
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 20) {
        NotificationContainer()
        
        VStack(spacing: 10) {
            Button("Show Success") {
                NotificationManager.shared.showSuccess(
                    title: "Connection Established",
                    message: "Successfully connected to the server"
                )
            }
            
            Button("Show Error") {
                NotificationManager.shared.showError(
                    title: "Connection Failed",
                    message: "Unable to connect to the server",
                    action: NotificationAction(title: "Retry") {
                        print("Retry tapped")
                    }
                )
            }
            
            Button("Show Warning") {
                NotificationManager.shared.showWarning(
                    title: "Poor Connection",
                    message: "Connection is unstable"
                )
            }
            
            Button("Show Info") {
                NotificationManager.shared.showInfo(
                    title: "Update Available",
                    message: "A new version is available for download"
                )
            }
            
            Button("Clear All") {
                NotificationManager.shared.dismissAll()
            }
        }
        .buttonStyle(PrimaryButtonStyle())
    }
    .padding()
}
