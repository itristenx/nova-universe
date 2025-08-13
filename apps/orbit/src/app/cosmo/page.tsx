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
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to Enhanced Cosmo AI...</p>
      </div>
    </div>
  );
}
