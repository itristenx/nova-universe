'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Smartphone, Download, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CachedItem {
  type: 'ticket' | 'notification';
  id: string;
  title?: string;
  message?: string;
  status?: string;
  time?: string;
}

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [cachedData, setCachedData] = useState<CachedItem[]>([]);
  const [pendingActions, setPendingActions] = useState(0);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data
    loadCachedData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedData = async () => {
    try {
      // Simulate loading cached tickets and notifications
      const mockCachedData: CachedItem[] = [
        { type: 'ticket' as const, id: 'TK-001', title: 'Password Reset Request', status: 'In Progress' },
        { type: 'ticket' as const, id: 'TK-002', title: 'VPN Access Issue', status: 'Open' },
        { type: 'notification' as const, id: 'N-001', message: 'Ticket TK-001 updated', time: '10:30 AM' }
      ];
      setCachedData(mockCachedData);
      setPendingActions(2); // Simulate pending sync actions
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoOnline = () => {
    if ('serviceWorker' in navigator) {
      // Trigger background sync when back online
      navigator.serviceWorker.ready.then(registration => {
        if ('sync' in registration && registration.sync) {
          return (registration.sync as any).register('sync-tickets');
        }
      });
    }
    handleRetry();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <WifiOff className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    You&apos;re Offline
                    {!isOnline && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        No Connection
                      </Badge>
                    )}
                    {isOnline && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Back Online!
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isOnline 
                      ? "Connection restored! Click retry to return to Nova Universe."
                      : "Don't worry, you can still view your cached data and create tickets offline."
                    }
                  </p>
                </div>
              </div>
              {isOnline && (
                <Button onClick={handleGoOnline} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Go Online
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* PWA Features Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Offline Access</h3>
                  <p className="text-sm text-muted-foreground">
                    View cached tickets and create new ones offline
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Download className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Background Sync</h3>
                  <p className="text-sm text-muted-foreground">
                    Changes sync automatically when back online
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified of important updates even offline
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cached Data */}
        {cachedData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Cached Data Available
                <Badge variant="outline">{cachedData.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cachedData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">
                        {item.type === 'ticket' ? item.title : item.message}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {item.type === 'ticket' ? `${item.id} - ${item.status}` : item.time}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {item.type === 'ticket' ? 'Ticket' : 'Notification'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Actions */}
        {pendingActions > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pending Sync Actions
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {pendingActions} pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You have {pendingActions} actions that will sync automatically when your connection is restored.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-muted rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm">Ticket creation - &ldquo;Laptop not working&rdquo;</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-muted rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm">Comment update on TK-001</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offline Actions */}
        <Card>
          <CardHeader>
            <CardTitle>What you can do offline:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Available Features:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• View cached tickets and notifications</li>
                  <li>• Create new support tickets</li>
                  <li>• Browse downloaded knowledge articles</li>
                  <li>• Use Cosmo AI with offline responses</li>
                  <li>• Access your dashboard overview</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Quick Actions:</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/tickets/new-enhanced'}>
                    Create New Ticket
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/knowledge/enhanced'}>
                    Browse Knowledge
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/cosmo/enhanced'}>
                    Chat with Cosmo AI
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Retry Connection */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <h3 className="font-medium">Check Your Connection</h3>
              <p className="text-sm text-muted-foreground">
                When your internet connection is restored, Nova Universe will automatically sync your offline changes.
              </p>
              <Button onClick={handleRetry} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
