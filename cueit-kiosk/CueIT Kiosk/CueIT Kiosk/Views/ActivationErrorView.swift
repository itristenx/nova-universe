import SwiftUI

struct ActivationErrorView: View {
    var onRetry: () -> Void

    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            Image(systemName: "xmark.octagon.fill")
                .font(.system(size: 64))
                .foregroundColor(Theme.Colors.accent)
            Text("Activation Error")
                .font(.title)
                .fontWeight(.semibold)
            Text("Unable to verify kiosk status. Check your connection and try again.")
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.md)
            Button("Retry") {
                onRetry()
            }
            .padding(Theme.Spacing.sm)
            .background(Theme.Colors.primary)
            .foregroundColor(Theme.Colors.base)
            .cornerRadius(8)
            Spacer()
        }
        .padding(Theme.Spacing.md)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.Colors.base.ignoresSafeArea())
    }
}
