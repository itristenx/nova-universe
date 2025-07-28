import SwiftUI
import AVFoundation

// Scan result for compatibility
struct ScanResult {
    let string: String
    let type: String
    
    init(string: String, type: String = "QR") {
        self.string = string
        self.type = type
    }
}

// Temporary QR code scanner implementation
struct CodeScannerView: UIViewRepresentable {
    let completion: (Result<ScanResult, ScanError>) -> Void
    
    func makeUIView(context: Context) -> UIView {
        let view = UIView()
        view.backgroundColor = .black
        
        // Add a placeholder label
        let label = UILabel()
        label.text = "QR Scanner\n(Tap to simulate scan)"
        label.textColor = .white
        label.textAlignment = .center
        label.numberOfLines = 0
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
        
        // Add tap gesture for simulation
        let tapGesture = UITapGestureRecognizer(target: context.coordinator, action: #selector(Coordinator.simulateScan))
        view.addGestureRecognizer(tapGesture)
        
        return view
    }
    
    func updateUIView(_ uiView: UIView, context: Context) {
        // No updates needed
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(completion: completion)
    }
    
    class Coordinator: NSObject {
        let completion: (Result<ScanResult, ScanError>) -> Void
        
        init(completion: @escaping (Result<ScanResult, ScanError>) -> Void) {
            self.completion = completion
        }
        
        @objc func simulateScan() {
            // Simulate a successful scan
            let result = ScanResult(string: "DEMO-ACTIVATION-CODE-12345", type: "QR")
            completion(.success(result))
        }
    }
}

// Scan error for compatibility
enum ScanError: Error, LocalizedError {
    case badInput
    case badOutput
    case initError(_ error: Error)
    case permissionDenied
    
    var errorDescription: String? {
        switch self {
        case .badInput:
            return "Invalid camera input"
        case .badOutput:
            return "Invalid camera output"
        case .initError(let error):
            return "Camera initialization failed: \(error.localizedDescription)"
        case .permissionDenied:
            return "Camera permission denied"
        }
    }
}
