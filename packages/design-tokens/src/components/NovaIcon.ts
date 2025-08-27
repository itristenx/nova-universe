/**
 * Nova Icon Component
 * Provides icon functionality for Nova Universe applications
 */

// Import icon mappings and utilities
import { iconSizeClasses, iconColorClasses, iconVariants } from '../icon-styles';

// Define basic types
export type NovaIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type NovaIconColor = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'muted' | 'inverse';
export type NovaIconVariant = 'nav' | 'button' | 'status' | 'action';

// Define NovaIconProps interface
export interface NovaIconProps {
  name: string;
  size?: NovaIconSize | number;
  color?: NovaIconColor;
  variant?: NovaIconVariant;
  className?: string;
  [key: string]: any;
}

// Icon mappings for common Nova Universe icons
export const iconMappings: Record<string, string> = {
  // Navigation icons
  dashboard: 'layout-dashboard',
  tickets: 'ticket',
  assets: 'package',
  users: 'users',
  reports: 'bar-chart',
  settings: 'settings',
  notifications: 'bell',
  profile: 'user',
  
  // Action icons
  add: 'plus',
  edit: 'edit',
  delete: 'trash',
  save: 'save',
  cancel: 'x',
  close: 'x',
  refresh: 'refresh-cw',
  search: 'search',
  filter: 'filter',
  sort: 'arrow-up-down',
  
  // Status icons
  success: 'check-circle',
  warning: 'alert-triangle',
  error: 'alert-circle',
  info: 'info',
  
  // Feature icons
  spaces: 'building',
  bookings: 'calendar',
  analytics: 'trending-up',
  integrations: 'link',
  automation: 'zap',
  ai: 'brain',
};

/**
 * Get icon class name with proper styling
 */
export const getIconClass = (
  size: NovaIconSize = 'md',
  color: NovaIconColor = 'default',
  variant?: NovaIconVariant
): string => {
  const sizeClass = iconSizeClasses[size];
  const colorClass = variant ? iconVariants[variant].className : iconColorClasses[color];
  
  return `${sizeClass} ${colorClass}`.trim();
};

/**
 * Get the icon component based on the icon name
 */
export const getNovaIcon = async (iconName: string) => {
  // Implementation note: This function requires Lucide React to be installed
  // in the consuming application: npm install lucide-react
  
  const getLucideIcon = async (iconName: string) => {
    const pascalCase = iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
    
    // Try to import Lucide icons dynamically
    try {
      // Dynamic import for Lucide React (optional dependency)
      const LucideIcons = await import(/* webpackChunkName: "lucide-react" */ 'lucide-react').catch(() => null);
      if (LucideIcons) {
        return LucideIcons[pascalCase as keyof typeof LucideIcons];
      }
    } catch (error) {
      console.warn(`Lucide React not available for icon: ${iconName}`, error);
    }
    return null;
  }

  // Try to get the Lucide icon first
  const LucideIcon = await getLucideIcon(iconName);
  if (LucideIcon) {
    return LucideIcon;
  }

  throw new Error(`Icon implementation needed for: ${iconName}`);
};



/**
 * Nova Icon Component
 * Returns a properly styled icon component
 */
export const NovaIcon: React.FC<NovaIconProps> = ({ 
  name, 
  size, 
  color, 
  variant, 
  className, 
  ..._props 
}) => {
  // Implementation would go here
  // This is a placeholder for the actual icon component
  throw new Error(`NovaIcon component needs to be implemented in consuming application`);
};
