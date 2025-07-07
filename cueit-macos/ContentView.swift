import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appModel: CueITAppModel
    
    var body: some View {
        if appModel.showSetup {
            SetupView()
                .environmentObject(appModel)
        } else {
            NavigationView {
                SidebarView()
                    .environmentObject(appModel)
                    .frame(minWidth: 250)
                
                MainContentView()
                    .environmentObject(appModel)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .navigationTitle("CueIT Portal")
        }
    }
}

struct SidebarView: View {
    @EnvironmentObject var appModel: CueITAppModel
    
    var body: some View {
        List(NavigationItem.allCases, id: \.self, selection: $appModel.selectedNavigation) { item in
            Label(item.rawValue, systemImage: item.icon)
                .tag(item)
        }
        .listStyle(SidebarListStyle())
        .navigationTitle("CueIT Portal")
    }
}

struct MainContentView: View {
    @EnvironmentObject var appModel: CueITAppModel
    
    var body: some View {
        Group {
            switch appModel.selectedNavigation {
            case .dashboard:
                DashboardView()
            case .tickets:
                TicketsView()
            case .kiosks:
                KiosksView()
            case .kioskManagement:
                KioskManagementView()
            case .users:
                UsersView()
            case .analytics:
                AnalyticsView()
            case .notifications:
                NotificationsView()
            case .integrations:
                IntegrationsView()
            case .settings:
                SettingsView()
            case .services:
                ServicesView()
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(NSColor.controlBackgroundColor))
    }
}

struct DashboardView: View {
    @EnvironmentObject var appModel: CueITAppModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Dashboard")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 16) {
                ServiceStatusCard(title: "API Server", 
                                status: appModel.services.first(where: { $0.name == "CueIT API" })?.isRunning ?? false,
                                url: "http://localhost:3000")
                
                ServiceStatusCard(title: "Admin UI", 
                                status: appModel.services.first(where: { $0.name == "CueIT Admin" })?.isRunning ?? false,
                                url: "http://localhost:5175")
                
                ServiceStatusCard(title: "Slack Bot", 
                                status: appModel.services.first(where: { $0.name == "CueIT Slack" })?.isRunning ?? false,
                                url: "http://localhost:3001")
            }
            
            VStack(alignment: .leading, spacing: 12) {
                Text("Quick Actions")
                    .font(.headline)
                
                HStack(spacing: 12) {
                    Button("Start Services") {
                        appModel.startServices()
                    }
                    .buttonStyle(.borderedProminent)
                    
                    Button("Stop Services") {
                        appModel.stopServices()
                    }
                    .buttonStyle(.bordered)
                    
                    Button("Open Admin UI") {
                        appModel.openAdminUI()
                    }
                    .buttonStyle(.bordered)
                }
            }
            
            Spacer()
        }
        .padding()
    }
}

struct ServiceStatusCard: View {
    let title: String
    let status: Bool
    let url: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(title)
                    .font(.headline)
                Spacer()
                Circle()
                    .fill(status ? Color.green : Color.red)
                    .frame(width: 12, height: 12)
            }
            
            Text(status ? "Running" : "Stopped")
                .font(.caption)
                .foregroundColor(.secondary)
            
            if status {
                Button("Open") {
                    if let url = URL(string: url) {
                        NSWorkspace.shared.open(url)
                    }
                }
                .buttonStyle(.borderless)
                .font(.caption)
            }
        }
        .padding()
        .background(Color(NSColor.controlBackgroundColor))
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
        )
    }
}

// Placeholder views for other sections
struct TicketsView: View {
    var body: some View {
        VStack {
            Text("Tickets Management")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("View and manage support tickets from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/tickets") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct KiosksView: View {
    var body: some View {
        VStack {
            Text("Kiosk Management")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Monitor and manage your deployed kiosks from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/kiosks") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct KioskManagementView: View {
    var body: some View {
        VStack {
            Text("Kiosk Activation")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Generate QR codes and manage kiosk activations from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/kiosk-activation") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct UsersView: View {
    var body: some View {
        VStack {
            Text("User Management")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Manage users and permissions from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/users") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct AnalyticsView: View {
    var body: some View {
        VStack {
            Text("Analytics")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("View analytics and reports from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/analytics") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct NotificationsView: View {
    var body: some View {
        VStack {
            Text("Notifications")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Manage notifications from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/notifications") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct IntegrationsView: View {
    var body: some View {
        VStack {
            Text("Integrations")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Configure integrations from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/integrations") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct SettingsView: View {
    var body: some View {
        VStack {
            Text("Settings")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("Configure system settings from the web interface")
                .foregroundColor(.secondary)
            
            Button("Open Web Interface") {
                if let url = URL(string: "http://localhost:5175/settings") {
                    NSWorkspace.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(CueITAppModel())
    }
}
