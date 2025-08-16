'use client';

import React from 'react';
import UserStatusDashboard from '@/components/monitoring/UserStatusDashboard';

export default function AccessibilityAuditPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">Accessibility Audit</h1>
        <p className="text-muted-foreground">Real-time checks and best practices guidance</p>
      </header>
      <UserStatusDashboard statusPageSlug="accessibility" />
    </div>
  );
}
