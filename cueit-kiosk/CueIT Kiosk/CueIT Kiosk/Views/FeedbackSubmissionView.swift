//
//  FeedbackSubmissionView.swift
//  CueIT Kiosk
//
//  Feedback submission interface
//

import SwiftUI

struct FeedbackSubmissionView: View {
    let onDismiss: () -> Void
    
    @State private var feedbackText = ""
    @State private var rating: Int = 5
    @State private var isSubmitting = false
    @State private var showSuccess = false
    @State private var submissionError: String?
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 32) {
                    // Header
                    VStack(spacing: 16) {
                        Image(systemName: "message.fill")
                            .font(.system(size: 48, weight: .light))
                            .foregroundColor(.blue)
                        
                        VStack(spacing: 8) {
                            Text("Share Your Feedback")
                                .font(.system(size: 28, weight: .light, design: .rounded))
                                .foregroundColor(.primary)
                            
                            Text("Help us improve your experience")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.top, 20)
                    
                    VStack(spacing: 24) {
                        // Rating section
                        ratingSection
                        
                        // Feedback text
                        feedbackSection
                        
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
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        onDismiss()
                    }
                }
            }
        }
        .alert("Feedback Submitted", isPresented: $showSuccess) {
            Button("Done") {
                onDismiss()
            }
        } message: {
            Text("Thank you for your feedback! We appreciate your input.")
        }
    }
    
    // MARK: - Rating Section
    private var ratingSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("How was your experience?")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.primary)
            
            HStack(spacing: 8) {
                ForEach(1...5, id: \.self) { star in
                    Button(action: { rating = star }) {
                        Image(systemName: star <= rating ? "star.fill" : "star")
                            .font(.system(size: 32, weight: .medium))
                            .foregroundColor(star <= rating ? .yellow : .gray)
                    }
                    .buttonStyle(.plain)
                }
                
                Spacer()
                
                Text(ratingDescription)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.secondary)
            }
        }
    }
    
    // MARK: - Feedback Section
    private var feedbackSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Additional Comments")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.primary)
            
            Text("Tell us more about your experience (optional)")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
            
            TextEditor(text: $feedbackText)
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
    
    // MARK: - Error Section
    private func errorSection(_ message: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.red)
            
            Text(message)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.red)
            
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
        Button(action: submitFeedback) {
            HStack {
                if isSubmitting {
                    ProgressView()
                        .scaleEffect(0.8)
                } else {
                    Image(systemName: "paperplane.fill")
                }
                Text(isSubmitting ? "Submitting..." : "Submit Feedback")
            }
            .font(.system(size: 18, weight: .semibold))
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSubmitting ? Color.gray : Color.blue)
            )
        }
        .disabled(isSubmitting)
        .buttonStyle(.plain)
    }
    
    // MARK: - Computed Properties
    private var ratingDescription: String {
        switch rating {
        case 1: return "Poor"
        case 2: return "Fair"
        case 3: return "Good"
        case 4: return "Very Good"
        case 5: return "Excellent"
        default: return ""
        }
    }
    
    // MARK: - Actions
    private func submitFeedback() {
        isSubmitting = true
        submissionError = nil
        
        Task {
            // Simulate API call
            try? await Task.sleep(for: .seconds(1))
            
            await MainActor.run {
                isSubmitting = false
                showSuccess = true
            }
        }
    }
}

#Preview {
    FeedbackSubmissionView {}
}
