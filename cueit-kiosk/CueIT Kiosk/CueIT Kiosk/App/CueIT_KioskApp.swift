//
//  CueIT_KioskApp.swift
//  CueIT Kiosk
//
//  Created by Tristen Neibarger on 7/2/25.
//

import SwiftUI
import Foundation

@main
struct CueITKioskApp: App {
    init() {
        Task {
            await KioskService.shared.register(version: Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "")
        }
    }

    var body: some Scene {
        WindowGroup {
            LaunchView()
        }
    }
}
