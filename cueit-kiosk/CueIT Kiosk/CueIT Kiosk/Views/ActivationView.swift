import SwiftUI

struct ActivationView: View {
    @State private var activating = false
    @State private var error = false
    @StateObject private var kioskService = KioskService.shared

    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            Image(systemName: "wifi")
                .font(.system(size: 64))
                .foregroundColor(Theme.Colors.accent)
            Text("Kiosk Setup")
                .font(.title)
                .fontWeight(.semibold)
            Text("API: \(APIConfig.baseURL)")
                .font(.subheadline)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.md)
            Text("ID: \(kioskService.id)")
                .font(.subheadline)
                .foregroundColor(.gray)
            if activating {
                ProgressView()
            } else {
                Button("Activate") { Task { await activate() } }
                    .padding(Theme.Spacing.sm)
                    .background(Theme.Colors.primary)
                    .foregroundColor(Theme.Colors.base)
                    .cornerRadius(8)
            }
            if error {
                Text("Activation failed")
                    .foregroundColor(Theme.Colors.accent)
            }
            Spacer()
        }
        .padding(Theme.Spacing.md)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.Colors.base.ignoresSafeArea())
    }

    @MainActor
    private func activate() async {
        activating = true
        error = false
        let success = await kioskService.activate()
        activating = false
        error = !success
    }
}
