//
//  EnhancedAdminLoginView.swift
//  Nova Beacon
//
//  Enhanced admin login with offline PIN support and configuration sync
//

import SwiftUI

struct EnhancedAdminLoginView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var configService: EnhancedConfigService
    @State private var pin = ""
    @State private var email = ""
    @State private var password = ""
    @State private var loginMode: LoginMode = .pin
    @State private var errorText: String?
    @State private var loading = false
    @State private var isAuthenticated = false
    @State private var offlineMode = false
    @FocusState private var isFocused: Bool
    
    enum LoginMode {
        case pin
        case emailPassword
    }
    
    private var isLoginFormValid: Bool {
        switch loginMode {
        case .pin:
            return pin.count == 6
        case .emailPassword:
            return !email.isEmpty && !password.isEmpty
        }
    }
    
    private var isOfflineCapable: Bool {
        return configService.getCachedAdminPins() != nil
    }

    var body: some View {
        NavigationView {
            if isAuthenticated {
                EnhancedAdminPanelView(
                    configService: configService,
                    onDismiss: {
                        configService.endAdminSession()
                        dismiss()
                    }
                )
            } else {
                VStack(spacing: 20) {
                    // Network status indicator
                    if offlineMode {
                        HStack {
                            Image(systemName: "wifi.slash")
                                .foregroundColor(.orange)
                            Text("Offline Mode - Using cached authentication")
                                .font(.caption)
                                .foregroundColor(.orange)
                        }
                        .padding(.horizontal)
                    }
                    
                    // Login mode selector
                    Picker("Login Mode", selection: $loginMode) {
                        Text("PIN").tag(LoginMode.pin)
                        Text("Email & Password").tag(LoginMode.emailPassword)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)
                    
                    if loginMode == .pin {
                        VStack(spacing: 15) {
                            Text("Enter 6-digit PIN")
                                .font(.headline)
                                .foregroundColor(.gray)
                            
                            // PIN input display
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
                            
                            // Hidden text field for PIN input
                            TextField("", text: $pin)
                                .keyboardType(.numberPad)
                                .textContentType(.oneTimeCode)
                                .opacity(0)
                                .focused($isFocused)
                                .onChange(of: pin) { _, newValue in
                                    pin = String(newValue.filter { $0.isNumber }.prefix(6))
                                    
                                    // Auto-login when 6 digits entered
                                    if pin.count == 6 {
                                        Task {
                                            await loginWithPIN()
                                        }
                                    }
                                }
                        }
                    } else {
                        VStack(spacing: 15) {
                            Text("Admin Login")
                                .font(.headline)
                                .foregroundColor(.gray)
                            
                            VStack(spacing: 12) {
                                TextField("Email", text: $email)
                                    .textFieldStyle(.roundedBorder)
                                    .keyboardType(.emailAddress)
                                    .autocapitalization(.none)
                                    .autocorrectionDisabled()
                                    .focused($isFocused)
                                
                                SecureField("Password", text: $password)
                                    .textFieldStyle(.roundedBorder)
                            }
                            .padding(.horizontal)
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

                    if loginMode == .emailPassword {
                        Button("Login") {
                            Task {
                                await loginWithEmailPassword()
                            }
                        }
                        .disabled(!isLoginFormValid || loading)
                        .padding(Theme.Spacing.sm)
                        .foregroundColor(.white)
                        .background(isLoginFormValid && !loading ? Theme.Colors.primary : Color.gray)
                        .cornerRadius(8)
                    }
                    
                    // Offline mode toggle (only show if cached PINs available)
                    if isOfflineCapable {
                        Toggle("Work Offline", isOn: $offlineMode)
                            .padding(.horizontal)
                    }

                    Spacer()

                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.gray)
                }
                .padding()
                .onAppear {
                    // Check if admin session is still valid
                    if configService.isAdminSessionValid {
                        isAuthenticated = true
                    }
                    isFocused = true
                }
            }
        }
    }
    
    private func loginWithPIN() async {
        await MainActor.run {
            loading = true
            errorText = nil
        }
        
        let validation = await configService.validateAdminPIN(pin)
        
        await MainActor.run {
            loading = false
            
            if let validation = validation, validation.valid {
                configService.startAdminSession(validation: validation)
                isAuthenticated = true
                
                // Show PIN type for user feedback
                if let pinType = validation.pinType {
                    let _ = pinType == "global" ? "Global admin access granted" : "Kiosk admin access granted"
                    // Could show toast here
                }
            } else {
                errorText = offlineMode ? "Invalid PIN (offline verification)" : "Invalid PIN or network error"
                pin = ""
            }
        }
    }
    
    private func loginWithEmailPassword() async {
        await MainActor.run {
            loading = true
            errorText = nil
        }
        
        // Email/password login would go through traditional auth flow
        // This is a placeholder - implement based on your existing auth system
        await MainActor.run {
            loading = false
            errorText = "Email/password login not implemented in this demo"
        }
    }
}

