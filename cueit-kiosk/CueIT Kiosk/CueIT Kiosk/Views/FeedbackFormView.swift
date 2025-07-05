import SwiftUI

struct FeedbackFormView: View {
    @Environment(\.dismiss) var dismiss
    @State private var name = ""
    @State private var message = ""
    @State private var showError = false

    var body: some View {
        NavigationView {
            Form {
                TextField("Name", text: $name)
                TextEditor(text: $message)
                    .frame(height: 120)
                Button("Submit") { Task { await submit() } }
            }
            .navigationTitle("Feedback")
            .alert("Failed to send", isPresented: $showError) {
                Button("OK", role: .cancel) {}
            }
        }
    }

    @MainActor
    func submit() async {
        guard !message.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        guard let url = URL(string: "\(APIConfig.baseURL)/api/feedback") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: String] = ["name": name, "message": message]
        req.httpBody = try? JSONEncoder().encode(body)
        do {
            _ = try await URLSession.shared.data(for: req)
            dismiss()
        } catch {
            showError = true
        }
    }
}

