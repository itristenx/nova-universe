'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Settings, Eye, Database, Users } from 'lucide-react';

// Import our security components
import { PermissionManager } from './permission-manager';
import { SecureAuthFlow } from './secure-auth-flow';
import { DataPrivacyDashboard } from './data-privacy-dashboard';
import { SecurityAuditTrail } from './security-audit-trail';

export function SecurityHub() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary rounded-lg">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Security Center</h1>
              <p className="text-lg text-muted-foreground mt-2">
                Comprehensive security management for your Nova Universe account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
          </TabsList>

          {/* Security Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">98%</div>
                      <div className="text-sm text-muted-foreground">Security Score</div>
                    </div>
                    <Shield className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="mt-4 h-2 bg-muted rounded-full">
                    <div className="h-2 bg-green-500 rounded-full w-[98%]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">4</div>
                      <div className="text-sm text-muted-foreground">Active Permissions</div>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">85%</div>
                      <div className="text-sm text-muted-foreground">Privacy Score</div>
                    </div>
                    <Eye className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">247</div>
                      <div className="text-sm text-muted-foreground">Security Events</div>
                    </div>
                    <Database className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Status Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Status
                  </CardTitle>
                  <CardDescription>
                    Current security posture overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="font-medium">Two-Factor Authentication</span>
                    </div>
                    <span className="text-green-600 text-sm">Enabled</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="font-medium">Strong Password</span>
                    </div>
                    <span className="text-green-600 text-sm">Active</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="font-medium">Account Recovery</span>
                    </div>
                    <span className="text-yellow-600 text-sm">Needs Setup</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="font-medium">Session Management</span>
                    </div>
                    <span className="text-blue-600 text-sm">Optimized</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common security management tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="font-medium">Update Password</div>
                      <div className="text-sm text-muted-foreground">Change your account password</div>
                    </div>

                    <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="font-medium">Review Permissions</div>
                      <div className="text-sm text-muted-foreground">Manage account permissions</div>
                    </div>

                    <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="font-medium">Export Data</div>
                      <div className="text-sm text-muted-foreground">Download your data</div>
                    </div>

                    <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="font-medium">View Activity</div>
                      <div className="text-sm text-muted-foreground">Check recent security events</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Security Recommendations</CardTitle>
                <CardDescription>
                  Suggested actions to improve your security posture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-800">Set up Account Recovery</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Configure backup recovery methods to ensure you can always access your account.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-800">Review Data Sharing Settings</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Check your privacy settings to ensure data is shared according to your preferences.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">Security Audit Complete</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your recent security audit shows excellent compliance with best practices.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <PermissionManager />
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <DataPrivacyDashboard />
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit">
            <SecurityAuditTrail />
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="authentication">
            <SecureAuthFlow />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SecurityHub;
