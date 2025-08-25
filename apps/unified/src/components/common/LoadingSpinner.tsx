import { cn } from '@utils/index';
import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={cn(
          'border-t-nova-600 animate-spin rounded-full border-2 border-gray-300',
          sizeClasses[size],
          className,
        )}
      />
      {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
      {!text && <p className="text-sm text-gray-600 dark:text-gray-400">{t('loading')}</p>}
    </div>
  );
}
