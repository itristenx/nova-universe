import XCTest
@testable import CueIT_Kiosk

final class DirectoryServiceTests: XCTestCase {
    func testTokenPersistsInKeychain() {
        KeychainService.delete("scimToken")
        DirectoryService.shared.updateToken("abc")
        XCTAssertEqual(KeychainService.string(for: "scimToken"), "abc")
        XCTAssertEqual(DirectoryService.shared.token, "abc")
    }
}
