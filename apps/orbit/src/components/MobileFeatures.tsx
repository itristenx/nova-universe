'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Scan, 
  MapPin, 
  Upload, 
  Smartphone, 
  X, 
  Check,
  Loader2
} from 'lucide-react';
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
    webShare: false
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
        webShare: !!navigator.share
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
          height: { ideal: 720 }
        }
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
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const photo: PhotoCapture = {
        id: Date.now().toString(),
        blob,
        dataUrl,
        timestamp: new Date(),
        location: location || undefined
      };

      setPhotos(prev => [...prev, photo]);
      
      // Stop camera
      stopCamera();
      
      // Share photo if available
      if (isSupported.webShare) {
        sharePhoto(photo);
      }
    }, 'image/jpeg', 0.8);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
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
          height: { ideal: 720 }
        }
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
            format: 'QR_CODE'
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
          accuracy: position.coords.accuracy
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
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // File sharing
  const sharePhoto = async (photo: PhotoCapture) => {
    if (!navigator.share) return;

    try {
      const file = new File([photo.blob], `photo-${photo.id}.jpg`, {
        type: 'image/jpeg'
      });

      await navigator.share({
        title: 'Nova Universe - Photo Attachment',
        text: 'Photo captured for support ticket',
        files: [file]
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
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 text-white">
          <h2 className="text-lg font-semibold">Take Photo</h2>
          <Button variant="ghost" size="sm" onClick={stopCamera}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          
          {location && (
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location captured
            </div>
          )}
        </div>
        
        <div className="p-6 flex justify-center">
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-white text-black hover:bg-gray-100"
            onClick={capturePhoto}
          >
            <Camera className="w-6 h-6" />
          </Button>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  if (activeFeature === 'scanner' && isSupported.camera) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 text-white">
          <h2 className="text-lg font-semibold">Scan QR/Barcode</h2>
          <Button variant="ghost" size="sm" onClick={stopCamera}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
              <div className="text-white text-center">
                <Scan className="w-8 h-8 mx-auto mb-2" />
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
          <Smartphone className="w-5 h-5" />
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
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
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
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Scan className="w-5 h-5" />
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
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
            <span className="text-xs">Get Location</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs">Upload File</span>
          </Button>
        </div>

        {/* Feature status */}
        <div className="space-y-2">
          {Object.entries(isSupported).map(([feature, supported]) => (
            <div key={feature} className="flex items-center justify-between text-sm">
              <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
              <Badge variant={supported ? 'default' : 'secondary'}>
                {supported ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                {supported ? 'Available' : 'Not Available'}
              </Badge>
            </div>
          ))}
        </div>

        {/* Current location */}
        {location && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="font-medium text-sm">Current Location</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
            </p>
            <p className="text-xs text-muted-foreground">
              Accuracy: ±{Math.round(location.accuracy)}m
            </p>
          </div>
        )}

        {/* Scan result */}
        {scanResult && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="font-medium text-sm text-green-800">Scan Result</span>
            </div>
            <p className="text-xs text-green-700 break-all">{scanResult.data}</p>
            <Button 
              size="sm" 
              className="mt-2" 
              onClick={() => setScanResult(null)}
            >
              Use Result
            </Button>
          </div>
        )}

        {/* Captured photos */}
        {photos.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Captured Photos</h4>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.dataUrl}
                    alt="Captured"
                    className="w-full h-20 object-cover rounded border"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                    onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))}
                  >
                    <X className="w-3 h-3" />
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
