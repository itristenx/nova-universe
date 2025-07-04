import XCTest
@testable import CueIT_Kiosk

final class KioskServiceTests: XCTestCase {
    func testIdPersistsAcrossInstances() {
        KeychainService.delete("kioskId")
        UserDefaults.standard.removeObject(forKey: "kioskId")
        let id = KioskService.shared.id
        XCTAssertEqual(KeychainService.string(for: "kioskId"), id)
        XCTAssertEqual(KioskService.shared.id, id)
    }
}
