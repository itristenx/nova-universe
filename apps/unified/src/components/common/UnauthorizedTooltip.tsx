/**
 * UnauthorizedTooltip Component
 * 
 * Shows a tooltip with a helpful message for unauthorized actions.
 * Wraps disabled buttons to provide context about why the action is unavailable.
 * 
 * @example
 * ```tsx
 * import { UnauthorizedTooltip } from '@components/common/UnauthorizedTooltip';
 * 
 * // Simple usage
 * <UnauthorizedTooltip>
 *   <button disabled className="opacity-50 cursor-not-allowed">
 *     Delete User
 *   </button>
 * </UnauthorizedTooltip>
 * 
 * // Custom message
 * <UnauthorizedTooltip message="Only approvers can approve changes">
 *   <button disabled>Approve</button>
 * </UnauthorizedTooltip>
 * 
 * // With contact link
 * <UnauthorizedTooltip showContact>
 *   <button disabled>Admin Settings</button>
 * </UnauthorizedTooltip>
 * ```
 */

import { ReactNode } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export interface UnauthorizedTooltipProps {
  /** Children to wrap (usually a disabled button) */
  children: ReactNode;
  
  /** Custom message to display (default: "You don't have permission for this action") */
  message?: string;
  
  /** Show "Contact admin" link (default: false) */
  showContact?: boolean;
  
  /** Custom contact email (default: admin@company.com) */
  contactEmail?: string;
  
  /** Required role name to show in tooltip (e.g., "Admin" → "This action requires Admin role") */
  requiredRole?: string;
  
  /** Required permission name to show in tooltip (e.g., "users:delete" → "This action requires users:delete permission") */
  requiredPermission?: string;
  
  /** Tooltip position (default: 'top') */
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * UnauthorizedTooltip Component
 * 
 * Provides helpful feedback to users when actions are disabled due to insufficient permissions.
 * Shows a tooltip on hover with a message explaining why the action is unavailable.
 */
export function UnauthorizedTooltip({
  children,
  message,
  showContact = false,
  contactEmail = 'admin@company.com',
  requiredRole,
  requiredPermission,
  position = 'top',
}: UnauthorizedTooltipProps) {
  // Build the tooltip message
  let tooltipMessage = message;
  
  if (!tooltipMessage) {
    if (requiredRole) {
      tooltipMessage = `This action requires ${requiredRole} role`;
    } else if (requiredPermission) {
      tooltipMessage = `This action requires ${requiredPermission} permission`;
    } else {
      tooltipMessage = "You don't have permission for this action";
    }
  }
  
  // Add contact message if requested
  const contactMessage = showContact 
    ? `Contact your administrator (${contactEmail}) to request access.`
    : '';
  
  // Determine tooltip position classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  
  return (
    <div className="group relative inline-flex">
      {/* Wrapped element (disabled button) */}
      {children}
      
      {/* Tooltip */}
      <div
        className={`
          pointer-events-none absolute z-50 
          ${positionClasses[position]}
          hidden group-hover:block
          w-64 rounded-lg bg-gray-900 dark:bg-gray-800
          px-3 py-2 text-sm text-white shadow-lg
          transition-opacity duration-200
        `}
      >
        {/* Arrow */}
        <div
          className={`
            absolute h-2 w-2 rotate-45 bg-gray-900 dark:bg-gray-800
            ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
            ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
            ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
          `}
        />
        
        {/* Content */}
        <div className="relative flex items-start gap-2">
          <InformationCircleIcon className="h-5 w-5 flex-shrink-0 text-blue-400" />
          <div className="flex-1">
            <p className="font-medium">{tooltipMessage}</p>
            {contactMessage && (
              <p className="mt-1 text-xs text-gray-300">{contactMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DisabledButton Component
 * 
 * Pre-styled disabled button with tooltip.
 * Convenience component for common use case.
 * 
 * @example
 * ```tsx
 * <DisabledButton 
 *   tooltip="Only admins can delete users"
 *   onClick={() => {}} // Will not fire
 * >
 *   Delete User
 * </DisabledButton>
 * ```
 */
export interface DisabledButtonProps {
  /** Button text or content */
  children: ReactNode;
  
  /** Tooltip message */
  tooltip?: string;
  
  /** Required role */
  requiredRole?: string;
  
  /** Required permission */
  requiredPermission?: string;
  
  /** Show contact link */
  showContact?: boolean;
  
  /** Button variant (default: 'primary') */
  variant?: 'primary' | 'secondary' | 'danger';
  
  /** Button size (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  
  /** Additional className */
  className?: string;
  
  /** Icon component to show before text */
  icon?: ReactNode;
}

export function DisabledButton({
  children,
  tooltip,
  requiredRole,
  requiredPermission,
  showContact = false,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
}: DisabledButtonProps) {
  // Button variant classes
  const variantClasses = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-600 text-white',
    danger: 'bg-red-600 text-white',
  };
  
  // Button size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <UnauthorizedTooltip
      message={tooltip}
      requiredRole={requiredRole}
      requiredPermission={requiredPermission}
      showContact={showContact}
    >
      <button
        disabled
        className={`
          inline-flex items-center gap-2 rounded-lg font-medium
          opacity-50 cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
      >
        {icon}
        {children}
      </button>
    </UnauthorizedTooltip>
  );
}

/**
 * ReadOnlyBadge Component
 * 
 * Small badge to indicate read-only access.
 * Useful for showing at the top of pages.
 * 
 * @example
 * ```tsx
 * <ReadOnlyBadge message="Contact admin for edit access" />
 * ```
 */
export interface ReadOnlyBadgeProps {
  /** Custom message (default: "Read-only access") */
  message?: string;
  
  /** Show contact link */
  showContact?: boolean;
  
  /** Position (default: 'inline') */
  position?: 'inline' | 'floating';
}

export function ReadOnlyBadge({
  message = 'Read-only access',
  showContact = true,
  position = 'inline',
}: ReadOnlyBadgeProps) {
  const positionClasses = position === 'floating'
    ? 'fixed top-4 right-4 z-40'
    : '';
  
  return (
    <div className={`${positionClasses}`}>
      <div className="inline-flex items-center gap-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 px-3 py-2 text-sm text-yellow-800 dark:text-yellow-200">
        <InformationCircleIcon className="h-4 w-4" />
        <span className="font-medium">{message}</span>
        {showContact && (
          <span className="text-xs">
            • <button className="underline hover:no-underline">Request access</button>
          </span>
        )}
      </div>
    </div>
  );
}
