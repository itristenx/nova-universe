import SwiftUI

struct ServerConfigView: View {
    @StateObject private var kioskService = KioskService.shared
    @State private var serverURL = ""
    @State private var showingAdvanced = false
    @State private var serverProtocol = "https"
    @State private var host = "localhost"
    @State private var port = "3000"
    
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            
            Image(systemName: "server.rack")
                .font(.system(size: 64))
                .foregroundColor(Theme.Colors.accent)
            
            Text("Server Configuration")
                .font(.title)
                .fontWeight(.semibold)
            
            Text("Configure the CueIT server connection")
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.md)
            
            // Local network guidance
            if APIConfig.isLocalNetwork {
                VStack(spacing: 8) {
                    HStack(spacing: 6) {
                        Image(systemName: "wifi")
                            .foregroundColor(.green)
                            .font(.caption)
                        Text("Local Network Detected")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                    Text("You're using a local server address. Make sure this device is connected to the same network as your CueIT server.")
                        .font(.caption2)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                }
                .padding(8)
                .background(Color.green.opacity(0.1))
                .cornerRadius(8)
                .padding(.horizontal, Theme.Spacing.md)
            }
            
            VStack(spacing: 20) {
                if showingAdvanced {
                    HStack(spacing: 10) {
                        Picker("Protocol", selection: $serverProtocol) {
                            Text("https").tag("https")
                            Text("http").tag("http")
                        }
                        .pickerStyle(SegmentedPickerStyle())
                        .frame(width: 100)
                        
                        Text("://")
                            .foregroundColor(.gray)
                        
                        TextField("localhost", text: $host)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                        
                        Text(":")
                            .foregroundColor(.gray)
                        
                        TextField("3000", text: $port)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .frame(width: 80)
                            .keyboardType(.numberPad)
                    }
                } else {
                    TextField("Server URL", text: $serverURL)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .placeholder(when: serverURL.isEmpty) {
                            Text("https://localhost:3000").foregroundColor(.gray)
                        }
                        .autocapitalization(.none)
                        .keyboardType(.URL)
                }
                
                Button(showingAdvanced ? "Simple Mode" : "Advanced") {
                    showingAdvanced.toggle()
                    if showingAdvanced {
                        // Parse current URL into components
                        if let url = URL(string: serverURL.isEmpty ? "https://localhost:3000" : serverURL) {
                            serverProtocol = url.scheme ?? "https"
                            host = url.host ?? "localhost"
                            port = String(url.port ?? 3000)
                        }
                    } else {
                        // Construct URL from components
                        serverURL = "\(serverProtocol)://\(host):\(port)"
                    }
                }
                .foregroundColor(Theme.Colors.accent)
                .font(.caption)
            }
            .padding(.horizontal, Theme.Spacing.md)
            
            VStack(spacing: 15) {
                Button("Connect") {
                    let finalURL = showingAdvanced ? "\(serverProtocol)://\(host):\(port)" : serverURL
                    let urlToUse = finalURL.isEmpty ? "http://127.0.0.1:3000" : finalURL
                    kioskService.configureServer(urlToUse)
                }
                .padding(Theme.Spacing.sm)
                .frame(maxWidth: .infinity)
                .background(Theme.Colors.primary)
                .foregroundColor(Theme.Colors.base)
                .cornerRadius(8)
                
                // Common local network presets
                HStack(spacing: 10) {
                    Button("Localhost") {
                        kioskService.configureServer("http://127.0.0.1:3000")
                    }
                    .font(.caption)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.gray.opacity(0.2))
                    .foregroundColor(.primary)
                    .cornerRadius(6)
                    
                    Button("Reset to Default") {
                        APIConfig.resetToDefault()
                        serverURL = APIConfig.baseURL
                        kioskService.configureServer(APIConfig.baseURL)
                    }
                    .font(.caption)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.gray.opacity(0.2))
                    .foregroundColor(.primary)
                    .cornerRadius(6)
                }
            }
            .padding(.horizontal, Theme.Spacing.md)
            
            if !kioskService.statusMessage.isEmpty {
                Text(kioskService.statusMessage)
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            
            Spacer()
        }
        .padding(Theme.Spacing.md)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.Colors.base.ignoresSafeArea())
        .onAppear {
            serverURL = APIConfig.baseURL
        }
    }
}

extension View {
    func placeholder<Content: View>(
        when shouldShow: Bool,
        alignment: Alignment = .leading,
        @ViewBuilder placeholder: () -> Content) -> some View {

        ZStack(alignment: alignment) {
            placeholder().opacity(shouldShow ? 1 : 0)
            self
        }
    }
}
