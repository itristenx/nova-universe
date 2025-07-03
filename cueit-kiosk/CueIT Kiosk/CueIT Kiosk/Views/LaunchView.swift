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
    @StateObject private var configService = ConfigService()

    var body: some View {
        ZStack {
            Color.white.edgesIgnoringSafeArea(.all)
            VStack {
                AsyncImage(url: URL(string: configService.config.logoUrl)) { img in
                    img.resizable()
                } placeholder: {
                    Image("logo").resizable()
                }
                    .scaledToFit()
                    .frame(width: 120, height: 120)
                    .padding(.top, 60)

                Spacer()
            }

            VStack(spacing: 10) {
                Text(configService.config.welcomeMessage)
                    .font(.largeTitle).bold()
                Text(configService.config.helpMessage)
                    .font(.title2)
                    .foregroundColor(.gray)
                Text("Tap anywhere to begin")
                    .foregroundColor(.gray)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .onTapGesture {
            showForm = true
        }
        .fullScreenCover(isPresented: $showForm) {
            TicketFormView()
        }
        .sheet(isPresented: $showAdmin) {
            AdminLoginView(configService: configService)
        }
        .onAppear {
            configService.load()
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
