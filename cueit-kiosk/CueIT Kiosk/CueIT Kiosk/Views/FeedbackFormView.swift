import SwiftUI

struct FeedbackFormView: View {
    @Environment(\.dismiss) var dismiss
    @State private var name = ""
    @State private var message = ""
    @State private var showError = false
    @State private var isSubmitting = false

    var body: some View {
        NavigationView {
            Form {
                TextField("Name", text: $name)
                TextEditor(text: $message)
                    .frame(height: 120)
                Button("Submit") { 
                    if !isSubmitting {
                        Task { await submit() }
                    }
                }
                .disabled(isSubmitting)
            }
            .navigationTitle("Feedback")
            .alert("Failed to send", isPresented: $showError) {
                Button("OK", role: .cancel) {}
            }
            .overlay(
                Group {
                    if isSubmitting {
                        VStack(spacing: 12) {
                            ProgressView()
                                .scaleEffect(1.2)
                            Text("Sending feedback...")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        .padding()
                        .background(Color(.systemBackground).opacity(0.9))
                        .cornerRadius(12)
                    }
                },
                alignment: .center
            )
        }
    }

    @MainActor
    func submit() async {
        guard !message.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        isSubmitting = true
        guard let url = URL(string: "\(APIConfig.baseURL)/api/feedback") else { 
            isSubmitting = false
            return 
        }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: String] = ["name": name, "message": message]
        req.httpBody = try? JSONEncoder().encode(body)
        do {
            _ = try await URLSession.shared.data(for: req)
            isSubmitting = false
            dismiss()
        } catch {
            isSubmitting = false
            showError = true
        }
    }
}

