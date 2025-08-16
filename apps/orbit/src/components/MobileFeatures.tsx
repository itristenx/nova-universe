'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Scan, MapPin, Upload, Smartphone, X, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Types
interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

interface ScanResult {
  type: 'qr' | 'barcode';
  data: string;
  format?: string;
}

interface PhotoCapture {
  id: string;
  blob: Blob;
  dataUrl: string;
  timestamp: Date;
  location?: GeolocationData;
}

export function MobileFeatures() {
  const [isSupported, setIsSupported] = useState({
    camera: false,
    geolocation: false,
    fileSystem: false,
    webShare: false,
  });

  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoCapture[]>([]);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check device capabilities
  useEffect(() => {
    const checkSupport = () => {
      setIsSupported({
        camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        geolocation: !!navigator.geolocation,
        fileSystem: 'showOpenFilePicker' in window,
        webShare: !!navigator.share,
      });
    };

    checkSupport();
  }, []);

  // Camera functions
  const startCamera = async () => {
    if (!isSupported.camera) {
      alert('Camera not supported on this device');
      return;
    }

    try {
      setIsLoading(true);
      setActiveFeature('camera');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use rear camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('Failed to access camera');
      setActiveFeature(null);
    } finally {
      setIsLoading(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const photo: PhotoCapture = {
          id: Date.now().toString(),
          blob,
          dataUrl,
          timestamp: new Date(),
          location: location || undefined,
        };

        setPhotos((prev) => [...prev, photo]);

        // Stop camera
        stopCamera();

        // Share photo if available
        if (isSupported.webShare) {
          sharePhoto(photo);
        }
      },
      'image/jpeg',
      0.8,
    );
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setActiveFeature(null);
  };

  // QR/Barcode scanning (simplified)
  const startScanning = async () => {
    if (!isSupported.camera) {
      alert('Camera not supported for scanning');
      return;
    }

    try {
      setIsLoading(true);
      setActiveFeature('scanner');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // In a real implementation, you'd use a QR code library like jsQR
        // For now, we'll simulate scanning
        setTimeout(() => {
          setScanResult({
            type: 'qr',
            data: 'https://nova-universe.example.com/asset/12345',
            format: 'QR_CODE',
          });
          stopCamera();
        }, 3000);
      }
    } catch (error) {
      console.error('Scanner error:', error);
      alert('Failed to start scanner');
      setActiveFeature(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Geolocation functions
  const getCurrentLocation = () => {
    if (!isSupported.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData: GeolocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        // Try to get address (in real app, use reverse geocoding API)
        try {
          locationData.address = `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`;
        } catch (error) {
          console.error('Geocoding error:', error);
        }

        setLocation(locationData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Location error:', error);
        alert('Failed to get location');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    );
  };

  // File sharing
  const sharePhoto = async (photo: PhotoCapture) => {
    if (!navigator.share) return;

    try {
      const file = new File([photo.blob], `photo-${photo.id}.jpg`, {
        type: 'image/jpeg',
      });

      await navigator.share({
        title: 'Nova Universe - Photo Attachment',
        text: 'Photo captured for support ticket',
        files: [file],
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Touch/gesture handlers for mobile
  useEffect(() => {
    // Add swipe gestures, pull-to-refresh, etc.
    // This would be implemented with touch event listeners
    const handleGestures = () => {
      // Implementation would go here
    };

    if ('ontouchstart' in window) {
      handleGestures();
    }
  }, []);

  if (activeFeature === 'camera' && isSupported.camera) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black">
        <div className="flex items-center justify-between p-4 text-white">
          <h2 className="text-lg font-semibold">Take Photo</h2>
          <Button variant="ghost" size="sm" onClick={stopCamera}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative flex-1">
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />

          {location && (
            <div className="bg-opacity-50 absolute top-4 left-4 rounded bg-black p-2 text-sm text-white">
              <MapPin className="mr-1 inline h-4 w-4" />
              Location captured
            </div>
          )}
        </div>

        <div className="flex justify-center p-6">
          <Button
            size="lg"
            className="h-16 w-16 rounded-full bg-white text-black hover:bg-gray-100"
            onClick={capturePhoto}
          >
            <Camera className="h-6 w-6" />
          </Button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  if (activeFeature === 'scanner' && isSupported.camera) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black">
        <div className="flex items-center justify-between p-4 text-white">
          <h2 className="text-lg font-semibold">Scan QR/Barcode</h2>
          <Button variant="ghost" size="sm" onClick={stopCamera}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative flex-1">
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />

          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed border-white">
              <div className="text-center text-white">
                <Scan className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">Position QR code within frame</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Mobile Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feature buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={startCamera}
            disabled={!isSupported.camera || isLoading}
          >
            {isLoading && activeFeature === 'camera' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
            <span className="text-xs">Take Photo</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={startScanning}
            disabled={!isSupported.camera || isLoading}
          >
            {isLoading && activeFeature === 'scanner' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Scan className="h-5 w-5" />
            )}
            <span className="text-xs">Scan Code</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={getCurrentLocation}
            disabled={!isSupported.geolocation || isLoading}
          >
            {isLoading && !activeFeature ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MapPin className="h-5 w-5" />
            )}
            <span className="text-xs">Get Location</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs">Upload File</span>
          </Button>
        </div>

        {/* Feature status */}
        <div className="space-y-2">
          {Object.entries(isSupported).map(([feature, supported]) => (
            <div key={feature} className="flex items-center justify-between text-sm">
              <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
              <Badge variant={supported ? 'default' : 'secondary'}>
                {supported ? <Check className="mr-1 h-3 w-3" /> : <X className="mr-1 h-3 w-3" />}
                {supported ? 'Available' : 'Not Available'}
              </Badge>
            </div>
          ))}
        </div>

        {/* Current location */}
        {location && (
          <div className="bg-muted rounded-lg p-3">
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Current Location</span>
            </div>
            <p className="text-muted-foreground text-xs">
              {location.address ||
                `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
            </p>
            <p className="text-muted-foreground text-xs">
              Accuracy: ±{Math.round(location.accuracy)}m
            </p>
          </div>
        )}

        {/* Scan result */}
        {scanResult && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Scan Result</span>
            </div>
            <p className="text-xs break-all text-green-700">{scanResult.data}</p>
            <Button size="sm" className="mt-2" onClick={() => setScanResult(null)}>
              Use Result
            </Button>
          </div>
        )}

        {/* Captured photos */}
        {photos.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Captured Photos</h4>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.dataUrl}
                    alt="Captured"
                    className="h-20 w-full rounded border object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-opacity-50 hover:bg-opacity-70 absolute top-1 right-1 h-6 w-6 bg-black p-0 text-white"
                    onClick={() => setPhotos((prev) => prev.filter((p) => p.id !== photo.id))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.txt,.log"
          multiple
          className="hidden"
          aria-label="Upload files"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            console.log('Files selected:', files);
            // Handle file uploads
          }}
        />
      </CardContent>
    </Card>
  );
}
