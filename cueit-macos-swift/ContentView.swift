import SwiftUI

struct ContentView: View {
    @ObservedObject var launcher: LauncherViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("CueIT Launcher").font(.title)
            Toggle("API", isOn: $launcher.startAPI)
            Toggle("Admin", isOn: $launcher.startAdmin)
            Toggle("Slack", isOn: $launcher.startSlack)
            HStack {
                Button("Start") { launcher.startServices() }
                Button("Open Admin") { launcher.openAdmin() }
            }
            TextEditor(text: $launcher.log)
                .frame(minHeight: 200)
        }
        .padding()
        .frame(width: 400)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(launcher: LauncherViewModel())
    }
}
