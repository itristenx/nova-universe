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

    var body: some View {
        ZStack {
            VStack {
                Image("logo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 120, height: 120)
                    .padding(.top, 60)

                Spacer()

                Image(systemName: "photo") // Placeholder logo
                    .resizable()
                    .scaledToFit()
                    .frame(width: 100, height: 50)
                    .padding(.bottom, 30)
            }

            VStack(spacing: 10) {
                Text("Welcome to the Help Desk")
                    .font(.largeTitle).bold()
                Text("Need to report an issue?")
                    .font(.title2)
                    .foregroundColor(.gray)
                Text("Tap anywhere to begin")
                    .foregroundColor(.gray)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.white)
        .onTapGesture {
            showForm = true
        }
        .fullScreenCover(isPresented: $showForm) {
            TicketFormView()
        }
        .sheet(isPresented: $showAdmin) {
            AdminLoginView()
        }
        .overlay(
            HStack {
                Spacer()
                VStack {
                    Button(action: {
                        showAdmin = true
                    }) {
                        Image(systemName: "gearshape.fill")
                            .font(.title2)
                            .foregroundColor(.black)
                            .padding(.top, 20)
                            .padding(.trailing, 20)
                    }
                    Spacer()
                }
            },
            alignment: .topTrailing
        )
    }
}
