//
//  AdminLoginView.swift
//  CueIT Kiosk
//
//  Created by Tristen Neibarger on 7/2/25.
//

import SwiftUI

struct AdminLoginView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var configService: ConfigService
    @State private var password = ""
    @State private var showError = false

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Admin Access")
                    .font(.title).bold()

                SecureField("Enter Password", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)

                if showError {
                    Text("Incorrect password")
                        .foregroundColor(Theme.Colors.accent)
                        .font(.subheadline)
                }

                Button("Login") {
                    configService.verifyPassword(password) { ok in
                        if ok {
                            dismiss()
                        } else {
                            showError = true
                        }
                    }
                }
                .padding(Theme.Spacing.sm)
                .background(Theme.Colors.primary)
                .foregroundColor(Theme.Colors.base)
                .cornerRadius(8)
            }
            .padding(Theme.Spacing.md)
            .navigationTitle("Admin Login")
        }
    }
}
