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
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-border bg-muted/50 border-b">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary rounded-lg p-3">
              <Shield className="text-primary-foreground h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Security Center</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Comprehensive security management for your Nova Universe account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">98%</div>
                      <div className="text-muted-foreground text-sm">Security Score</div>
                    </div>
                    <Shield className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="bg-muted mt-4 h-2 rounded-full">
                    <div className="h-2 w-[98%] rounded-full bg-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">4</div>
                      <div className="text-muted-foreground text-sm">Active Permissions</div>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">85%</div>
                      <div className="text-muted-foreground text-sm">Privacy Score</div>
                    </div>
                    <Eye className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">247</div>
                      <div className="text-muted-foreground text-sm">Security Events</div>
                    </div>
                    <Database className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Status Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Status
                  </CardTitle>
                  <CardDescription>Current security posture overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="font-medium">Two-Factor Authentication</span>
                    </div>
                    <span className="text-sm text-green-600">Enabled</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="font-medium">Strong Password</span>
                    </div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="font-medium">Account Recovery</span>
                    </div>
                    <span className="text-sm text-yellow-600">Needs Setup</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="font-medium">Session Management</span>
                    </div>
                    <span className="text-sm text-blue-600">Optimized</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common security management tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="hover:bg-muted/50 cursor-pointer rounded-lg border p-3 transition-colors">
                      <div className="font-medium">Update Password</div>
                      <div className="text-muted-foreground text-sm">
                        Change your account password
                      </div>
                    </div>

                    <div className="hover:bg-muted/50 cursor-pointer rounded-lg border p-3 transition-colors">
                      <div className="font-medium">Review Permissions</div>
                      <div className="text-muted-foreground text-sm">
                        Manage account permissions
                      </div>
                    </div>

                    <div className="hover:bg-muted/50 cursor-pointer rounded-lg border p-3 transition-colors">
                      <div className="font-medium">Export Data</div>
                      <div className="text-muted-foreground text-sm">Download your data</div>
                    </div>

                    <div className="hover:bg-muted/50 cursor-pointer rounded-lg border p-3 transition-colors">
                      <div className="font-medium">View Activity</div>
                      <div className="text-muted-foreground text-sm">
                        Check recent security events
                      </div>
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
                  <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="mt-2 h-2 w-2 rounded-full bg-amber-500" />
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-800">Set up Account Recovery</h4>
                      <p className="mt-1 text-sm text-amber-700">
                        Configure backup recovery methods to ensure you can always access your
                        account.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-800">Review Data Sharing Settings</h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Check your privacy settings to ensure data is shared according to your
                        preferences.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="mt-2 h-2 w-2 rounded-full bg-green-500" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">Security Audit Complete</h4>
                      <p className="mt-1 text-sm text-green-700">
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
