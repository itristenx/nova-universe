import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  description?: string;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  default: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  success: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  danger: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  primary: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
};

const sizeClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
  if (trend === 'up') {
    return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
  }
  if (trend === 'down') {
    return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
  }
  return <MinusIcon className="h-4 w-4 text-gray-400" />;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  description,
  color = 'default',
  size = 'md',
}) => {
  return (
    <Card className="w-full" shadow="sm" isHoverable>
      <CardBody className={sizeClasses[size]}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              {icon && <div className={`rounded-lg p-2 ${colorClasses[color]}`}>{icon}</div>}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                  {change && (
                    <div className="flex items-center space-x-1">
                      <TrendIcon trend={change.trend} />
                      <span
                        className={`text-sm font-medium ${
                          change.trend === 'up'
                            ? 'text-green-600 dark:text-green-400'
                            : change.trend === 'down'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {change.value}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {description && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
