//
//  InitializationView.swift
//  CueIT Kiosk
//
//  Modern loading screen shown during app initialization
//

import SwiftUI

struct InitializationView: View {
    @State private var loadingText = "Initializing..."
    @State private var progress: Double = 0.0
    @State private var showLogo = false
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [
                    Color.blue.opacity(0.1),
                    Color.purple.opacity(0.1)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 40) {
                Spacer()
                
                // Logo with animation
                VStack(spacing: 24) {
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [Color.blue, Color.purple],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 120, height: 120)
                            .scaleEffect(showLogo ? 1.0 : 0.8)
                            .animation(.spring(response: 0.8, dampingFraction: 0.6), value: showLogo)
                        
                        Image(systemName: "desktopcomputer")
                            .font(.system(size: 48, weight: .light))
                            .foregroundColor(.white)
                            .scaleEffect(showLogo ? 1.0 : 0.5)
                            .animation(.spring(response: 1.0, dampingFraction: 0.7).delay(0.2), value: showLogo)
                    }
                    
                    VStack(spacing: 8) {
                        Text("CueIT Kiosk")
                            .font(.system(size: 32, weight: .light, design: .rounded))
                            .foregroundColor(.primary)
                        
                        Text("Conference Support System")
                            .font(.system(size: 16, weight: .medium, design: .rounded))
                            .foregroundColor(.secondary)
                    }
                    .opacity(showLogo ? 1.0 : 0.0)
                    .animation(.easeInOut(duration: 0.6).delay(0.4), value: showLogo)
                }
                
                Spacer()
                
                // Loading section
                VStack(spacing: 24) {
                    // Progress indicator
                    VStack(spacing: 16) {
                        ProgressView(value: progress, total: 1.0)
                            .progressViewStyle(.linear)
                            .tint(.blue)
                            .scaleEffect(y: 2)
                            .frame(maxWidth: 280)
                        
                        Text(loadingText)
                            .font(.system(size: 18, weight: .medium, design: .rounded))
                            .foregroundColor(.secondary)
                            .animation(.easeInOut(duration: 0.3), value: loadingText)
                    }
                    
                    // Animated dots
                    HStack(spacing: 8) {
                        ForEach(0..<3) { index in
                            Circle()
                                .fill(Color.blue)
                                .frame(width: 8, height: 8)
                                .scaleEffect(showLogo ? 1.0 : 0.5)
                                .animation(
                                    .easeInOut(duration: 0.6)
                                        .repeatForever(autoreverses: true)
                                        .delay(Double(index) * 0.2),
                                    value: showLogo
                                )
                        }
                    }
                }
                .padding(.bottom, 60)
            }
            .padding(.horizontal, 40)
        }
        .onAppear {
            startInitialization()
        }
    }
    
    private func startInitialization() {
        showLogo = true
        
        // Simulate initialization steps
        let steps = [
            (0.2, "Checking configuration..."),
            (0.4, "Connecting to server..."),
            (0.6, "Loading settings..."),
            (0.8, "Verifying activation..."),
            (1.0, "Ready!")
        ]
        
        for (index, (progressValue, text)) in steps.enumerated() {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(index) * 0.8) {
                withAnimation(.easeInOut(duration: 0.4)) {
                    progress = progressValue
                    loadingText = text
                }
            }
        }
    }
}

#Preview {
    InitializationView()
}
