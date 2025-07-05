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
    @StateObject private var configService = ConfigService()
    @StateObject private var kioskService = KioskService.shared
    @StateObject private var notificationService = NotificationService.shared
    @State private var showAlert = false
    @State private var alertMessage = ""

    var body: some View {
        ZStack {
            switch kioskService.state {
            case .inactive:
                PendingActivationView()
            case .error:
                ActivationErrorView { Task { await kioskService.checkActive() } }
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
        .sheet(isPresented: $showFeedback) {
            FeedbackFormView()
        }
        .onAppear {
            Task { await configService.load() }
            TicketQueue.shared.retry()
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
                    .accessibilityLabel("Settings")
                    Spacer()
                }
            },
            alignment: .topTrailing
        )
        .overlay(
            HStack {
                VStack {
                    Spacer()
                    Button(action: { showFeedback = true }) {
                        Image(systemName: "ellipsis.bubble")
                            .font(.title2)
                            .foregroundColor(.black)
                            .padding(.leading, Theme.Spacing.md)
                            .padding(.bottom, Theme.Spacing.md)
                    }
                    .accessibilityLabel("Feedback")
                }
                Spacer()
            },
            alignment: .bottomLeading
        )
        .overlay(
            Group {
                if let note = notificationService.latest {
                    Text(note.message)
                        .padding(8)
                        .frame(maxWidth: .infinity)
                        .background(color(for: note.level))
                        .foregroundColor(.black)
                }
            },
            alignment: .top
        )
        .alert(alertMessage, isPresented: $showAlert) {
            Button("OK", role: .cancel) {}
        }
    }
}

func color(for level: String) -> Color {
    switch level {
    case "warning": return .yellow
    case "error": return .red
    default: return .green
    }
}
