// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CueIT-Kiosk",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "CueIT-Kiosk",
            targets: ["CueIT-Kiosk"]),
    ],
    dependencies: [
        .package(url: "https://github.com/twostraws/CodeScanner", from: "2.3.0")
    ],
    targets: [
        .target(
            name: "CueIT-Kiosk",
            dependencies: [
                .product(name: "CodeScanner", package: "CodeScanner")
            ]
        )
    ]
)
