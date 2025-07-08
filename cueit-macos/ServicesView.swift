import SwiftUI

struct ServicesView: View {
    @EnvironmentObject var appModel: CueITAppModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Service Management")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            // Service Configuration
            VStack(alignment: .leading, spacing: 12) {
                Text("Services to Start")
                    .font(.headline)
                
                VStack(alignment: .leading, spacing: 8) {
                    Toggle("CueIT API Server", isOn: $appModel.startAPI)
                    Toggle("CueIT Admin UI", isOn: $appModel.startAdmin)
                    Toggle("CueIT Slack Bot", isOn: $appModel.startSlack)
                }
            }
            .padding()
            .background(Color(NSColor.controlBackgroundColor))
            .cornerRadius(8)
            
            // Service Status
            VStack(alignment: .leading, spacing: 12) {
                Text("Service Status")
                    .font(.headline)
                
                ForEach(appModel.services, id: \.name) { service in
                    HStack {
                        Circle()
                            .fill(service.isRunning ? Color.green : Color.red)
                            .frame(width: 12, height: 12)
                        
                        Text(service.name)
                            .font(.body)
                        
                        Spacer()
                        
                        Text("Port \(service.port)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        if service.isRunning {
                            Button("Open") {
                                if let url = URL(string: service.url) {
                                    NSWorkspace.shared.open(url)
                                }
                            }
                            .buttonStyle(.borderless)
                            .font(.caption)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            .padding()
            .background(Color(NSColor.controlBackgroundColor))
            .cornerRadius(8)
            
            // Control Buttons
            HStack(spacing: 12) {
                Button("Start Services") {
                    appModel.startServices()
                }
                .buttonStyle(.borderedProminent)
                
                Button("Stop Services") {
                    appModel.stopServices()
                }
                .buttonStyle(.bordered)
                
                Button("Clear Logs") {
                    appModel.clearLogs()
                }
                .buttonStyle(.bordered)
            }
            
            // Logs
            VStack(alignment: .leading, spacing: 8) {
                Text("Service Logs")
                    .font(.headline)
                
                ScrollView {
                    Text(appModel.logs.isEmpty ? "No logs yet..." : appModel.logs)
                        .font(.system(.caption, design: .monospaced))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(8)
                }
                .background(Color.black)
                .foregroundColor(.green)
                .cornerRadius(8)
                .frame(minHeight: 200)
            }
            
            Spacer()
        }
        .padding()
    }
}
