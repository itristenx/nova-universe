//
//  ModernButton.swift
//  Nova Beacon
//
//  Modern button styles with Apple UI design
//

import SwiftUI

// MARK: - Button Styles

struct PrimaryButtonStyle: ButtonStyle {
    var isLoading: Bool = false
    var isDestructive: Bool = false
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Theme.Typography.button)
            .foregroundColor(isDestructive ? Theme.Colors.textInverse : Theme.Colors.textInverse)
            .frame(maxWidth: .infinity)
            .frame(height: Theme.Spacing.buttonHeight)
            .background(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.button)
                    .fill(buttonColor(isPressed: configuration.isPressed))
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(Theme.Animation.quick, value: configuration.isPressed)
            .overlay {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: Theme.Colors.textInverse))
                        .scaleEffect(0.8)
                }
            }
            .disabled(isLoading)
    }
    
    private func buttonColor(isPressed: Bool) -> Color {
        let baseColor = isDestructive ? Theme.Colors.destructive : Theme.Colors.accent
        return isPressed ? baseColor.opacity(0.8) : baseColor
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    var isLoading: Bool = false
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Theme.Typography.button)
            .foregroundColor(Theme.Colors.accent)
            .frame(maxWidth: .infinity)
            .frame(height: Theme.Spacing.buttonHeight)
            .background(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.button)
                    .fill(Theme.Colors.secondaryFill)
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.CornerRadius.button)
                            .stroke(Theme.Colors.accent.opacity(0.3), lineWidth: 1)
                    )
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(Theme.Animation.quick, value: configuration.isPressed)
            .overlay {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: Theme.Colors.accent))
                        .scaleEffect(0.8)
                }
            }
            .disabled(isLoading)
    }
}

struct TertiaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Theme.Typography.button)
            .foregroundColor(Theme.Colors.accent)
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.sm)
            .background(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.sm)
                    .fill(configuration.isPressed ? Theme.Colors.tertiaryFill : Color.clear)
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(Theme.Animation.quick, value: configuration.isPressed)
    }
}

struct CompactButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Theme.Typography.footnote)
            .foregroundColor(Theme.Colors.accent)
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.sm)
            .background(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.sm)
                    .fill(Theme.Colors.secondaryFill)
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(Theme.Animation.quick, value: configuration.isPressed)
    }
}

struct FloatingActionButtonStyle: ButtonStyle {
    var backgroundColor: Color = Theme.Colors.accent
    var foregroundColor: Color = Theme.Colors.textInverse
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.title2.weight(.medium))
            .foregroundColor(foregroundColor)
            .frame(width: 56, height: 56)
            .background(
                Circle()
                    .fill(backgroundColor)
                    .shadow(
                        color: Theme.Shadow.medium.color,
                        radius: Theme.Shadow.medium.radius,
                        x: Theme.Shadow.medium.offset.width,
                        y: Theme.Shadow.medium.offset.height
                    )
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(Theme.Animation.bouncy, value: configuration.isPressed)
    }
}

// MARK: - Modern Button Styles Enum
enum ModernButtonStyle {
    case primary
    case secondary
    case tertiary
}

// MARK: - Modern Button Component
struct ModernButton: View {
    let title: String
    let style: ModernButtonStyle
    let action: () -> Void
    var isLoading: Bool = false
    var isDestructive: Bool = false
    var icon: String? = nil
    
    var body: some View {
        Group {
            switch style {
            case .primary:
                Button(action: action) {
                    HStack(spacing: Theme.Spacing.sm) {
                        if let icon = icon {
                            Image(systemName: icon)
                                .font(.body.weight(.medium))
                        }
                        
                        if !isLoading {
                            Text(title)
                        }
                    }
                }
                .buttonStyle(PrimaryButtonStyle(isLoading: isLoading, isDestructive: isDestructive))
                
            case .secondary:
                Button(action: action) {
                    HStack(spacing: Theme.Spacing.sm) {
                        if let icon = icon {
                            Image(systemName: icon)
                                .font(.body.weight(.medium))
                        }
                        
                        if !isLoading {
                            Text(title)
                        }
                    }
                }
                .buttonStyle(SecondaryButtonStyle(isLoading: isLoading))
                
            case .tertiary:
                Button(action: action) {
                    HStack(spacing: Theme.Spacing.sm) {
                        if let icon = icon {
                            Image(systemName: icon)
                                .font(.body.weight(.medium))
                        }
                        
                        if !isLoading {
                            Text(title)
                        }
                    }
                }
                .buttonStyle(TertiaryButtonStyle())
            }
        }
    }
}

// MARK: - Custom Button Views

struct PrimaryButton: View {
    let title: String
    let action: () -> Void
    var isLoading: Bool = false
    var isDestructive: Bool = false
    var icon: String? = nil
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Spacing.sm) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.body.weight(.medium))
                }
                
                if !isLoading {
                    Text(title)
                }
            }
        }
        .buttonStyle(PrimaryButtonStyle(isLoading: isLoading, isDestructive: isDestructive))
    }
}

struct SecondaryButton: View {
    let title: String
    let action: () -> Void
    var isLoading: Bool = false
    var icon: String? = nil
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Spacing.sm) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.body.weight(.medium))
                }
                
                if !isLoading {
                    Text(title)
                }
            }
        }
        .buttonStyle(SecondaryButtonStyle(isLoading: isLoading))
    }
}

struct TertiaryButton: View {
    let title: String
    let action: () -> Void
    var icon: String? = nil
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Spacing.xs) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.footnote.weight(.medium))
                }
                Text(title)
            }
        }
        .buttonStyle(TertiaryButtonStyle())
    }
}

// MARK: - Preview

struct ModernButton_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: Theme.Spacing.lg) {
            PrimaryButton(title: "Primary Button", action: {})
            PrimaryButton(title: "Loading...", action: {}, isLoading: true)
            PrimaryButton(title: "Delete", action: {}, isDestructive: true, icon: "trash")
            
            SecondaryButton(title: "Secondary Button", action: {})
            SecondaryButton(title: "With Icon", action: {}, icon: "arrow.clockwise")
            
            TertiaryButton(title: "Tertiary Button", action: {})
            TertiaryButton(title: "Settings", action: {}, icon: "gear")
            
            Button {
                // Action
            } label: {
                Image(systemName: "plus")
            }
            .buttonStyle(FloatingActionButtonStyle())
        }
        .padding()
        .background(Theme.Colors.background)
    }
}
