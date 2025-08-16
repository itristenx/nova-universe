'use client';

import React from 'react';
import KioskApp from '@/components/KioskApp';

export default function KioskPreviewPage(): React.ReactElement {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="rounded-lg border p-4">
        <KioskApp />
      </div>
    </div>
  );
}


