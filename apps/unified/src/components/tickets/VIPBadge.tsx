import React from 'react';
import { cn } from '@utils/index';

interface VIPBadgeProps {
  isVip: boolean;
  vipLevel?: string;
  showDetails?: boolean;
  className?: string;
}

interface VIPIdentification {
  badge: string;
  level: string;
  description: string;
  priority: string;
  icon: string;
  color: string;
  slaHighlight?: string;
}

const VIP_IDENTIFICATION_MAP: Record<string, VIPIdentification> = {
  executive: {
    badge: 'EXEC VIP',
    level: 'Executive',
    description: 'Executive VIP - Immediate escalation required',
    priority: 'critical',
    icon: '👑',
    color: 'purple',
    slaHighlight: 'Executive SLA (2-30min response)'
  },
  exec: {
    badge: 'EXEC VIP',
    level: 'Executive',
    description: 'Executive VIP - Immediate escalation required',
    priority: 'critical',
    icon: '👑',
    color: 'purple',
    slaHighlight: 'Executive SLA (2-30min response)'
  },
  gold: {
    badge: 'GOLD VIP',
    level: 'Gold',
    description: 'Gold VIP - Enhanced support with dedicated agent',
    priority: 'high',
    icon: '⭐',
    color: 'yellow',
    slaHighlight: 'VIP SLA (5min-2hr response)'
  },
  priority: {
    badge: 'VIP',
    level: 'Priority',
    description: 'VIP User - Priority support',
    priority: 'elevated',
    icon: '🌟',
    color: 'blue',
    slaHighlight: 'VIP SLA (5min-2hr response)'
  }
};

const getVIPStyles = (color: string) => {
  const styleMap = {
    purple: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
    blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    gray: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700'
  };
  return styleMap[color as keyof typeof styleMap] || styleMap.gray;
};

export function VIPBadge({ isVip, vipLevel, showDetails = false, className }: VIPBadgeProps) {
  if (!isVip) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium',
        getVIPStyles('gray'),
        className
      )}>
        <span>👤</span>
        <span>Standard</span>
      </span>
    );
  }

  const identification = VIP_IDENTIFICATION_MAP[vipLevel || 'priority'];

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium',
          getVIPStyles(identification.color)
        )}
        title={identification.description}
      >
        <span>{identification.icon}</span>
        <span>{identification.badge}</span>
      </span>
      
      {showDetails && (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <div className="font-medium">{identification.description}</div>
          {identification.slaHighlight && (
            <div className="text-xs opacity-75">{identification.slaHighlight}</div>
          )}
        </div>
      )}
    </div>
  );
}

export function VIPPriorityBoost({ 
  basePriority, 
  finalPriority, 
  boostReason, 
  className 
}: { 
  basePriority: number;
  finalPriority: number;
  boostReason?: string;
  className?: string;
}) {
  const getPriorityLabel = (priority: number) => {
    const labels = { 1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low' };
    return labels[priority as keyof typeof labels] || 'Unknown';
  };

  const getPriorityColor = (priority: number) => {
    const colors = {
      1: 'text-red-600',
      2: 'text-orange-600',
      3: 'text-yellow-600',
      4: 'text-blue-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  const boosted = finalPriority !== basePriority;

  return (
    <div className={cn('inline-flex items-center gap-2 text-xs', className)}>
      <span className={cn('font-medium', getPriorityColor(basePriority))}>
        {getPriorityLabel(basePriority)}
      </span>
      
      {boosted && (
        <>
          <span className="text-gray-400">→</span>
          <div className="flex items-center gap-1">
            <span className="text-green-600">🚀</span>
            <span className={cn('font-medium', getPriorityColor(finalPriority))}>
              {getPriorityLabel(finalPriority)}
            </span>
          </div>
          {boostReason && (
            <span className="text-xs text-gray-500" title={boostReason}>
              (+{basePriority - finalPriority})
            </span>
          )}
        </>
      )}
    </div>
  );
}

export default VIPBadge;