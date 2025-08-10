import React from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface AlertStatsWidgetProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'red' | 'orange' | 'green' | 'purple' | 'gray';
  onClick?: () => void;
}

const AlertStatsWidget: React.FC<AlertStatsWidgetProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
  onClick
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-200',
      gradient: 'from-blue-500/10 to-blue-600/10'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      border: 'border-red-200',
      gradient: 'from-red-500/10 to-red-600/10'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      border: 'border-orange-200',
      gradient: 'from-orange-500/10 to-orange-600/10'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-200',
      gradient: 'from-green-500/10 to-green-600/10'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      border: 'border-purple-200',
      gradient: 'from-purple-500/10 to-purple-600/10'
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      border: 'border-gray-200',
      gradient: 'from-gray-500/10 to-gray-600/10'
    }
  };

  const classes = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: onClick ? 1.02 : 1, y: onClick ? -2 : 0 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`
        relative overflow-hidden
        p-6 bg-white/80 backdrop-blur-xl
        border border-gray-200/50 rounded-2xl
        shadow-sm hover:shadow-md
        transition-all duration-300 ease-out
        ${onClick ? 'cursor-pointer' : ''}
        group
      `}
      onClick={onClick}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${classes.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 ${classes.bg} border ${classes.border} rounded-xl`}>
            <Icon className={`w-6 h-6 ${classes.icon}`} />
          </div>
          
          {trend && (
            <div className={`
              flex items-center space-x-1 px-2 py-1 rounded-lg
              ${trend.isPositive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
              }
            `}>
              {trend.isPositive ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {trend.value}%
              </span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <motion.span 
            className="text-3xl font-bold text-gray-900"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {value}
          </motion.span>
        </div>

        {/* Title */}
        <p className="text-gray-600 font-medium">
          {title}
        </p>
      </div>

      {/* Hover Effect Shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
    </motion.div>
  );
};

export default AlertStatsWidget;
