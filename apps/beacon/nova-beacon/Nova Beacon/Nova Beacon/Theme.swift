//
//  Theme.swift
//  Nova Beacon
//
//  Modern Apple UI Design System
//

import SwiftUI

enum Theme {
    // MARK: - Typography
    enum Typography {
        // Semantic Font Styles
        static let largeTitle = Font.largeTitle.weight(.bold)
        static let title = Font.title.weight(.bold)
        static let title2 = Font.title2.weight(.bold)
        static let title3 = Font.title3.weight(.semibold)
        static let headline = Font.headline.weight(.semibold)
        static let subheadline = Font.subheadline.weight(.medium)
        static let body = Font.body
        static let bodyBold = Font.body.weight(.semibold)
        static let callout = Font.callout
        static let footnote = Font.footnote
        static let caption1 = Font.caption
        static let caption2 = Font.caption2
        
        // Interactive Elements
        static let button = Font.body.weight(.medium)
        static let buttonLarge = Font.title3.weight(.semibold)
        static let navigationTitle = Font.title2.weight(.bold)
        static let tabItem = Font.caption2.weight(.medium)
    }
    
    // MARK: - Colors
    enum Colors {
        // Apple System Colors
        static let primary = Color.accentColor
        static let secondary = Color.secondary
        static let tertiary = Color(.tertiaryLabel)
        
        // Semantic Colors
        static let accent = Color.blue
        static let destructive = Color.red
        static let error = Color.red
        static let success = Color.green
        static let warning = Color.orange
        static let info = Color.blue
        
        // Status Colors
        static let online = Color.green
        static let offline = Color.red
        static let connecting = Color.orange
        static let pending = Color.yellow
        
        // Background Colors
        static let background = Color(.systemBackground)
        static let secondaryBackground = Color(.secondarySystemBackground)
        static let tertiaryBackground = Color(.tertiarySystemBackground)
        static let groupedBackground = Color(.systemGroupedBackground)
        
        // Surface Colors
        static let surface = Color(.secondarySystemBackground)
        static let surfaceElevated = Color(.tertiarySystemBackground)
        static let surfaceSecondary = Color(.tertiarySystemBackground)
        
        // Text Colors
        static let text = Color.primary
        static let textSecondary = Color.secondary
        static let textTertiary = Color(.tertiaryLabel)
        static let textInverse = Color.white
        
        // Legacy compatibility - iOS system label colors
        static let label = Color.primary
        static let secondaryLabel = Color.secondary
        static let tertiaryLabel = Color(.tertiaryLabel)
        
        // Interactive Colors
        static let fill = Color(.systemFill)
        static let secondaryFill = Color(.secondarySystemFill)
        static let tertiaryFill = Color(.tertiarySystemFill)
        
        // Border Colors
        static let separator = Color(.separator)
        static let opaqueSeparator = Color(.opaqueSeparator)
        
        // Legacy compatibility
        static let base = Color(.systemBackground)
        static let content = Color.primary
        static let green = Color.green
        static let red = Color.red
        static let yellow = Color.yellow
        static let purple = Color.purple
        static let orange = Color.orange
        
        static func color(for level: String) -> Color {
            switch level {
            case "warning": return warning
            case "error": return destructive
            case "open": return success
            case "closed": return destructive
            case "meeting": return purple
            case "brb": return warning
            case "lunch": return orange
            default: return success
            }
        }
    }
    
    // MARK: - Spacing
    enum Spacing {
        static let xxs: CGFloat = 2
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 20
        static let xxl: CGFloat = 24
        static let xxxl: CGFloat = 32
        static let xxxxl: CGFloat = 40
        static let massive: CGFloat = 48
        
        // Semantic Spacing
        static let cardPadding: CGFloat = 16
        static let sectionSpacing: CGFloat = 24
        static let screenPadding: CGFloat = 20
        static let buttonHeight: CGFloat = 50
        static let minimumTouchTarget: CGFloat = 44
    }
    
    // MARK: - Corner Radius
    enum CornerRadius {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 6
        static let md: CGFloat = 8
        static let lg: CGFloat = 12
        static let xl: CGFloat = 16
        static let xxl: CGFloat = 20
        static let xxxl: CGFloat = 24
        
        // Semantic Radius
        static let button: CGFloat = 12
        static let card: CGFloat = 16
        static let sheet: CGFloat = 20
        
        // Legacy compatibility
        static let medium: CGFloat = 8
    }
    
    // MARK: - Shadows
    enum Shadow {
        static let light = (color: Color.black.opacity(0.1), radius: CGFloat(2), offset: CGSize(width: 0, height: 1))
        static let medium = (color: Color.black.opacity(0.15), radius: CGFloat(8), offset: CGSize(width: 0, height: 4))
        static let heavy = (color: Color.black.opacity(0.25), radius: CGFloat(16), offset: CGSize(width: 0, height: 8))
    }
    
    // MARK: - Animations
    enum Animation {
        static let quick = SwiftUI.Animation.easeOut(duration: 0.2)
        static let smooth = SwiftUI.Animation.easeInOut(duration: 0.3)
        static let gentle = SwiftUI.Animation.easeInOut(duration: 0.5)
        static let bouncy = SwiftUI.Animation.spring(response: 0.6, dampingFraction: 0.8)
        static let snappy = SwiftUI.Animation.spring(response: 0.3, dampingFraction: 0.7)
    }
    
    // MARK: - Layout
    enum Layout {
        static let maxContentWidth: CGFloat = 680
        static let cardMinHeight: CGFloat = 60
        static let navigationBarHeight: CGFloat = 44
        static let tabBarHeight: CGFloat = 83
        static let statusBarHeight: CGFloat = 6
    }
}

// MARK: - Font Extensions
extension Font {
    var font: UIFont? {
        switch self {
        case .largeTitle:
            return UIFont.preferredFont(forTextStyle: .largeTitle)
        case .title:
            return UIFont.preferredFont(forTextStyle: .title1)
        case .title2:
            return UIFont.preferredFont(forTextStyle: .title2)
        case .title3:
            return UIFont.preferredFont(forTextStyle: .title3)
        case .headline:
            return UIFont.preferredFont(forTextStyle: .headline)
        case .subheadline:
            return UIFont.preferredFont(forTextStyle: .subheadline)
        case .body:
            return UIFont.preferredFont(forTextStyle: .body)
        case .callout:
            return UIFont.preferredFont(forTextStyle: .callout)
        case .footnote:
            return UIFont.preferredFont(forTextStyle: .footnote)
        case .caption:
            return UIFont.preferredFont(forTextStyle: .caption1)
        case .caption2:
            return UIFont.preferredFont(forTextStyle: .caption2)
        default:
            return UIFont.preferredFont(forTextStyle: .body)
        }
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
