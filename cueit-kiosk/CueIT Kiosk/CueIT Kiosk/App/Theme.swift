import SwiftUI

extension Color {
    init(hex: String) {
        var hexString = hex
        if hexString.hasPrefix("#") {
            hexString.removeFirst()
        }
        var int: UInt64 = 0
        Scanner(string: hexString).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255.0
        let g = Double((int >> 8) & 0xFF) / 255.0
        let b = Double(int & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}

struct Theme {
    static let titleFont = Font.system(size: 28, weight: .bold, design: .rounded)
    static let bodyFont = Font.system(size: 18, weight: .regular, design: .rounded)
    static let buttonFont = Font.system(size: 20, weight: .semibold, design: .rounded)
    static let cornerRadius: CGFloat = 10
}
