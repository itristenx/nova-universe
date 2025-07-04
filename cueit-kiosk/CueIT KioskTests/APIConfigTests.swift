import XCTest
@testable import CueIT_Kiosk

final class APIConfigTests: XCTestCase {
    func testDefaultBaseURL() {
        XCTAssertEqual(APIConfig.baseURL, "http://localhost:3000")
    }
}
