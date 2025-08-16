'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound(): React.ReactElement {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 text-center">
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-6">The page you’re looking for doesn’t exist or has moved.</p>
      <Link href="/" className="inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
        Go home
      </Link>
    </div>
  );
}


