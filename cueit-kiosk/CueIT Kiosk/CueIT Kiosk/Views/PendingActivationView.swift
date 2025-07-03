import SwiftUI

struct PendingActivationView: View {
    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            Image(systemName: "pause.circle.fill")
                .font(.system(size: 64))
                .foregroundColor(Theme.Colors.accent)
            Text("Pending Activation")
                .font(.title)
                .fontWeight(.semibold)
            Text("This kiosk is not active yet. Please contact IT to enable it.")
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.md)
            Spacer()
        }
        .padding(Theme.Spacing.md)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.Colors.base.ignoresSafeArea())
    }
}
