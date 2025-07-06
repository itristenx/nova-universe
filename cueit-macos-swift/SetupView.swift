import SwiftUI

struct SetupView: View {
    @ObservedObject var launcher: LauncherViewModel
    @State private var showingDone = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Setup Environments").font(.title)
            Text("Example environment files were copied on first launch. Edit them under each service directory then click Done.")
            Button("Done") { showingDone = true }
                .alert(isPresented: $showingDone) {
                    Alert(title: Text("Continue"), message: Text("Reloading UI"), dismissButton: .default(Text("OK")) {
                        launcher.showSetup = false
                    })
                }
        }
        .padding()
        .frame(width: 400)
    }
}

struct SetupView_Previews: PreviewProvider {
    static var previews: some View {
        SetupView(launcher: LauncherViewModel())
    }
}
