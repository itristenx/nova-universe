import XCTest
@testable import Nova_Beacon

final class DirectoryServiceTests: XCTestCase {
    func testTokenPersistsInKeychain() {
        KeychainService.delete("scimToken")
        DirectoryService.shared.updateToken("abc")
        XCTAssertEqual(KeychainService.string(for: "scimToken"), "abc")
        XCTAssertEqual(DirectoryService.shared.token, "abc")
    }
}
