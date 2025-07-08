//
//  TicketSubmissionView.swift
//  CueIT Kiosk
//
//  Modern ticket submission interface
//

import SwiftUI

struct TicketSubmissionView: View {
    let category: ServiceCategory
    let onDismiss: () -> Void
    
    @StateObject private var configManager = ConfigurationManager.shared
    @State private var description = ""
    @State private var selectedSubcategory: String?
    @State private var priority: TicketPriority = .medium
    @State private var userInfo = UserInformation()
    @State private var isSubmitting = false
    @State private var showSuccess = false
    @State private var submissionError: String?
    @Environment(\.dismiss) private var dismiss
    
    private let subcategories: [String] = [
        "Hardware Issues",
        "Software Problems",
        "Network Connectivity",
        "Account Access",
        "General Support"
    ]
    
    var body: some View {
        NavigationView {
            GeometryReader { geometry in
                ScrollView {
                    VStack(spacing: 32) {
                        // Header
                        headerSection
                        
                        // Form content
                        VStack(spacing: 24) {
                            // Category display
                            categorySection
                            
                            // Subcategory selection
                            subcategorySection
                            
                            // Description
                            descriptionSection
                            
                            // Priority selection
                            prioritySection
                            
                            // User information (optional)
                            userInfoSection
                            
                            // Error display
                            if let error = submissionError {
                                errorSection(error)
                            }
                            
                            // Submit button
                            submitSection
                        }
                        .padding(.horizontal, 24)
                        
                        Spacer(minLength: 40)
                    }
                }
                .background(
                    LinearGradient(
                        colors: [
                            Color(.systemBackground),
                            Color(.systemGray6)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .ignoresSafeArea()
                )
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        onDismiss()
                    }
                }
            }
        }
        .alert("Ticket Submitted", isPresented: $showSuccess) {
            Button("Done") {
                onDismiss()
            }
        } message: {
            Text("Your support request has been submitted successfully. You will receive assistance shortly.")
        }
    }
    
    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(category.color.opacity(0.2))
                    .frame(width: 80, height: 80)
                
