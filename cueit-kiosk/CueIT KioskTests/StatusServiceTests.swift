import XCTest
@testable import CueIT_Kiosk

final class StatusServiceTests: XCTestCase {
    func testStatusPersistsAcrossInstances() {
        UserDefaults.standard.removeObject(forKey: "lastStatus")
        let update = StatusUpdate(status: "warning", message: "Heads up")
        let data = try! JSONEncoder().encode(update)
        UserDefaults.standard.set(data, forKey: "lastStatus")

        let service = StatusService.shared
        XCTAssertEqual(service.latest?.status, "warning")
        XCTAssertEqual(service.latest?.message, "Heads up")
    }

    func testBannerColorMapping() {
        XCTAssertEqual(color(for: "warning"), Theme.Colors.yellow)
        XCTAssertEqual(color(for: "error"), Theme.Colors.red)
        XCTAssertEqual(color(for: "other"), Theme.Colors.green)
    }
}
