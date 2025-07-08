//
//  LoadingView.swift
//  CueIT Kiosk
//
//  Loading screen shown while checking kiosk activation status
//

import SwiftUI

struct LoadingView: View {
    @StateObject private var kioskService = KioskService.shared
    
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            
            // Animated loading indicator
            VStack(spacing: 20) {
                ProgressView()
                    .scaleEffect(2.0)
                    .progressViewStyle(CircularProgressViewStyle(tint: Theme.Colors.primary))
                
                Text("CueIT Kiosk")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(Theme.Colors.primary)
                
                Text("Initializing...")
                    .font(.headline)
                    .foregroundColor(.secondary)
                
                if !kioskService.statusMessage.isEmpty {
                    Text(kioskService.statusMessage)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, Theme.Spacing.md)
                }
            }
            
            Spacer()
            
            // Kiosk ID for troubleshooting
            Text("Kiosk ID: \(kioskService.id)")
                .font(.caption)
                .foregroundColor(.gray)
                .padding(.bottom, Theme.Spacing.sm)
        }
        .padding(Theme.Spacing.md)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.Colors.base.ignoresSafeArea())
    }
}

#Preview {
    LoadingView()
}
