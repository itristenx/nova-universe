import XCTest
@testable import Nova_Beacon

final class KioskServiceTests: XCTestCase {
    func testIdPersistsAcrossInstances() {
        KeychainService.delete("kioskId")
        UserDefaults.standard.removeObject(forKey: "kioskId")
        let id = KioskService.shared.id
        XCTAssertEqual(KeychainService.string(for: "kioskId"), id)
        XCTAssertEqual(KioskService.shared.id, id)
    }
}
