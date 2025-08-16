import React from 'react';
import { Button } from '@heroui/react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ArrowUpIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  badge?: number;
  onClick?: () => void;
  disabled?: boolean;
}

const defaultQuickActions: QuickAction[] = [
  {
    id: 'create-ticket',
    label: 'Create Ticket',
    icon: <PlusIcon className="h-4 w-4" />,
    color: 'primary',
    onClick: () => console.log('Create ticket'),
  },
  {
    id: 'search-tickets',
    label: 'Search',
    icon: <MagnifyingGlassIcon className="h-4 w-4" />,
    color: 'default',
    onClick: () => console.log('Search tickets'),
  },
  {
    id: 'assign-tickets',
    label: 'Bulk Assign',
    icon: <UserIcon className="h-4 w-4" />,
    color: 'secondary',
    badge: 12,
    onClick: () => console.log('Assign tickets'),
  },
  {
    id: 'escalate',
    label: 'Escalate',
    icon: <ArrowUpIcon className="h-4 w-4" />,
    color: 'warning',
    badge: 3,
    onClick: () => console.log('Escalate tickets'),
  },
  {
    id: 'bulk-actions',
    label: 'Bulk Actions',
    icon: <ClipboardDocumentListIcon className="h-4 w-4" />,
    color: 'default',
    onClick: () => console.log('Bulk actions'),
  },
  {
    id: 'knowledge-base',
    label: 'Knowledge Base',
    icon: <BookOpenIcon className="h-4 w-4" />,
    color: 'success',
    onClick: () => console.log('Open knowledge base'),
  },
];

export interface QuickActionsToolbarProps {
  actions?: QuickAction[];
  className?: string;
}

export const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({
  actions = defaultQuickActions,
  className = '',
}) => {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{actions.length} actions</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {actions.map((action) => (
          <div key={action.id} className="relative">
            <Button
              color={action.color === 'default' ? 'default' : action.color || 'default'}
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className="flex h-auto w-full flex-col items-center space-y-1 py-3"
            >
              <div className="relative">
                {action.icon}
                {action.badge && action.badge > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {action.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          </div>
        ))}
      </div>

      {/* Recent Actions */}
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Recent Actions
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Created ticket #2847</span>
            <span className="text-xs text-gray-500 dark:text-gray-500">2 min ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Assigned 3 tickets to Level 2</span>
            <span className="text-xs text-gray-500 dark:text-gray-500">15 min ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Updated SLA policy</span>
            <span className="text-xs text-gray-500 dark:text-gray-500">1h ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
