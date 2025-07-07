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
    
    // Admin session management
    private static let adminSessionKey = "adminSessionExpiry"
    private static let sessionDuration: TimeInterval = 14400 // 4 hours
    
    private var isSessionValid: Bool {
        guard let expiry = UserDefaults.standard.object(forKey: Self.adminSessionKey) as? Date else {
            return false
        }
        return expiry > Date()
    }
    
    private func startAdminSession() {
        let expiry = Date().addingTimeInterval(Self.sessionDuration)
        UserDefaults.standard.set(expiry, forKey: Self.adminSessionKey)
    }
    
    private func endAdminSession() {
        UserDefaults.standard.removeObject(forKey: Self.adminSessionKey)
    }

    var body: some View {
        NavigationView {
            if isAuthenticated {
                AdminPanelView(onDismiss: { 
                    endAdminSession()
                    dismiss() 
                })
            } else {
                VStack(spacing: 20) {
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
                .navigationTitle("CueIT Portal")
                .onAppear {
                    // Check if we have a valid session on appear
                    if isSessionValid {
                        isAuthenticated = true
                    } else {
                        isFocused = true
                    }
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
                startAdminSession()
                isAuthenticated = true
                pin = "" // Clear PIN for security
            } else if let error = error {
                // More specific error messages based on error types
                let nsError = error as NSError
                switch nsError.code {
                case -1004: // Cannot connect to host
                    errorText = "Cannot reach server"
                case -1001: // Request timeout
                    errorText = "Connection timeout"
                case -1009: // Internet connection appears to be offline
                    errorText = "No internet connection"
                case (-1204)...(-1200): // SSL errors
                    errorText = "SSL connection error"
                default:
                    if nsError.domain == NSURLErrorDomain {
                        errorText = "Network error"
                    } else {
                        errorText = "Connection failed"
                    }
                }
            } else {
                errorText = "Invalid PIN"
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
        .navigationTitle("CueIT Portal")
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
