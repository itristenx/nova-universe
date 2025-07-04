import XCTest
@testable import CueIT_Kiosk

final class KioskServiceTests: XCTestCase {
    func testIdPersistsAcrossInstances() {
        let defaults = UserDefaults.standard
        defaults.removeObject(forKey: "kioskId")
        let id = KioskService.shared.id
        XCTAssertEqual(defaults.string(forKey: "kioskId"), id)
        XCTAssertEqual(KioskService.shared.id, id)
    }
}
