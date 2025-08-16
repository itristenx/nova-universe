'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="mb-2 text-3xl font-bold">Page not found</h1>
      <p className="text-muted-foreground mb-6">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link
        href="/"
        className="hover:bg-accent hover:text-accent-foreground inline-flex items-center rounded-md border px-4 py-2 text-sm"
      >
        Go home
      </Link>
    </div>
  );
}
