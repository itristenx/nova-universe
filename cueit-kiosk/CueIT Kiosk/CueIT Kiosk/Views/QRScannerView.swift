import SwiftUI
import VisionKit
import AVFoundation
import AudioToolbox

struct QRScannerView: View {
    let onCodeScanned: (String) -> Void
    let onCancel: () -> Void
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            // Directly show the scanner instead of an intermediate view
            if DataScannerViewController.isSupported && DataScannerViewController.isAvailable {
                NativeDataScannerView(
                    recognizedDataTypes: [.barcode()],
                    onScanned: { scannedData in
                        if case let .barcode(barcode) = scannedData {
                            onCodeScanned(barcode.payloadStringValue ?? "")
                        }
                    },
                    onCancel: {
                        onCancel()
                    }
                )
            } else {
                // Fallback for devices that don't support DataScannerViewController
                LegacyQRScannerView(
                    onCodeScanned: onCodeScanned,
                    onCancel: onCancel
                )
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button("Cancel") {
                    onCancel()
                }
            }
        }
    }
}

@available(iOS 16.0, *)
struct NativeDataScannerView: UIViewControllerRepresentable {
    let recognizedDataTypes: Set<DataScannerViewController.RecognizedDataType>
    let onScanned: (RecognizedItem) -> Void
    let onCancel: () -> Void
    
    func makeUIViewController(context: Context) -> UINavigationController {
        let scanner = DataScannerViewController(
            recognizedDataTypes: recognizedDataTypes,
            qualityLevel: .balanced,
            recognizesMultipleItems: false,
            isHighFrameRateTrackingEnabled: false,
            isPinchToZoomEnabled: true,
            isGuidanceEnabled: true,
            isHighlightingEnabled: true
        )
        scanner.delegate = context.coordinator
        
        // Add navigation bar with cancel button
        scanner.navigationItem.title = "Scan QR Code"
        scanner.navigationItem.leftBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .cancel,
            target: context.coordinator,
            action: #selector(Coordinator.cancelTapped)
        )
        
        let navController = UINavigationController(rootViewController: scanner)
        return navController
    }
    
    func updateUIViewController(_ uiViewController: UINavigationController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, DataScannerViewControllerDelegate {
        let parent: NativeDataScannerView
        
        init(_ parent: NativeDataScannerView) {
            self.parent = parent
        }
        
        @objc func cancelTapped() {
            parent.onCancel()
        }
        
        func dataScanner(_ dataScanner: DataScannerViewController, didTapOn item: RecognizedItem) {
            parent.onScanned(item)
        }
        
        func dataScanner(_ dataScanner: DataScannerViewController, didAdd addedItems: [RecognizedItem], allItems: [RecognizedItem]) {
            if let firstItem = addedItems.first {
                parent.onScanned(firstItem)
            }
        }
    }
}

// Fallback implementation for older devices or unsupported configurations
struct LegacyQRScannerView: UIViewControllerRepresentable {
    let onCodeScanned: (String) -> Void
    let onCancel: () -> Void
    
    func makeUIViewController(context: Context) -> UINavigationController {
        let controller = LegacyQRScannerViewController()
        controller.delegate = context.coordinator
        
        // Add navigation bar with cancel button
        controller.navigationItem.title = "Scan QR Code"
        controller.navigationItem.leftBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .cancel,
            target: context.coordinator,
            action: #selector(Coordinator.cancelTapped)
        )
        
        let navController = UINavigationController(rootViewController: controller)
        return navController
    }
    
    func updateUIViewController(_ uiViewController: UINavigationController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, LegacyQRScannerDelegate {
        let parent: LegacyQRScannerView
        
        init(_ parent: LegacyQRScannerView) {
            self.parent = parent
        }
        
        @objc func cancelTapped() {
            parent.onCancel()
        }
        
        func didScanCode(_ code: String) {
            parent.onCodeScanned(code)
        }
        
        func didCancelScanning() {
            parent.onCancel()
        }
    }
}

protocol LegacyQRScannerDelegate: AnyObject {
    func didScanCode(_ code: String)
    func didCancelScanning()
}

