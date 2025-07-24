//
//  ModernCard.swift
//  CueIT Kiosk
//
//  Modern card component with Apple UI design
//

import SwiftUI

struct ModernCard<Content: View>: View {
    let content: () -> Content
    var backgroundColor: Color = Theme.Colors.surface
    var cornerRadius: CGFloat = Theme.CornerRadius.card
    var shadow: Bool = true
    var padding: CGFloat = Theme.Spacing.cardPadding
    
    init(
        backgroundColor: Color = Theme.Colors.surface,
        cornerRadius: CGFloat = Theme.CornerRadius.card,
        shadow: Bool = true,
        padding: CGFloat = Theme.Spacing.cardPadding,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.backgroundColor = backgroundColor
        self.cornerRadius = cornerRadius
        self.shadow = shadow
        self.padding = padding
        self.content = content
    }
    
    var body: some View {
        content()
            .padding(padding)
            .background(backgroundColor)
            .cornerRadius(cornerRadius)
            .conditionalShadow(enabled: shadow)
    }
}

// MARK: - Supporting Views

struct StatusCard: View {
    let title: String
    let subtitle: String?
    let status: ConnectionStatus
    var action: (() -> Void)? = nil
    
    var body: some View {
        ModernCard {
            HStack(spacing: Theme.Spacing.md) {
                CompactStatusIndicator(connectionStatus: status)
                
                VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                    Text(title)
                        .font(Theme.Typography.headline)
                        .foregroundColor(Theme.Colors.text)
                    
                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(Theme.Typography.footnote)
                            .foregroundColor(Theme.Colors.textSecondary)
                    }
                }
                
                Spacer()
                
                if action != nil {
                    Button("Retry") {
                        action?()
                    }
                    .buttonStyle(SecondaryButtonStyle())
                }
            }
        }
    }
}

struct InfoCard: View {
    let title: String
    let value: String
    let icon: String
    var action: (() -> Void)? = nil
    
    var body: some View {
        ModernCard {
            HStack(spacing: Theme.Spacing.md) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(Theme.Colors.accent)
                    .frame(width: 32, height: 32)
                
                VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                    Text(title)
                        .font(Theme.Typography.callout)
                        .foregroundColor(Theme.Colors.textSecondary)
                    
                    Text(value)
                        .font(Theme.Typography.headline)
                        .foregroundColor(Theme.Colors.text)
                }
                
                Spacer()
                
                if action != nil {
                    Button {
                        action?()
                    } label: {
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(Theme.Colors.textTertiary)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

// MARK: - Helper Extensions

extension View {
    func conditionalShadow(enabled: Bool) -> some View {
        Group {
            if enabled {
                self.shadow(
                    color: Theme.Shadow.medium.color,
                    radius: Theme.Shadow.medium.radius,
                    x: Theme.Shadow.medium.offset.width,
                    y: Theme.Shadow.medium.offset.height
                )
            } else {
                self
            }
        }
    }
}

// MARK: - Preview

struct ModernCard_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: Theme.Spacing.lg) {
            ModernCard {
                Text("Hello, World!")
                    .font(Theme.Typography.headline)
            }
            
            StatusCard(
                title: "Server Connection",
                subtitle: "Connected to localhost:3000",
                status: {
                    let status = ConnectionStatus()
                    status.state = .connected
                    return status
                }()
            )
            
            InfoCard(
                title: "Kiosk ID",
                value: "ABC-123-DEF",
                icon: "desktopcomputer",
                action: {}
            )
        }
        .padding()
        .background(Theme.Colors.background)
    }
}
