import SwiftUI

struct SetupView: View {
    @EnvironmentObject var appModel: CueITAppModel
    @State private var showingDone = false

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Welcome to CueIT Portal")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Initial Setup Required")
                    .font(.title2)
                    .foregroundColor(.secondary)
            }
            
            VStack(alignment: .leading, spacing: 12) {
                Text("Environment Configuration")
                    .font(.headline)
                
                Text("Environment files have been created for each service. You may need to configure them before starting:")
                    .foregroundColor(.secondary)
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("• cueit-api/.env - API server configuration")
                    Text("• cueit-admin/.env - Admin UI configuration")
                    Text("• cueit-slack/.env - Slack bot configuration")
                }
                .font(.system(.body, design: .monospaced))
                .padding()
                .background(Color(NSColor.controlBackgroundColor))
                .cornerRadius(8)
            }
            
            VStack(alignment: .leading, spacing: 12) {
                Text("Default Configuration")
                    .font(.headline)
                
                Text("The services are pre-configured with default settings that should work for local development. You can start using CueIT immediately and configure integrations later through the web interface.")
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            HStack {
                Spacer()
                
                Button("Continue to CueIT Portal") {
                    showingDone = true
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
            }
        }
        .padding(40)
        .frame(width: 600, height: 500)
        .alert("Setup Complete", isPresented: $showingDone) {
            Button("OK") {
                appModel.completeSetup()
            }
        } message: {
            Text("CueIT Portal is ready to use. You can now start the services and access the web interface.")
        }
    }
}

struct SetupView_Previews: PreviewProvider {
    static var previews: some View {
        SetupView()
            .environmentObject(CueITAppModel())
    }
}
