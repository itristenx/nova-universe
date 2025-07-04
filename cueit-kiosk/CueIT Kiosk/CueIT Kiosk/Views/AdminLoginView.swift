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
    @State private var errorText: String?
    @State private var loading = false
    @State private var showPolicy = false

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Admin Access")
                    .font(.title).bold()

                SecureField("Enter Password", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)

                if let msg = errorText {
                    Text(msg)
                        .foregroundColor(Theme.Colors.accent)
                        .font(.subheadline)
                }

                if loading {
                    ProgressView()
                }

                Button("Login") {
                    loading = true
                    errorText = nil
                    configService.verifyPassword(password) { ok, error in
                        loading = false
                        if ok {
                            dismiss()
                        } else if error != nil {
                            errorText = "Server unreachable"
                        } else {
                            errorText = "Incorrect password"
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
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Privacy") { showPolicy = true }
                }
            }
        }
        .sheet(isPresented: $showPolicy) {
            PrivacyPolicyView()
        }
    }
}