                Image(systemName: category.icon)
                    .font(.system(size: 32, weight: .medium))
                    .foregroundColor(category.color)
            }
            
            VStack(spacing: 8) {
                Text("Submit Support Request")
                    .font(.system(size: 28, weight: .light, design: .rounded))
                    .foregroundColor(.primary)
                
                Text("We'll help you resolve your \(category.title.lowercased()) issue")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.top, 20)
    }
    
    // MARK: - Category Section
    private var categorySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Category")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.primary)
            
            HStack(spacing: 12) {
                Image(systemName: category.icon)
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(category.color)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(category.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.primary)
                    
                    Text(category.description)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(category.color.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(category.color.opacity(0.3), lineWidth: 1)
                    )
            )
        }
    }
    
    // MARK: - Subcategory Section
    private var subcategorySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Specific Issue Type")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.primary)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 2), spacing: 12) {
                ForEach(subcategories, id: \.self) { subcategory in
                    Button(action: { selectedSubcategory = subcategory }) {
                        Text(subcategory)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(selectedSubcategory == subcategory ? .white : .primary)
                            .padding(.vertical, 12)
                            .padding(.horizontal, 8)
                            .frame(maxWidth: .infinity)
                            .background(
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(selectedSubcategory == subcategory ? category.color : Color(.systemGray6))
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
    
    // MARK: - Description Section
    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Description")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.primary)
            
            Text("Please describe the issue you're experiencing in detail")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
            
            TextEditor(text: $description)
                .font(.system(size: 16, weight: .medium))
                .padding(12)
                .frame(minHeight: 120)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(.systemBackground))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color(.systemGray4), lineWidth: 1)
                        )
                )
        }
    }
    
    // MARK: - Priority Section
    private var prioritySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Priority Level")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.primary)
            
            HStack(spacing: 12) {
                ForEach(TicketPriority.allCases, id: \.self) { ticketPriority in
                    Button(action: { priority = ticketPriority }) {
                        HStack(spacing: 8) {
                            Circle()
                                .fill(ticketPriority.color)
                                .frame(width: 8, height: 8)
                            
                            Text(ticketPriority.displayName)
                                .font(.system(size: 14, weight: .medium))
                        }
                        .foregroundColor(priority == ticketPriority ? .white : .primary)
                        .padding(.vertical, 8)
                        .padding(.horizontal, 12)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(priority == ticketPriority ? ticketPriority.color : Color(.systemGray6))
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
    
    // MARK: - User Info Section
    private var userInfoSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Contact Information (Optional)")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.primary)
            
            Text("Provide your contact details if you'd like us to follow up with you")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
            
            VStack(spacing: 12) {
                TextField("Your name", text: $userInfo.name)
                    .textFieldStyle(.roundedBorder)
                    .font(.system(size: 16, weight: .medium))
                
                TextField("Email address", text: $userInfo.email)
                    .textFieldStyle(.roundedBorder)
                    .font(.system(size: 16, weight: .medium))
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                
                TextField("Department (optional)", text: $userInfo.department)
                    .textFieldStyle(.roundedBorder)
                    .font(.system(size: 16, weight: .medium))
            }
        }
    }
    
    // MARK: - Error Section
    private func errorSection(_ message: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.red)
            
            Text(message)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.red)
                .multilineTextAlignment(.leading)
            
            Spacer()
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.red.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.red.opacity(0.3), lineWidth: 1)
                )
        )
    }
    
    // MARK: - Submit Section
    private var submitSection: some View {
        VStack(spacing: 16) {
            Button(action: submitTicket) {
                HStack {
                    if isSubmitting {
                        ProgressView()
                            .scaleEffect(0.8)
                    } else {
                        Image(systemName: "paperplane.fill")
                    }
                    Text(isSubmitting ? "Submitting..." : "Submit Support Request")
                }
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(canSubmit ? category.color : Color.gray)
                )
            }
            .disabled(!canSubmit || isSubmitting)
            .buttonStyle(.plain)
            
            Text("By submitting this request, you agree that the information will be used to provide technical support")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
    }
    
    // MARK: - Computed Properties
    private var canSubmit: Bool {
        !description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    // MARK: - Actions
    private func submitTicket() {
        guard canSubmit else { return }
        
        isSubmitting = true
        submissionError = nil
        
        let ticket = TicketSubmission(
            kioskId: configManager.getKioskId(),
            category: category.title,
            subcategory: selectedSubcategory,
            description: description.trimmingCharacters(in: .whitespacesAndNewlines),
            priority: priority.rawValue,
            userInfo: userInfo.isEmpty ? nil : TicketSubmission.UserInfo(
                name: userInfo.name.isEmpty ? nil : userInfo.name,
                email: userInfo.email.isEmpty ? nil : userInfo.email,
                department: userInfo.department.isEmpty ? nil : userInfo.department
            )
        )
        
        Task {
            let success = await submitTicket(ticket)
            
            await MainActor.run {
                isSubmitting = false
                
                if success {
                    showSuccess = true
                } else {
                    submissionError = "Failed to submit ticket. Please try again or contact support directly."
                }
            }
        }
    }
    
    private func submitTicket(_ ticket: TicketSubmission) async -> Bool {
        guard let serverConfig = configManager.serverConfiguration else { return false }
        
        return await APIService.shared.submitTicket(ticket, serverURL: serverConfig.baseURL)
    }
}

// MARK: - Supporting Types
enum TicketPriority: String, CaseIterable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    case urgent = "urgent"
    
    var displayName: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        case .urgent: return "Urgent"
        }
    }
    
    var color: Color {
        switch self {
        case .low: return .green
        case .medium: return .blue
        case .high: return .orange
        case .urgent: return .red
        }
    }
}

struct UserInformation {
    var name = ""
    var email = ""
    var department = ""
    
    var isEmpty: Bool {
        name.isEmpty && email.isEmpty && department.isEmpty
    }
}

#Preview {
    TicketSubmissionView(category: ServiceCategory.technology) {}
}
