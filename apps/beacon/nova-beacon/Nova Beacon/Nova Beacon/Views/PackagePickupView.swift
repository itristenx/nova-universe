import SwiftUI

struct PackagePickupView: View {
    @State private var tracking = ""
    @State private var recipientId = ""
    @State private var status = ""
    @State private var showSuccess = false

    var body: some View {
        VStack(spacing: 20) {
            TextField("Tracking Number", text: $tracking)
                .textFieldStyle(.roundedBorder)
            TextField("Recipient ID", text: $recipientId)
                .textFieldStyle(.roundedBorder)
            Button("Create Package") {
                Task {
                    let serverURL = ConfigurationManager.shared.serverConfiguration?.baseURL ?? ""
                    if await APIService.shared.createPackage(tracking: tracking, recipientId: recipientId, serverURL: serverURL) {
                        showSuccess = true
                    }
                }
            }
            if showSuccess {
                Text("Package recorded!")
                    .foregroundColor(.green)
            }
        }
        .padding()
    }
}

struct PackagePickupView_Previews: PreviewProvider {
    static var previews: some View {
        PackagePickupView()
    }
}
