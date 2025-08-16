import React, { ReactNode } from 'react';
import { Button, Card, CardHeader, CardBody } from '@heroui/react';
import {
  Bars3Icon,
  EllipsisVerticalIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export interface DashboardWidgetProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isCollapsed?: boolean;
  isDragging?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
  onResize?: () => void;
  className?: string;
}

const sizeClasses = {
  sm: 'col-span-1 row-span-1',
  md: 'col-span-2 row-span-1',
  lg: 'col-span-2 row-span-2',
  xl: 'col-span-3 row-span-2',
};

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  title,
  subtitle,
  icon,
  children,
  size = 'md',
  isCollapsed = false,
  isDragging = false,
  onToggleCollapse,
  onRemove,
  onResize,
  className = '',
}) => {
  const widgetClasses = `
    ${sizeClasses[size]}
    ${isDragging ? 'opacity-50' : ''}
    ${className}
  `.trim();

  return (
    <Card
      className={`${widgetClasses} transition-all duration-200 hover:shadow-lg`}
      shadow="sm"
      isHoverable
    >
      <CardHeader className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center space-x-3">
          <Button
            variant="light"
            size="sm"
            className="h-6 min-w-6 cursor-grab p-1 active:cursor-grabbing"
          >
            <Bars3Icon className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-2">
            {icon && <div className="text-gray-500 dark:text-gray-400">{icon}</div>}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
              {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {onToggleCollapse && (
            <Button
              variant="light"
              size="sm"
              onClick={onToggleCollapse}
              className="h-6 min-w-6 p-1"
            >
              {isCollapsed ? <PlusIcon className="h-3 w-3" /> : <MinusIcon className="h-3 w-3" />}
            </Button>
          )}

          {onResize && (
            <Button variant="light" size="sm" onClick={onResize} className="h-6 min-w-6 p-1">
              <PlusIcon className="h-3 w-3" />
            </Button>
          )}

          <Button variant="light" size="sm" className="h-6 min-w-6 p-1">
            <EllipsisVerticalIcon className="h-3 w-3" />
          </Button>

          {onRemove && (
            <Button
              variant="light"
              size="sm"
              onClick={onRemove}
              className="h-6 min-w-6 p-1 text-red-500 hover:text-red-700"
            >
              <XMarkIcon className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>

      {!isCollapsed && <CardBody className="p-4 pt-0">{children}</CardBody>}
    </Card>
  );
};
