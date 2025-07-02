//
//  TicketFormView.swift
//  CueIT Kiosk
//
//  Created by Tristen Neibarger on 7/2/25.
//

import SwiftUI

struct TicketFormView: View {
    @Environment(\.dismiss) var dismiss

    @State private var name = ""
    @State private var email = ""
    @State private var title = ""
    @State private var urgency = "Low"
    @State private var managerName = ""
    @State private var managerEmail = ""
    @State private var system = ""
    @State private var description = ""

    @State private var showSuccess = false
    @State private var isSubmitting = false

    let urgencyLevels = ["Low", "Medium", "High", "Urgent"]
    let systems = ["WiFi", "Printers", "Email", "VPN"] // Placeholder list

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Your Info")) {
                    TextField("Name", text: $name)
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                    TextField("Title", text: $title)
                }

                Section(header: Text("Request Details")) {
                    Picker("Urgency", selection: $urgency) {
                        ForEach(urgencyLevels, id: \.self) { level in
                            Text(level)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())

                    if urgency == "High" || urgency == "Urgent" {
                        TextField("Manager Name", text: $managerName)
                        TextField("Manager Email", text: $managerEmail)
                            .keyboardType(.emailAddress)
                    }

                    Picker("System", selection: $system) {
                        ForEach(systems, id: \.self) { system in
                            Text(system)
                        }
                    }
                    TextField("Describe the issue", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section {
                    Button(action: submitForm) {
                        HStack {
                            if isSubmitting { ProgressView() }
                            Text("Submit")
                        }
                    }
                    .disabled(email.isEmpty || description.isEmpty)
                }
            }
            .navigationTitle("Submit Ticket")
            .alert("Submitted!", isPresented: $showSuccess) {
                Button("OK") { dismiss() }
            } message: {
                Text("Your request has been sent to the IT Help Desk.")
            }
        }
    }

    func submitForm() {
        guard let url = URL(string: "http://localhost:3000/submit-ticket") else { return }

        let ticket = [
            "name": name,
            "email": email,
            "title": title,
            "urgency": urgency,
            "managerName": managerName,
            "managerEmail": managerEmail,
            "system": system,
            "description": description
        ]

        isSubmitting = true

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: ticket)

        URLSession.shared.dataTask(with: request) { _, _, _ in
            DispatchQueue.main.async {
                isSubmitting = false
                showSuccess = true
            }
        }.resume()
    }
}