class LegacyQRScannerViewController: UIViewController {
    weak var delegate: LegacyQRScannerDelegate?
    private var captureSession: AVCaptureSession!
    private var previewLayer: AVCaptureVideoPreviewLayer!
    private var scanCompleted = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupCamera()
        setupUI()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if !captureSession.isRunning {
            DispatchQueue.global(qos: .background).async {
                self.captureSession.startRunning()
            }
        }
        scanCompleted = false
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        if captureSession.isRunning {
            captureSession.stopRunning()
        }
    }
    
    private func setupCamera() {
        captureSession = AVCaptureSession()
        
        guard let videoCaptureDevice = AVCaptureDevice.default(for: .video) else {
            showError("Camera not available")
            return
        }
        
        let videoInput: AVCaptureDeviceInput
        do {
            videoInput = try AVCaptureDeviceInput(device: videoCaptureDevice)
        } catch {
            showError("Camera input error")
            return
        }
        
        if captureSession.canAddInput(videoInput) {
            captureSession.addInput(videoInput)
        } else {
            showError("Cannot add camera input")
            return
        }
        
        let metadataOutput = AVCaptureMetadataOutput()
        if captureSession.canAddOutput(metadataOutput) {
            captureSession.addOutput(metadataOutput)
            metadataOutput.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
            metadataOutput.metadataObjectTypes = [.qr]
        } else {
            showError("Cannot add metadata output")
            return
        }
        
        previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
        previewLayer.frame = view.layer.bounds
        previewLayer.videoGravity = .resizeAspectFill
        view.layer.addSublayer(previewLayer)
    }
    
    private func setupUI() {
        // Add a modern overlay with better styling
        let overlayView = UIView(frame: view.bounds)
        overlayView.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        view.addSubview(overlayView)
        
        // Add scanning area with rounded corners
        let scanArea = UIView()
        let sideLength = min(view.bounds.width - 100, 250)
        let xPosition = (view.bounds.width - sideLength) / 2
        let yPosition = (view.bounds.height - sideLength) / 2 - 50
        scanArea.frame = CGRect(x: xPosition, y: yPosition, width: sideLength, height: sideLength)
        scanArea.layer.borderColor = UIColor.white.cgColor
        scanArea.layer.borderWidth = 3
        scanArea.layer.cornerRadius = 20
        scanArea.backgroundColor = UIColor.clear
        overlayView.addSubview(scanArea)
        
        // Create a clear area in the overlay
        let path = UIBezierPath(rect: overlayView.bounds)
        let scanPath = UIBezierPath(roundedRect: scanArea.frame, cornerRadius: 20)
        path.append(scanPath.reversing())
        
        let maskLayer = CAShapeLayer()
        maskLayer.path = path.cgPath
        maskLayer.fillRule = .evenOdd
        overlayView.layer.mask = maskLayer
        
        // Add instructions
        let instructionLabel = UILabel()
        instructionLabel.text = "Position QR code within the frame"
        instructionLabel.textColor = .white
        instructionLabel.font = UIFont.systemFont(ofSize: 18, weight: .medium)
        instructionLabel.textAlignment = .center
        instructionLabel.numberOfLines = 0
        instructionLabel.frame = CGRect(x: 20, y: scanArea.frame.maxY + 30, width: view.bounds.width - 40, height: 60)
        view.addSubview(instructionLabel)
        
        // Add cancel button with modern styling
        let cancelButton = UIButton(type: .system)
        cancelButton.setTitle("Cancel", for: .normal)
        cancelButton.setTitleColor(.white, for: .normal)
        cancelButton.titleLabel?.font = UIFont.systemFont(ofSize: 18, weight: .semibold)
        cancelButton.frame = CGRect(x: 50, y: view.bounds.height - 120, width: view.bounds.width - 100, height: 50)
        cancelButton.backgroundColor = UIColor.systemRed
        cancelButton.layer.cornerRadius = 12
        cancelButton.addTarget(self, action: #selector(cancelTapped), for: .touchUpInside)
        view.addSubview(cancelButton)
    }
    
    @objc private func cancelTapped() {
        delegate?.didCancelScanning()
    }
    
    private func showError(_ message: String) {
        DispatchQueue.main.async {
            let alert = UIAlertController(title: "Error", message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
                self.delegate?.didCancelScanning()
            })
            self.present(alert, animated: true)
        }
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = view.layer.bounds
    }
}

extension LegacyQRScannerViewController: AVCaptureMetadataOutputObjectsDelegate {
    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        guard !scanCompleted else { return }
        
        if let metadataObject = metadataObjects.first {
            guard let readableObject = metadataObject as? AVMetadataMachineReadableCodeObject else { return }
            guard let stringValue = readableObject.stringValue else { return }
            
            scanCompleted = true
            AudioServicesPlaySystemSound(SystemSoundID(kSystemSoundID_Vibrate))
            
            delegate?.didScanCode(stringValue)
        }
    }
}
