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
    @StateObject private var kioskService = KioskService.shared
    @State private var showAlert = false
    @State private var alertMessage = ""

    var body: some View {
        ZStack {
            switch kioskService.state {
            case .inactive:
                PendingActivationView()
            case .error:
                ActivationErrorView { kioskService.checkActive() }
            default:
                if let bg = configService.config.backgroundUrl,
                   let url = URL(string: bg) {
                    AsyncImage(url: url) { img in
                        img.resizable().scaledToFill()
                    } placeholder: {
                        Theme.Colors.base
                    }
                    .ignoresSafeArea()
                } else {
                    Theme.Colors.base.ignoresSafeArea()
                }
                VStack {
                    AsyncImage(url: URL(string: configService.config.logoUrl)) { img in
                        img.resizable()
                    } placeholder: {
                        Image("logo").resizable()
                    }
                        .scaledToFit()
                        .frame(width: 120, height: 120)
                        .padding(.top, Theme.Spacing.lg)

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
        .onReceive(configService.$errorMessage) { msg in
            if let m = msg {
                alertMessage = m
                showAlert = true
            } else if showAlert && alertMessage == "Unable to load configuration" {
                showAlert = false
            }
        }
        .onReceive(kioskService.$activationError) { failed in
            if failed {
                alertMessage = "Unable to verify kiosk status"
                showAlert = true
            } else if showAlert && alertMessage == "Unable to verify kiosk status" {
                showAlert = false
            }
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
                            .padding(.top, Theme.Spacing.md)
                            .padding(.trailing, Theme.Spacing.md)
                    }
                    Spacer()
                }
            },
            alignment: .topTrailing
        )
        .alert(alertMessage, isPresented: $showAlert) {
            Button("OK", role: .cancel) {}
        }
    }
}
