'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Eye, 
  Download, 
  Trash2, 
  Settings,
  Globe,
  Database,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,
  FileText,
  Share2
} from 'lucide-react';

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: 'data' | 'sharing' | 'tracking' | 'communication';
  impact: 'low' | 'medium' | 'high';
  required?: boolean;
}

interface DataCategory {
  id: string;
  name: string;
  description: string;
  size: string;
  lastUpdated: Date;
  canExport: boolean;
  canDelete: boolean;
  retentionPeriod: string;
}

const mockPrivacySettings: PrivacySetting[] = [
  {
    id: 'analytics',
    title: 'Usage Analytics',
    description: 'Allow collection of anonymous usage data to improve our services',
    enabled: true,
    category: 'tracking',
    impact: 'low'
  },
  {
    id: 'personalization',
    title: 'Personalized Experience',
    description: 'Use your data to personalize content and recommendations',
    enabled: true,
    category: 'data',
    impact: 'medium'
  },
  {
    id: 'marketing',
    title: 'Marketing Communications',
    description: 'Receive promotional emails and product updates',
    enabled: false,
    category: 'communication',
    impact: 'low'
  },
  {
    id: 'third_party_sharing',
    title: 'Third-Party Data Sharing',
    description: 'Share anonymized data with trusted partners for research',
    enabled: false,
    category: 'sharing',
    impact: 'high'
  },
  {
    id: 'location_tracking',
    title: 'Location Services',
    description: 'Access your location for location-based features',
    enabled: false,
    category: 'tracking',
    impact: 'high'
  },
  {
    id: 'essential_cookies',
    title: 'Essential Cookies',
    description: 'Required cookies for basic website _functionality',
    enabled: true,
    category: 'tracking',
    impact: 'low',
    required: true
  }
];

const mockDataCategories: DataCategory[] = [
  {
    id: '_profile',
    name: '_Profile Information',
    description: '_Basic _account information _including name, _email, and preferences',
    size: '2.4 KB',
    lastUpdated: new Date('2024-01-15'),
    canExport: true,
    canDelete: false,
    retentionPeriod: 'Account lifetime'
  },
  {
    id: 'activity',
    name: 'Activity Data',
    description: 'Login history, page views, and feature usage',
    size: '156 KB',
    lastUpdated: new Date('2024-01-20'),
    canExport: true,
    canDelete: true,
    retentionPeriod: '2 years'
  },
  {
    id: 'preferences',
    name: 'User Preferences',
    description: 'Settings, themes, language preferences, and customizations',
    size: '1.2 KB',
    lastUpdated: new Date('2024-01-18'),
    canExport: true,
    canDelete: true,
    retentionPeriod: 'Account lifetime'
  },
  {
    id: 'communications',
    name: 'Communications',
    description: 'Messages, notifications, and support interactions',
    size: '45 KB',
    lastUpdated: new Date('2024-01-19'),
    canExport: true,
    canDelete: true,
    retentionPeriod: '5 years'
  }
];

export function DataPrivacyDashboard() {
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>(mockPrivacySettings);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const togglePrivacySetting = (settingId: string) => {
    setPrivacySettings(prev => 
      prev.map(setting => 
        setting.id === settingId && !setting.required
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const handleExportData = async (categoryId: string) => {
    setIsExporting(categoryId);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000)); // TODO-LINT: move to async function
    setIsExporting(null);
    // In a real app, this would trigger a download
    alert(`Export initiated for ${categoryId} data`);
  };

  const handleDeleteData = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this data? This action cannot be undone.')) {
      // Simulate deletion process
      alert(`Deletion request submitted for ${categoryId} data`);
    }
  };

  const getImpactBadge = (impact: PrivacySetting['impact']) => {
    const variants = {
      low: { variant: 'secondary' as const, text: 'Low Impact' },
      medium: { variant: 'outline' as const, text: 'Medium Impact' },
      high: { variant: 'destructive' as const, text: 'High Impact' }
    };
    return variants[impact];
  };

  const getCategoryIcon = (category: PrivacySetting['category']) => {
    const icons = {
      data: Database,
      sharing: Share2,
      tracking: Eye,
      communication: Settings
    };
    return icons[category];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Privacy Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your data privacy settings and control how your information is used
          </p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Privacy Settings</TabsTrigger>
          <TabsTrigger value="data">My Data</TabsTrigger>
          <TabsTrigger value="rights">Privacy Rights</TabsTrigger>
        </TabsList>

        {/* Privacy Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Control Center</CardTitle>
              <CardDescription>
                Customize how your data is collected and used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {privacySettings.map((setting) => {
                  const IconComponent = getCategoryIcon(setting.category);
                  const impactBadge = getImpactBadge(setting.impact);
                  
                  return (
                    <div key={setting.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-muted rounded-lg">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{setting.title}</h3>
                            <Badge {...impactBadge}>
                              {impactBadge.text}
                            </Badge>
                            {setting.required && (
                              <Badge variant="outline">Required</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {setting.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={setting.enabled}
                          onCheckedChange={() => togglePrivacySetting(setting.id)}
                          disabled={setting.required}
                        />
                        {setting.enabled ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="font-medium">Privacy Score</div>
                  <div className="text-2xl font-bold text-green-600">85%</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Database className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-medium">Data Categories</div>
                  <div className="text-2xl font-bold text-blue-600">4</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="font-medium">Tracking Active</div>
                  <div className="text-2xl font-bold text-purple-600">2</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <Share2 className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <div className="font-medium">Data Sharing</div>
                  <div className="text-2xl font-bold text-orange-600">Off</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Data Categories</CardTitle>
              <CardDescription>
                View and manage the data we store about you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDataCategories.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{category.name}</h3>
                          <Badge variant="outline">{category.size}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {category.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated {category.lastUpdated.toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            Retention: {category.retentionPeriod}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {category.canExport && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportData(category.id)}
                            disabled={isExporting === category.id}
                          >
                            {isExporting === category.id ? (
                              <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                Exporting...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </>
                            )}
                          </Button>
                        )}
                        {category.canDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteData(category.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Rights Tab */}
        <TabsContent value="rights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Right to Access</h4>
                      <p className="text-sm text-muted-foreground">
                        View and download your personal data
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Right to Rectification</h4>
                      <p className="text-sm text-muted-foreground">
                        Correct inaccurate personal data
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Right to Erasure</h4>
                      <p className="text-sm text-muted-foreground">
                        Request deletion of your personal data
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Right to Portability</h4>
                      <p className="text-sm text-muted-foreground">
                        Transfer your data to another service
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Legal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Privacy Policy
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Terms of Service
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Cookie Policy
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="w-4 h-4 mr-2" />
                    GDPR Compliance
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">
                    Questions about your privacy?
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Contact our Data Protection Officer at privacy@novauniverse.com 
                    or submit a request through our support portal.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Contact Privacy Team
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DataPrivacyDashboard;
