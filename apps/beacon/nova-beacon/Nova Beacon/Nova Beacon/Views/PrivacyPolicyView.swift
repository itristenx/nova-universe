import SwiftUI

struct PrivacyPolicyView: View {
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    Text("CueIT collects the following information when a ticket is submitted:")
                    Text("\u{2022} Name")
                    Text("\u{2022} Email address")
                    Text("\u{2022} Job title")
                    Text("\u{2022} Manager")
                    Text("\u{2022} System affected")
                    Text("\u{2022} Urgency level")
                    Text("\nThis data is sent to the CueIT backend to create and track help desk requests. Nothing is stored on the kiosk. Ticket details are kept for 30 days then removed from the database.")
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .font(.body)
            }
            .navigationTitle("Privacy Policy")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

struct PrivacyPolicyView_Previews: PreviewProvider {
    static var previews: some View {
        PrivacyPolicyView()
    }
}
