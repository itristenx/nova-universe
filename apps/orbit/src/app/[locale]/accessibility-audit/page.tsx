'use client';

import React from 'react';
import UserStatusDashboard from '@/components/monitoring/UserStatusDashboard';

export default function AccessibilityAuditPage(): React.ReactElement {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Accessibility Audit</h1>
        <p className="text-muted-foreground">Real-time checks and best practices guidance</p>
      </header>
      <UserStatusDashboard statusPageSlug="accessibility" />
    </div>
  );
}


