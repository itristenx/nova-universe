//
//  TicketFormView.swift
//  CueIT Kiosk
//
//  Created by Tristen Neibarger on 7/2/25.
//

import SwiftUI

struct SubmissionErrorView: View {
    var onDismiss: () -> Void

    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            Image(systemName: "xmark.octagon.fill")
                .font(.system(size: 64))
                .foregroundColor(Theme.Colors.accent)
            Text("Submission Failed")
                .font(.title)
                .fontWeight(.semibold)
            Text("There was a problem sending your request. Please try again.")
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.md)

            HStack(spacing: 20) {
                Button(action: {
                    onDismiss()
                }) {
                    Text("Cancel")
                        .foregroundColor(Theme.Colors.accent)
                        .padding(Theme.Spacing.sm)
                        .frame(maxWidth: .infinity)
                        .background(Color(.systemGray6))
                        .cornerRadius(10)
                }

                Button(action: {
                    onDismiss()
                }) {
                    Text("Try Again")
                        .foregroundColor(Theme.Colors.base)
                        .padding(Theme.Spacing.sm)
                        .frame(maxWidth: .infinity)
                        .background(Theme.Colors.primary)
                        .cornerRadius(10)
                }
            }
            .padding(.top, Theme.Spacing.md)

            Spacer()
        }
        .padding(Theme.Spacing.md)
    }
}

struct TicketFormView: View {
    @Environment(\.dismiss) var dismiss
    @State private var name = ""
    @State private var email = ""
    @State private var title = ""
    @State private var manager = ""
    @State private var system = ""
    @State private var urgency = "Low"
    @State private var showError = false
    @State private var isSubmitting = false
    @StateObject private var dir = DirectoryService.shared
    @StateObject private var notificationService = NotificationService.shared

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Details")) {
                    TextField("Name", text: $name)
                    TextField("Email", text: $email)
                        .onChange(of: email) { _, new in
                            dir.search(email: new)
                        }
                    TextField("Title", text: $title)
                    TextField("Manager", text: $manager)
                    TextField("System", text: $system)
                    Picker("Urgency", selection: $urgency) {
                        Text("Low").tag("Low")
                        Text("Medium").tag("Medium")
                        Text("High").tag("High")
                        Text("Urgent").tag("Urgent")
                    }
                }
                if !dir.suggestions.isEmpty {
                    Section(header: Text("Directory Results")) {
                        ForEach(dir.suggestions) { user in
                            Button(action: { apply(user) }) {
                                VStack(alignment: .leading) {
                                    Text(user.displayName)
                                    Text(user.userName)
                                        .font(.caption)
                                        .foregroundColor(.gray)
                                }
                            }
                        }
                    }
                } else if dir.isSearching {
                    Section(header: Text("Directory Results")) {
                        HStack {
                            ProgressView()
                                .scaleEffect(0.8)
                            Text("Searching directory...")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        .padding(.vertical, 8)
                    }
                }
                Button("Submit") {
                    if !isSubmitting {
                        Task { await submit() }
                    }
                }
                .disabled(isSubmitting)
            }
            .navigationTitle("New Ticket")
            .alert("Failed to submit", isPresented: $showError) {
                Button("OK", role: .cancel) {}
            }
            .overlay(
                Group {
                    if isSubmitting {
                        VStack(spacing: 12) {
                            ProgressView()
                                .scaleEffect(1.2)
                            Text("Submitting ticket...")
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
            .overlay(
                Group {
                    if let note = notificationService.latest {
                        Text(note.message)
                            .padding(8)
                            .frame(maxWidth: .infinity)
                            .background(Theme.Colors.color(for: note.level))
                            .foregroundColor(.black)
                    }
                },
                alignment: .top
            )
        }
    }

  @MainActor
  func submit() async {
    isSubmitting = true
    let ticket = QueuedTicket(name: name, email: email, title: title, manager: manager, system: system, urgency: urgency)
    guard let url = URL(string: "\(APIConfig.baseURL)/submit-ticket") else { 
        isSubmitting = false
        return 
    }
    var req = URLRequest(url: url)
    req.httpMethod = "POST"
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    let body = ["name": ticket.name, "email": ticket.email, "title": ticket.title, "manager": ticket.manager, "system": ticket.system, "urgency": ticket.urgency]
    req.httpBody = try? JSONSerialization.data(withJSONObject: body)
    do {
      _ = try await URLSession.shared.data(for: req)
      isSubmitting = false
      dismiss()
      TicketQueue.shared.retry()
    } catch {
      isSubmitting = false
      TicketQueue.shared.enqueue(ticket)
      showError = true
    }
  }

    func apply(_ user: DirectoryUser) {
        name = user.displayName
        email = user.userName
        if let t = user.title { title = t }
        if let m = user.manager { manager = m }
        dir.suggestions = []
        dir.isSearching = false
    }
}
