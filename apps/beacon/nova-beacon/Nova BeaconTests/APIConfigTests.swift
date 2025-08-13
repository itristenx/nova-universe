import XCTest
@testable import Nova_Beacon

final class APIConfigTests: XCTestCase {
    func testDefaultBaseURL() {
        XCTAssertEqual(APIConfig.baseURL, "https://localhost:3000")
    }
}
