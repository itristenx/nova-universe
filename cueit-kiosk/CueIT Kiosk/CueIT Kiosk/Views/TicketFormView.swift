//
//  TicketFormView.swift
//  CueIT Kiosk
//
//  Created by Tristen Neibarger on 7/2/25.
//

import SwiftUI

struct SubmissionErrorView: View {
    var onDismiss: () -> Void
    @ObservedObject var configService: ConfigService

    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            Image(systemName: "xmark.octagon.fill")
                .font(.system(size: 64))
                .foregroundColor(.red)
            Text("Submission Failed")
                .font(Theme.titleFont)
            Text("There was a problem sending your request. Please try again.")
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            HStack(spacing: 20) {
                Button(action: {
                    onDismiss()
                }) {
                    Text("Cancel")
                        .foregroundColor(.red)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color(.systemGray6))
                        .cornerRadius(Theme.cornerRadius)
                }

                Button(action: {
                    onDismiss()
                }) {
                    Text("Try Again")
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(configService.primaryColor)
                        .cornerRadius(Theme.cornerRadius)
                }
            }
            .padding(.top)

            Spacer()
        }
        .padding()
    }
}

struct TicketFormView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var configService: ConfigService
    @State private var name = ""
    @State private var email = ""
    @State private var title = ""
    @State private var system = ""
    @State private var urgency = "Low"
    @State private var showError = false

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Details")) {
                    TextField("Name", text: $name)
                        .font(Theme.bodyFont)
                    TextField("Email", text: $email)
                        .font(Theme.bodyFont)
                    TextField("Title", text: $title)
                        .font(Theme.bodyFont)
                    TextField("System", text: $system)
                        .font(Theme.bodyFont)
                    Picker("Urgency", selection: $urgency) {
                        Text("Low").tag("Low")
                        Text("Medium").tag("Medium")
                        Text("High").tag("High")
                        Text("Urgent").tag("Urgent")
                    }
                }
                Button("Submit") {
                    submit()
                }
                .font(Theme.buttonFont)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(8)
                .background(configService.primaryColor)
                .cornerRadius(Theme.cornerRadius)
            }
            .navigationTitle("New Ticket")
            .alert("Failed to submit", isPresented: $showError) {
                Button("OK", role: .cancel) {}
            }
        }
    }

    func submit() {
        guard let url = URL(string: "http://localhost:3000/submit-ticket") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["name": name, "email": email, "title": title, "system": system, "urgency": urgency]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        URLSession.shared.dataTask(with: req) { _, res, err in
            DispatchQueue.main.async {
                if err != nil {
                    showError = true
                } else {
                    dismiss()
                }
            }
        }.resume()
    }
}
