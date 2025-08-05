// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Nova-Beacon",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "Nova-Beacon",
            targets: ["Nova-Beacon"]),
    ],
    dependencies: [
        .package(url: "https://github.com/twostraws/CodeScanner", from: "2.3.0")
    ],
    targets: [
        .target(
            name: "Nova-Beacon",
            dependencies: [
                .product(name: "CodeScanner", package: "CodeScanner")
            ],
            path: "Nova Beacon",
            exclude: ["Info.plist", "Assets.xcassets"]
        )
    ]
)
