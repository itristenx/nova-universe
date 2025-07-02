//
//  AdminLoginView.swift
//  CueIT Kiosk
//
//  Created by Tristen Neibarger on 7/2/25.
//

import SwiftUI

struct AdminLoginView: View {
    @Environment(\.dismiss) var dismiss
    @State private var password = ""
    @State private var showError = false

    let correctPassword = "admin"

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
                        .foregroundColor(.red)
                        .font(.subheadline)
                }

                Button("Login") {
                    if password == correctPassword {
                        dismiss()
                    } else {
                        showError = true
                    }
                }
                .padding()
            }
            .padding()
            .navigationTitle("Admin Login")
        }
    }
}
