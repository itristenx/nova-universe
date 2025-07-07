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
    @State private var showServerConfig = false
    @StateObject private var configService = ConfigService()
    @StateObject private var kioskService = KioskService.shared
    @StateObject private var notificationService = NotificationService.shared
    @StateObject private var statusService = StatusService.shared
    @State private var showAlert = false
    @State private var alertMessage = ""

    var body: some View {
        ZStack {
            switch kioskService.state {
            case .checking:
                VStack(spacing: 20) {
                    Spacer()
                    ProgressView()
                        .scaleEffect(1.5)
                    Text("Connecting to server...")
                        .font(.title2)
                        .foregroundColor(.gray)
                    Text("API: \(APIConfig.baseURL)")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .onTapGesture {
                            showServerConfig = true
                        }
                        .onLongPressGesture {
                            showServerConfig = true
                        }
                    if !kioskService.statusMessage.isEmpty {
                        Text(kioskService.statusMessage)
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Theme.Colors.base.ignoresSafeArea())
            case .needsServerConfig:
                ServerConfigView()
            case .waitingForActivation:
                ActivationView()
            case .inactive:
                ActivationView()
            case .error:
                ActivationErrorView { Task { await kioskService.checkActive() } }
            case .active:
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
                    
                    // Server status indicator - always visible on active screen
                    HStack(spacing: 4) {
                        Circle()
                            .fill(kioskService.activationError ? Color.red : Color.green)
                            .frame(width: 6, height: 6)
                        Text("Connected to: \(APIConfig.serverDisplayName)")
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                    .padding(.top, 4)
                    .onTapGesture {
                        showServerConfig = true
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .onTapGesture {
            if kioskService.state == .active {
                showForm = true
            }
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
        .sheet(isPresented: $showServerConfig) {
            ServerConfigView()
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
        .overlay(alignment: .topTrailing) {
            if kioskService.state == .active {
                HStack {
                    Spacer()
                    VStack {
                        Button(action: {
                            showAdmin = true
                        }) {
                            Image(systemName: "gearshape.fill")
                                .font(.title2)
                                .foregroundColor(.primary)
                                .padding(12)
                                .background(Color.white.opacity(0.9))
                                .clipShape(Circle())
                                .shadow(radius: 2)
                        }
                        .accessibilityLabel("Settings")
                        .padding(.top, Theme.Spacing.md)
                        .padding(.trailing, Theme.Spacing.md)
                        Spacer()
                    }
                }
            }
        }
        .overlay {
            if kioskService.state == .active {
                VStack {
                    Spacer()

                    // Status bar at the bottom (open/closed status)
                    VStack(spacing: 0) {
                        if let status = statusService.latest {
                            HStack {
                                Text(status.message)
                                .font(.headline)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 12)
                        }
                        .frame(maxWidth: .infinity)
                        .background(Theme.Colors.color(for: status.status))
                    }
                    if let note = notificationService.latest {
                        HStack {
                            Text(note.message)
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(.white)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 10)
                        }
                        .frame(maxWidth: .infinity)
                        .background(Theme.Colors.color(for: note.level))
                    }

                    // Bottom action buttons row (above status bar)
                    HStack {
                        // Feedback button - bottom left
                        Button(action: { showFeedback = true }) {
                            Image(systemName: "ellipsis.bubble")
                                .font(.title2)
                                .foregroundColor(.black)
                                .padding(12)
                                .background(Color.white.opacity(0.9))
                                .clipShape(Circle())
                                .shadow(radius: 2)
                        }
                        .accessibilityLabel("Feedback")

                        Spacer()

                        // Server status button - bottom right
                        Button(action: { showServerConfig = true }) {
                            HStack(spacing: 6) {
                                Circle()
                                    .fill(kioskService.activationError ? Color.red : Color.green)
                                    .frame(width: 10, height: 10)
                                Text("Server")
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .foregroundColor(.primary)
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(Color.white.opacity(0.9))
                            .cornerRadius(16)
                            .shadow(radius: 2)
                        }
                        .accessibilityLabel("Server Configuration")
                    }
                    .padding(.horizontal, Theme.Spacing.md)
                    .padding(.bottom, Theme.Spacing.sm)
                }
            }
        }
        .alert(alertMessage, isPresented: $showAlert) {
            Button("OK", role: .cancel) {}
        }
    }
}
