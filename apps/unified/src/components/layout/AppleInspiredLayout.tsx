import { ReactNode } from 'react';
import { AppleInspiredNavigation } from '@components/navigation/AppleInspiredNavigation';
import { cn } from '@utils/index';

interface AppleInspiredLayoutProps {
  children: ReactNode;
  className?: string;
  showNavigation?: boolean;
}

export function AppleInspiredLayout({ 
  children, 
  className, 
  showNavigation = true 
}: AppleInspiredLayoutProps) {
  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {showNavigation && (
        <AppleInspiredNavigation />
      )}
      <main className={cn(
        'flex-1 flex flex-col min-w-0 overflow-hidden',
        className
      )}>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}