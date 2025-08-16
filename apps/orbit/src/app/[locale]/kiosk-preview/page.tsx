'use client';

import React from 'react';
import KioskApp from '@/components/KioskApp';

export default function KioskPreviewPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="rounded-lg border p-4">
        <KioskApp />
      </div>
    </div>
  );
}
