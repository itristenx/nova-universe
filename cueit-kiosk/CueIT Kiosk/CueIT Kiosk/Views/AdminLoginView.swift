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
    @State private var pin = ""
    @State private var errorText: String?
    @State private var loading = false
    @State private var showPolicy = false
    @State private var isAuthenticated = false
    @State private var showServerConfig = false
    @FocusState private var isFocused: Bool

    var body: some View {
        NavigationView {
            if isAuthenticated {
                AdminPanelView(onDismiss: { dismiss() })
            } else {
                VStack(spacing: 20) {
                    Text("Admin Access")
                        .font(.title).bold()

                    VStack(spacing: 15) {
                        Text("Enter 6-digit PIN")
                            .font(.headline)
                            .foregroundColor(.gray)
                        
                        HStack(spacing: 10) {
                            ForEach(0..<6, id: \.self) { index in
                            PinDigitView(
                                digit: pin.count > index ? String(pin[pin.index(pin.startIndex, offsetBy: index)]) : "",
                                isFilled: pin.count > index
                            )
                        }
                    }
                    .padding(.horizontal)
                    .onTapGesture {
                        isFocused = true
                    }
                    
                    // Hidden text field for PIN input - make it focusable
                    TextField("", text: $pin)
                        .keyboardType(.numberPad)
                        .textContentType(.oneTimeCode)
                        .opacity(0)
                        .focused($isFocused)
                        .onChange(of: pin) { _, newValue in
                            // Limit to 6 digits
                            pin = String(newValue.filter { $0.isNumber }.prefix(6))
                        }
                }

                if let msg = errorText {
                    Text(msg)
                        .foregroundColor(Theme.Colors.accent)
                        .font(.subheadline)
                }

                if loading {
                    ProgressView()
                }

                Button("Login") {
                    login()
                }
                .padding(Theme.Spacing.sm)
                .background(pin.count == 6 ? Theme.Colors.primary : Color.gray)
                .foregroundColor(Theme.Colors.base)
                .cornerRadius(8)
                .disabled(pin.count != 6 || loading)
                }
                .padding(Theme.Spacing.md)
                .navigationTitle("Admin Login")
                .onAppear {
                    isFocused = true
                }
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Privacy") { showPolicy = true }
                    }
                }
                .sheet(isPresented: $showPolicy) {
                    PrivacyPolicyView()
                }
            }
        }
        .sheet(isPresented: $showServerConfig) {
            ServerConfigView()
        }
    }
    
    private func login() {
        loading = true
        errorText = nil
        configService.verifyPin(pin) { ok, error in
            loading = false
            if ok {
                isAuthenticated = true
                pin = "" // Clear PIN for security
            } else if error != nil {
                errorText = "Server unreachable"
            } else {
                errorText = "Incorrect PIN"
            }
        }
    }
}

struct AdminPanelView: View {
    let onDismiss: () -> Void
    @State private var showServerConfig = false
    @StateObject private var kioskService = KioskService.shared
    
    var body: some View {
        List {
            Section("Server Configuration") {
                HStack {
                    VStack(alignment: .leading) {
                        Text("Current Server")
                        Text(APIConfig.baseURL)
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    Spacer()
                    Button("Change") {
                        showServerConfig = true
                    }
                    .foregroundColor(.blue)
                }
            }
            
            Section("Kiosk Status") {
                HStack {
                    Text("State")
                    Spacer()
                    Text(kioskService.state.description)
                        .foregroundColor(.gray)
                }
                
                if !kioskService.statusMessage.isEmpty {
                    HStack {
                        Text("Status")
                        Spacer()
                        Text(kioskService.statusMessage)
                            .foregroundColor(.gray)
                    }
                }
                
                HStack {
                    Text("Kiosk ID")
                    Spacer()
                    Text(kioskService.id)
                        .font(.caption)
                        .foregroundColor(.gray)
                        .onTapGesture {
                            UIPasteboard.general.string = kioskService.id
                        }
                }
            }
            
            Section("Actions") {
                Button("Refresh Status") {
                    Task { await kioskService.checkActive() }
                }
                
                Button("Reset Configuration") {
                    APIConfig.resetToDefault()
                    Task {
                        await kioskService.checkActive()
                    }
                }
                .foregroundColor(.red)
            }
        }
        .navigationTitle("Admin Panel")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Done") { onDismiss() }
            }
        }
        .sheet(isPresented: $showServerConfig) {
            ServerConfigView()
        }
    }
}

struct PinDigitView: View {
    let digit: String
    let isFilled: Bool
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .stroke(isFilled ? Theme.Colors.primary : Color.gray, lineWidth: 2)
                .frame(width: 50, height: 60)
            
            Text(digit)
                .font(.title)
                .fontWeight(.medium)
                .foregroundColor(isFilled ? Theme.Colors.primary : .gray)
        }
    }
}
