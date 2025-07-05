import SwiftUI
import Combine

@MainActor
final class LauncherModel: ObservableObject {
    @Published var setupNeeded = false
    @Published var envs: [String: String] = [:]

    private let packages = ["cueit-api", "cueit-admin", "cueit-activate", "cueit-slack"]

    init() {
        Task { await ensureEnvFiles() }
    }

    private func baseURL() -> URL {
        Bundle.main.resourceURL!.deletingLastPathComponent()
    }

    func ensureEnvFiles() async {
        let base = baseURL()
        var created = false
        for pkg in packages {
            let env = base.appendingPathComponent(pkg).appendingPathComponent(".env")
            let example = base.appendingPathComponent(pkg).appendingPathComponent(".env.example")
            if !FileManager.default.fileExists(atPath: env.path) {
                if let data = try? Data(contentsOf: example) {
                    try? data.write(to: env)
                }
                created = true
            }
            if let str = try? String(contentsOf: env) {
                envs[pkg] = str
            }
        }
        setupNeeded = created
    }

    func saveEnvs() {
        let base = baseURL()
        for (pkg, data) in envs {
            let env = base.appendingPathComponent(pkg).appendingPathComponent(".env")
            try? data.write(to: env, atomically: true, encoding: .utf8)
        }
        setupNeeded = false
    }

    func start(selected: [String]) {
        guard let script = Bundle.main.path(forResource: "start-services", ofType: "sh") else { return }
        let proc = Process()
        proc.executableURL = URL(fileURLWithPath: script)
        let pipe = Pipe()
        proc.standardInput = pipe
        try? proc.run()
        if let data = (selected.joined(separator: ",") + "\n").data(using: .utf8) {
            pipe.fileHandleForWriting.write(data)
        }
        pipe.fileHandleForWriting.closeFile()
    }

    func openAdmin() {
        if let url = URL(string: "http://localhost:5173") {
            NSWorkspace.shared.open(url)
        }
    }
}
