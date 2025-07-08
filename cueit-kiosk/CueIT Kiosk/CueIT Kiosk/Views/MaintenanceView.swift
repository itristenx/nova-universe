import SwiftUI

struct MaintenanceView: View {
    let message: String
    let estimatedDuration: String?
    let contactInfo: String?
    
    @State private var animateIcon = false
    @State private var showContactInfo = false
    
    var body: some View {
        VStack(spacing: 40) {
            // Maintenance Icon
            Image(systemName: "wrench.and.screwdriver.fill")
                .font(.system(size: 80))
                .foregroundColor(.orange)
                .rotationEffect(.degrees(animateIcon ? 15 : -15))
                .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true), value: animateIcon)
                .onAppear {
                    animateIcon = true
                }
            
            VStack(spacing: 20) {
                Text("Maintenance Mode")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text(message)
                    .font(.title2)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(nil)
                    .padding(.horizontal)
                
                if let duration = estimatedDuration {
                    HStack {
                        Image(systemName: "clock")
                            .foregroundColor(.blue)
                        Text("Estimated duration: \(duration)")
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
                }
            }
            
            VStack(spacing: 16) {
                Text("We're working to improve your experience")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                
                Text("The kiosk will automatically resume when maintenance is complete")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .opacity(0.8)
            }
            .padding()
            .background(Color.gray.opacity(0.05))
            .cornerRadius(16)
            .frame(maxWidth: 400)
            
            if let contact = contactInfo {
                Button(action: {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        showContactInfo.toggle()
                    }
                }) {
                    HStack {
                        Image(systemName: "questionmark.circle")
                        Text("Need Help?")
                    }
                    .font(.headline)
                    .foregroundColor(.blue)
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
                }
                
                if showContactInfo {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Contact Information:")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.secondary)
                        
                        Text(contact)
                            .font(.body)
                            .foregroundColor(.primary)
                            .padding()
                            .background(Color.white)
                            .cornerRadius(8)
                            .shadow(radius: 2)
                    }
                    .frame(maxWidth: 350)
                    .transition(.opacity.combined(with: .move(edge: .top)))
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color(.systemBackground), Color.gray.opacity(0.05)]),
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }
}

// MARK: - Preview
struct MaintenanceView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            MaintenanceView(
                message: "System maintenance in progress",
                estimatedDuration: "30 minutes",
                contactInfo: "For assistance, contact IT Support at ext. 1234 or email support@company.com"
            )
            .previewDisplayName("With Duration & Contact")
            
            MaintenanceView(
                message: "Scheduled maintenance is currently underway",
                estimatedDuration: nil,
                contactInfo: nil
            )
            .previewDisplayName("Basic Maintenance")
        }
    }
}
