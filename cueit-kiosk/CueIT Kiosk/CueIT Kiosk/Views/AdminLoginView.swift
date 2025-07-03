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
                    .font(Theme.titleFont)

                SecureField("Enter Password", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)
                    .font(Theme.bodyFont)

                if showError {
                    Text("Incorrect password")
                        .foregroundColor(.red)
                        .font(Theme.bodyFont)
                }

                Button("Login") {
                    if password == configService.config.adminPassword {
                        dismiss()
                    } else {
                        showError = true
                    }
                }
                .padding()
                .frame(maxWidth: .infinity)
                .font(Theme.buttonFont)
                .foregroundColor(.white)
                .background(configService.primaryColor)
                .cornerRadius(Theme.cornerRadius)
            }
            .padding()
            .navigationTitle("Admin Login")
        }
    }
}
