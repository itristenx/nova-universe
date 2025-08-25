import { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface CameraIntegrationProps {
  onCapture: (file: File) => void;
  onError?: (error: Error) => void;
  accept?: string;
  maxFileSize?: number;
  quality?: number;
  facingMode?: 'user' | 'environment';
  className?: string;
}

interface CameraCapabilities {
  hasCamera: boolean;
  hasMultipleCameras: boolean;
  canTakePhotos: boolean;
  canRecordVideo: boolean;
  supportedConstraints: MediaTrackSupportedConstraints;
}

export default function CameraIntegration({
  onCapture,
  onError,
  accept = 'image/*',
  maxFileSize = 10 * 1024 * 1024, // 10MB
  quality = 0.8,
  facingMode = 'environment',
  className = '',
}: CameraIntegrationProps) {
  const { t } = useTranslation(['app', 'common']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capabilities, setCapabilities] = useState<CameraCapabilities | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState(facingMode);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check camera capabilities
  useEffect(() => {
    const checkCapabilities = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCapabilities({
          hasCamera: false,
          hasMultipleCameras: false,
          canTakePhotos: false,
          canRecordVideo: false,
          supportedConstraints: {},
        });
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
        const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

        setCapabilities({
          hasCamera: videoDevices.length > 0,
          hasMultipleCameras: videoDevices.length > 1,
          canTakePhotos: true,
          canRecordVideo: (supportedConstraints as any).video || false,
          supportedConstraints,
        });
      } catch (err) {
        console.error('Error checking camera capabilities:', err);
        setCapabilities({
          hasCamera: false,
          hasMultipleCameras: false,
          canTakePhotos: false,
          canRecordVideo: false,
          supportedConstraints: {},
        });
      }
    };

    checkCapabilities();
  }, []);

  const startCamera = useCallback(async () => {
    if (!capabilities?.hasCamera) {
      const error = new Error(t('app.camera.noCameraAvailable'));
      setError(error.message);
      onError?.(error);
      return;
    }

    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Camera access failed');
      setError(error.message);
      onError?.(error);
      console.error('Error accessing camera:', err);
    }
  }, [capabilities, currentFacingMode, onError, t]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !stream) {
      return;
    }

    setIsCapturing(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context not available');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Check file size
            if (blob.size > maxFileSize) {
              const error = new Error(
                t('app.camera.fileSizeExceeded', { size: maxFileSize / (1024 * 1024) }),
              );
              setError(error.message);
              onError?.(error);
              return;
            }

            // Create file from blob
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const file = new File([blob], `camera-${timestamp}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            onCapture(file);
            setIsOpen(false);
            stopCamera();
          }
        },
        'image/jpeg',
        quality,
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Photo capture failed');
      setError(error.message);
      onError?.(error);
      console.error('Error capturing photo:', err);
    } finally {
      setIsCapturing(false);
    }
  }, [stream, maxFileSize, quality, onCapture, onError, t, stopCamera]);

  const switchCamera = useCallback(() => {
    if (capabilities?.hasMultipleCameras) {
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      setCurrentFacingMode(newFacingMode);

      // Restart camera with new facing mode
      if (stream) {
        stopCamera();
        setTimeout(() => startCamera(), 100);
      }
    }
  }, [capabilities, currentFacingMode, stream, stopCamera, startCamera]);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.match(accept.replace('*', '.*'))) {
          const error = new Error(t('app.camera.invalidFileType'));
          setError(error.message);
          onError?.(error);
          return;
        }

        // Validate file size
        if (file.size > maxFileSize) {
          const error = new Error(
            t('app.camera.fileSizeExceeded', { size: maxFileSize / (1024 * 1024) }),
          );
          setError(error.message);
          onError?.(error);
          return;
        }

        onCapture(file);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [accept, maxFileSize, onCapture, onError, t],
  );

  const openCamera = useCallback(() => {
    setIsOpen(true);
    startCamera();
  }, [startCamera]);

  const closeCamera = useCallback(() => {
    setIsOpen(false);
    stopCamera();
    setError(null);
  }, [stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!capabilities) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          type="button"
          className="flex cursor-not-allowed items-center space-x-2 rounded-lg bg-gray-300 px-4 py-2 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
          disabled
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{t('common.loading')}</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        {capabilities.hasCamera && (
          <button
            type="button"
            onClick={openCamera}
            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{t('app.camera.takePhoto')}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span>{t('app.camera.selectFile')}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Camera Modal */}
      {isOpen && (
        <div className="bg-opacity-90 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="relative flex h-full max-h-screen w-full max-w-4xl flex-col p-4">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{t('app.camera.title')}</h3>
              <div className="flex items-center space-x-2">
                {capabilities.hasMultipleCameras && (
                  <button
                    type="button"
                    onClick={switchCamera}
                    className="rounded-lg bg-gray-800 p-2 text-white transition-colors hover:bg-gray-700"
                    title={t('app.camera.switchCamera')}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeCamera}
                  className="rounded-lg bg-red-600 p-2 text-white transition-colors hover:bg-red-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="mb-4 rounded-lg bg-red-600 p-3 text-white">{error}</div>}

            {/* Video Preview */}
            <div className="flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-gray-900">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={capturePhoto}
                disabled={!stream || isCapturing}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-gray-300 bg-white text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCapturing ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-900" />
                )}
              </button>
            </div>

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </>
  );
}

// Hook for camera capabilities
export function useCameraCapabilities() {
  const [capabilities, setCapabilities] = useState<CameraCapabilities | null>(null);

  useEffect(() => {
    const checkCapabilities = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCapabilities({
          hasCamera: false,
          hasMultipleCameras: false,
          canTakePhotos: false,
          canRecordVideo: false,
          supportedConstraints: {},
        });
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
        const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

        setCapabilities({
          hasCamera: videoDevices.length > 0,
          hasMultipleCameras: videoDevices.length > 1,
          canTakePhotos: true,
          canRecordVideo: (supportedConstraints as any).video || false,
          supportedConstraints,
        });
      } catch (err) {
        console.error('Error checking camera capabilities:', err);
        setCapabilities({
          hasCamera: false,
          hasMultipleCameras: false,
          canTakePhotos: false,
          canRecordVideo: false,
          supportedConstraints: {},
        });
      }
    };

    checkCapabilities();
  }, []);

  return capabilities;
}
