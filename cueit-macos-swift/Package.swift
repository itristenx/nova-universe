// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "CueITLauncher",
    platforms: [.macOS(.v13)],
    products: [
        .executable(name: "CueITLauncher", targets: ["CueITLauncher"])
    ],
    targets: [
        .executableTarget(
            name: "CueITLauncher",
            path: "Sources/CueITLauncher"
        )
    ]
)
