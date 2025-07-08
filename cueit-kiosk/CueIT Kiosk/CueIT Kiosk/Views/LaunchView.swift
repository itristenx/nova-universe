//
//  LaunchView.swift
//  CueIT Kiosk
//
//  Created by Tristen Neibarger on 7/2/25.
//

import SwiftUI

struct LaunchView: View {
    @State private var showForm = false
    @State private var showAdmin = false
    @State private var showFeedback = false
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack {
                Text("CueIT Kiosk")
                    .font(.largeTitle)
                    .foregroundColor(.white)
                
                Text("Tap to submit a ticket")
                    .font(.title2)
                    .foregroundColor(.gray)
                    .padding(.top, 20)
            }
        }
        .onTapGesture {
            showForm = true
        }
        .fullScreenCover(isPresented: $showForm) {
            Text("Ticket Form Placeholder")
        }
    }
}

#Preview {
    LaunchView()
}
