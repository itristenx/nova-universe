import Foundation
import SwiftUI
import AppKit

class LauncherViewModel: ObservableObject {
    @Published var showSetup = false
    @Published var log: String = ""
    @Published var startAPI = true
    @Published var startAdmin = true
    @Published var startSlack = true

    private let packages = ["api": "cueit-api",
                            "admin": "cueit-admin",
                            "slack": "cueit-slack"]

    init() {
        showSetup = ensureEnvFiles()
    }

    private func resourcePath(_ relative: String) -> String {
        if let res = Bundle.main.resourceURL?.path {
            return (res as NSString).appendingPathComponent(relative)
        }
        return relative
    }

    func ensureEnvFiles(baseDir: String? = nil) -> Bool {
        let fm = FileManager.default
        let root = baseDir ?? resourcePath("..")
        var created = false
        for dir in packages.values {
            let env = URL(fileURLWithPath: root).appendingPathComponent(dir).appendingPathComponent(".env")
            let example = env.appendingPathExtension("example")
            if !fm.fileExists(atPath: env.path) {
                if fm.fileExists(atPath: example.path) {
                    try? fm.copyItem(at: example, to: env)
                    created = true
                }
            }
        }
        return created
    }

    func startServices() {
        let selected = [startAPI ? "api" : nil,
                        startAdmin ? "admin" : nil,
                        startSlack ? "slack" : nil].compactMap { $0 }
        let apps = selected.joined(separator: ",")
        let script = resourcePath("installers/start-all.sh")
        let process = Process()
        process.launchPath = "/bin/bash"
        process.arguments = [script]
        let input = Pipe()
        process.standardInput = input
        let output = Pipe()
        process.standardOutput = output
        process.standardError = output
        output.fileHandleForReading.readabilityHandler = { handle in
            if let str = String(data: handle.availableData, encoding: .utf8) {
                DispatchQueue.main.async {
                    self.log += str
                }
            }
        }
        do {
            try process.run()
            if let data = (apps + "\n").data(using: .utf8) {
                input.fileHandleForWriting.write(data)
                input.fileHandleForWriting.closeFile()
            }
        } catch {
            log += "Failed to start services: \(error)\n"
        }
    }

    func openAdmin() {
        let path = resourcePath("cueit-admin/dist/index.html")
        NSWorkspace.shared.open(URL(fileURLWithPath: path))
    }
}