struct EnhancedAdminPanelView: View {
    @ObservedObject var configService: EnhancedConfigService
    let onDismiss: () -> Void
    @State private var selectedTab = 0
    @State private var showingLogout = false
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Status Management Tab
            StatusManagementView(configService: configService)
                .tabItem {
                    Image(systemName: "dot.radiowaves.left.and.right")
                    Text("Status")
                }
                .tag(0)
            
            // Schedule Management Tab (if permissions allow)
            if canEditSchedule {
                ScheduleManagementView(configService: configService)
                    .tabItem {
                        Image(systemName: "calendar")
                        Text("Schedule")
                    }
                    .tag(1)
            }
            
            // Branding Management Tab (if permissions allow)
            if canEditBranding {
                BrandingManagementView(configService: configService)
                    .tabItem {
                        Image(systemName: "paintbrush")
                        Text("Branding")
                    }
                    .tag(2)
            }
            
            // System Info Tab
            SystemInfoView(configService: configService)
                .tabItem {
                    Image(systemName: "info.circle")
                    Text("System")
                }
                .tag(3)
        }
        .navigationTitle("Kiosk Admin")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button("Logout") {
                    showingLogout = true
                }
            }
            
            ToolbarItem(placement: .navigationBarTrailing) {
                HStack {
                    // Sync status indicator
                    syncStatusIndicator
                    
                    // Session info
                    if let session = configService.adminSession {
                        Text(session.pinType == "global" ? "Global" : "Kiosk")
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(session.pinType == "global" ? Color.blue : Color.orange)
                            .foregroundColor(.white)
                            .cornerRadius(4)
                    }
                }
            }
        }
        .alert("Logout", isPresented: $showingLogout) {
            Button("Cancel", role: .cancel) { }
            Button("Logout", role: .destructive) {
                onDismiss()
            }
        } message: {
            Text("Are you sure you want to logout?")
        }
    }
    
    private var canEditSchedule: Bool {
        configService.adminSession?.permissions.contains("schedule.change") ?? false
    }
    
    private var canEditBranding: Bool {
        configService.adminSession?.permissions.contains("branding.change") ?? false
    }
    
    private var syncStatusIndicator: some View {
        Group {
            switch configService.syncStatus {
            case .synced:
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
            case .pending:
                Image(systemName: "clock.circle.fill")
                    .foregroundColor(.orange)
            case .conflict:
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(.red)
            case .offline:
                Image(systemName: "wifi.slash")
                    .foregroundColor(.gray)
            }
        }
    }
}

// MARK: - Individual Management Views

struct StatusManagementView: View {
    @ObservedObject var configService: EnhancedConfigService
    @State private var selectedStatus: String = "open"
    @State private var customMessage: String = ""
    
    var body: some View {
        Form {
            Section("Current Status") {
                Picker("Status", selection: $selectedStatus) {
                    Text("Open").tag("open")
                    Text("Closed").tag("closed")
                    Text("In a Meeting").tag("meeting")
                    Text("Be Right Back").tag("brb")
                    Text("Out to Lunch").tag("lunch")
                }
                .pickerStyle(.segmented)
                
                TextField("Custom Message (Optional)", text: $customMessage)
                    .textFieldStyle(.roundedBorder)
            }
            
            Section("Actions") {
                Button("Update Status") {
                    Task {
                        let updates = [
                            "currentStatus": selectedStatus,
                            "customMessage": customMessage
                        ]
                        await configService.updateLocalConfig(updates, source: "kiosk")
                    }
                }
                .disabled(selectedStatus == configService.localConfig?.currentStatus)
            }
            
            Section("Office Hours") {
                if let officeHours = configService.localConfig?.officeHours {
                    VStack(alignment: .leading) {
                        Text("Title: \(officeHours.title)")
                        Text("Status: \(officeHours.enabled ? "Enabled" : "Disabled")")
                        Text("Note: Office hours can only be modified via admin UI")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                } else {
                    Text("No office hours configured")
                        .foregroundColor(.gray)
                }
            }
        }
        .navigationTitle("Status Management")
        .onAppear {
            selectedStatus = configService.localConfig?.currentStatus ?? "open"
        }
    }
}

struct ScheduleManagementView: View {
    @ObservedObject var configService: EnhancedConfigService
    @State private var scheduleEnabled: Bool = false
    
