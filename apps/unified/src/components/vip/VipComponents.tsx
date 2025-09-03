import React from 'react';

interface VipBadgeProps {
  isVip: boolean;
  vipLevel?: 'priority' | 'gold' | 'exec';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const VipBadge: React.FC<VipBadgeProps> = ({ 
  isVip, 
  vipLevel = 'priority', 
  size = 'md',
  showText = true 
}) => {
  if (!isVip) return null;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const levelConfig = {
    priority: {
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-800 dark:text-blue-200',
      borderColor: 'border-blue-200 dark:border-blue-700',
      icon: '⭐',
      label: 'Priority'
    },
    gold: {
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
      icon: '🌟',
      label: 'Gold'
    },
    exec: {
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      textColor: 'text-purple-800 dark:text-purple-200',
      borderColor: 'border-purple-200 dark:border-purple-700',
      icon: '👑',
      label: 'Executive'
    }
  };

  const config = levelConfig[vipLevel];

  return (
    <span 
      className={`
        inline-flex items-center rounded-full border font-medium
        ${sizeClasses[size]}
        ${config.bgColor}
        ${config.textColor}
        ${config.borderColor}
      `}
      title={`VIP ${config.label} User`}
    >
      <span className="mr-1">{config.icon}</span>
      {showText && <span>VIP</span>}
    </span>
  );
};

interface VipTicketIndicatorProps {
  ticket: {
    isVip?: boolean;
    vipLevel?: string;
    vipPriorityScore?: number;
    priority?: string;
  };
  className?: string;
}

export const VipTicketIndicator: React.FC<VipTicketIndicatorProps> = ({ 
  ticket, 
  className = '' 
}) => {
  if (!ticket.isVip) return null;

  const priorityColors = {
    CRITICAL: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    HIGH: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    MEDIUM: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    LOW: 'border-green-500 bg-green-50 dark:bg-green-900/20'
  };

  const borderColor = priorityColors[ticket.priority as keyof typeof priorityColors] || 
                      'border-blue-500 bg-blue-50 dark:bg-blue-900/20';

  return (
    <div className={`border-l-4 pl-2 ${borderColor} ${className}`}>
      <div className="flex items-center space-x-2">
        <VipBadge 
          isVip={ticket.isVip} 
          vipLevel={ticket.vipLevel as any} 
          size="sm" 
        />
        {ticket.vipPriorityScore && ticket.vipPriorityScore > 0 && (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Priority Score: {ticket.vipPriorityScore}
          </span>
        )}
      </div>
    </div>
  );
};

interface VipNotificationProps {
  type: 'created' | 'escalated' | 'sla_breach';
  ticket: {
    ticketNumber?: string;
    title?: string;
    vipLevel?: string;
    priority?: string;
  };
  onClose?: () => void;
}

export const VipNotification: React.FC<VipNotificationProps> = ({ 
  type, 
  ticket, 
  onClose 
}) => {
  const typeConfig = {
    created: {
      icon: '🌟',
      title: 'VIP Ticket Created',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700'
    },
    escalated: {
      icon: '🚨',
      title: 'VIP Ticket Escalated',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-700'
    },
    sla_breach: {
      icon: '⚠️',
      title: 'VIP SLA Breach Warning',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-700'
    }
  };

  const config = typeConfig[type];

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-xl">{config.icon}</span>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {config.title}
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Ticket #{ticket.ticketNumber}: {ticket.title}
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <VipBadge 
                isVip={true} 
                vipLevel={ticket.vipLevel as any} 
                size="sm" 
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Priority: {ticket.priority}
              </span>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default {
  VipBadge,
  VipTicketIndicator,
  VipNotification
};