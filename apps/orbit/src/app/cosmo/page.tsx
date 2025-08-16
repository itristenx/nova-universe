'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CosmoPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to enhanced Cosmo AI
    router.replace('/cosmo/enhanced');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="text-muted-foreground">Redirecting to Enhanced Cosmo AI...</p>
      </div>
    </div>
  );
}