    var body: some View {
        Form {
            Section("Automatic Schedule") {
                Toggle("Enable Automatic Schedule", isOn: $scheduleEnabled)
                
                if scheduleEnabled {
                    Text("Schedule configuration is available in the full admin UI")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            
            Section("Actions") {
                Button("Update Schedule") {
                    Task {
                        let updates = ["scheduleEnabled": scheduleEnabled]
                        await configService.updateLocalConfig(updates, source: "kiosk")
                    }
                }
            }
        }
        .navigationTitle("Schedule Management")
        .onAppear {
            scheduleEnabled = configService.localConfig?.schedule?.enabled ?? false
        }
    }
}

struct BrandingManagementView: View {
    @ObservedObject var configService: EnhancedConfigService
    @State private var logoUrl: String = ""
    @State private var welcomeMessage: String = ""
    @State private var helpMessage: String = ""
    @State private var primaryColor: String = "#1D4ED8"
    @State private var secondaryColor: String = "#9333EA"
    
    var body: some View {
        Form {
            Section("Logo") {
                TextField("Logo URL", text: $logoUrl)
                    .textFieldStyle(.roundedBorder)
                
                if !logoUrl.isEmpty {
                    AsyncImage(url: URL(string: logoUrl)) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                    } placeholder: {
                        ProgressView()
                    }
                    .frame(height: 60)
                }
            }
            
            Section("Messages") {
                TextField("Welcome Message", text: $welcomeMessage)
                    .textFieldStyle(.roundedBorder)

                TextField("Help Message", text: $helpMessage)
                    .textFieldStyle(.roundedBorder)
            }

            Section("Colors") {
                TextField("Primary Color", text: $primaryColor)
                    .textFieldStyle(.roundedBorder)
                TextField("Secondary Color", text: $secondaryColor)
                    .textFieldStyle(.roundedBorder)
            }
            
            Section("Actions") {
                Button("Update Branding") {
                    Task {
                        let updates = [
                            "logoUrl": logoUrl,
                            "welcomeMessage": welcomeMessage,
                            "helpMessage": helpMessage,
                            "primaryColor": primaryColor,
                            "secondaryColor": secondaryColor
                        ]
                        await configService.updateLocalConfig(updates, source: "kiosk")
                    }
                }
            }
        }
        .navigationTitle("Branding")
        .onAppear {
            logoUrl = configService.localConfig?.logoUrl ?? ""
            welcomeMessage = configService.localConfig?.welcomeMessage ?? ""
            helpMessage = configService.localConfig?.helpMessage ?? ""
            primaryColor = configService.localConfig?.theme.primaryColor ?? "#1D4ED8"
            secondaryColor = configService.localConfig?.theme.secondaryColor ?? "#9333EA"
        }
    }
}

struct SystemInfoView: View {
    @ObservedObject var configService: EnhancedConfigService
    
    var body: some View {
        Form {
            Section("Sync Status") {
                HStack {
                    Text("Status")
                    Spacer()
                    Text(syncStatusText)
                        .foregroundColor(syncStatusColor)
                }
                
                if let lastUpdate = configService.remoteConfig?.lastUpdate {
                    HStack {
                        Text("Last Sync")
                        Spacer()
                        Text(formatDate(lastUpdate))
                            .foregroundColor(.gray)
                    }
                }
            }
            
            Section("Admin Session") {
                if let session = configService.adminSession {
                    HStack {
                        Text("PIN Type")
                        Spacer()
                        Text(session.pinType.capitalized)
                    }
                    
                    HStack {
                        Text("Permissions")
                        Spacer()
                        Text("\(session.permissions.count)")
                    }
                    
                    HStack {
                        Text("Expires")
                        Spacer()
                        Text(formatDate(ISO8601DateFormatter().string(from: session.expiresAt)))
                            .foregroundColor(.gray)
                    }
                }
            }
        }
        .navigationTitle("System Info")
    }
    
    private var syncStatusText: String {
        switch configService.syncStatus {
        case .synced: return "Synced"
        case .pending: return "Pending"
        case .conflict: return "Conflict"
        case .offline: return "Offline"
        }
    }
    
    private var syncStatusColor: Color {
        switch configService.syncStatus {
        case .synced: return .green
        case .pending: return .orange
        case .conflict: return .red
        case .offline: return .gray
        }
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return dateString }
        
        let displayFormatter = DateFormatter()
        displayFormatter.dateStyle = .short
        displayFormatter.timeStyle = .short
        return displayFormatter.string(from: date)
    }
}

// MARK: - Supporting Views
struct PinDigitView: View {
    let digit: String
    let isFilled: Bool
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .stroke(isFilled ? Color.blue : Color.gray.opacity(0.5), lineWidth: 2)
                .frame(width: 40, height: 50)
            
            Text(digit)
                .font(.system(size: 24, weight: .semibold))
                .foregroundColor(isFilled ? Color.blue : Color.gray.opacity(0.5))
        }
        .animation(.easeInOut(duration: 0.2), value: isFilled)
    }
}
