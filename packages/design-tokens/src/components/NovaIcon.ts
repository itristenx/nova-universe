/**
 * Nova Icon Component
 * Wrapper for Lucide React icons with Nova Universe styling
 */

import {
  iconMappings,
  iconSizes,
  iconSizeClasses,
  iconColorClasses,
  iconVariants,
  getIconClass,
  type NovaIconName,
  type NovaIconSize,
  type NovaIconColor,
  type NovaIconVariant,
} from '../icons';

// Basic icon props interface (compatible with lucide-react)
export interface BaseIconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: any;
  onClick?: (event: any) => void;
}

// Type definitions
export interface NovaIconProps extends Omit<BaseIconProps, 'size'> {
  name: NovaIconName;
  size?: NovaIconSize | number;
  color?: NovaIconColor;
  variant?: NovaIconVariant;
  className?: string;
}

/**
 * Helper function to get the Lucide icon component
 * This needs to be implemented with dynamic imports in the consuming app
 */
export const getLucideIcon = (iconName: string) => {
  // Icon retrieval function for Nova Universe design system
  // This function maps icon names to Lucide React icon components
  //
  // Implementation note: This function requires Lucide React to be installed
  // in the consuming application: npm install lucide-react
  //
  // const getLucideIcon = (iconName: string) => {
  //   const pascalCase = iconName
  //     .split('-')
  //     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join('')
  //   return LucideIcons[pascalCase as keyof typeof LucideIcons]
  // }

  throw new Error(`Icon implementation needed for: ${iconName}`);
};

/**
 * Nova Icon Component Props Interface (for consuming apps)
 */
export interface NovaIconComponentProps extends NovaIconProps {}

/**
 * Utility function to generate the correct className for icons
 */
export const getNovaIconClassName = (
  size?: NovaIconSize | number,
  color?: NovaIconColor,
  variant?: NovaIconVariant,
  className?: string,
): string => {
  const classes: string[] = [];

  // Handle variant styling
  if (variant && iconVariants[variant]) {
    const variantConfig = iconVariants[variant];
    classes.push(iconSizeClasses[variantConfig.size]);
    classes.push(variantConfig.className);
  } else {
    // Handle size
    if (typeof size === 'string' && size in iconSizeClasses) {
      classes.push(iconSizeClasses[size]);
    }

    // Handle color
    if (color && color in iconColorClasses) {
      classes.push(iconColorClasses[color]);
    } else {
      classes.push(iconColorClasses.default);
    }
  }

  // Add custom className
  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
};

/**
 * Get the numeric size value for Lucide icons
 */
export const getNumericSize = (size?: NovaIconSize | number): number => {
  if (typeof size === 'number') {
    return size;
  }

  if (size && size in iconSizes) {
    return iconSizes[size];
  }

  return iconSizes.md; // default size
};

/**
 * Icon implementation guide for consuming applications
 */
export const iconImplementationGuide = `
// 1. Install lucide-react in your app:
// npm install lucide-react

// 2. Create a NovaIcon component in your app:

import React from 'react'
import * as LucideIcons from 'lucide-react'
import { 
  NovaIconProps, 
  getNovaIconClassName, 
  getNumericSize,
  iconMappings 
} from '@nova-universe/design-tokens'

export const NovaIcon: React.FC<NovaIconProps> = ({ 
  name, 
  size, 
  color, 
  variant, 
  className, 
  ...props 
}) => {
  // Get the Lucide icon name
  const lucideName = iconMappings[name]
  
  // Convert to PascalCase for Lucide import
  const pascalCase = lucideName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
  
  // Get the icon component
  const IconComponent = LucideIcons[pascalCase as keyof typeof LucideIcons]
  
  if (!IconComponent) {
    console.warn(\`Icon not found: \${lucideName} (mapped from \${name})\`)
    return null
  }
  
  return (
    <IconComponent
      size={getNumericSize(size)}
      className={getNovaIconClassName(size, color, variant, className)}
      {...props}
    />
  )
}

// 3. Use the icon in your components:
// <NovaIcon name="dashboard" size="md" color="primary" />
// <NovaIcon name="add" variant="button" />
// <NovaIcon name="success" color="success" size="lg" />
`;

/**
 * Export icon presets for common use cases
 */
export const iconPresets = {
  // Button icons
  buttonAdd: { name: 'add' as NovaIconName, variant: 'button' as NovaIconVariant },
  buttonEdit: { name: 'edit' as NovaIconName, variant: 'button' as NovaIconVariant },
  buttonDelete: { name: 'delete' as NovaIconName, variant: 'button' as NovaIconVariant },
  buttonSave: { name: 'save' as NovaIconName, variant: 'button' as NovaIconVariant },

  // Navigation icons
  navDashboard: { name: 'dashboard' as NovaIconName, variant: 'nav' as NovaIconVariant },
  navTickets: { name: 'tickets' as NovaIconName, variant: 'nav' as NovaIconVariant },
  navAgents: { name: 'agents' as NovaIconName, variant: 'nav' as NovaIconVariant },
  navReports: { name: 'reports' as NovaIconName, variant: 'nav' as NovaIconVariant },

  // Status icons
  statusSuccess: {
    name: 'success' as NovaIconName,
    variant: 'status' as NovaIconVariant,
    color: 'success' as NovaIconColor,
  },
  statusWarning: {
    name: 'warning' as NovaIconName,
    variant: 'status' as NovaIconVariant,
    color: 'warning' as NovaIconColor,
  },
  statusError: {
    name: 'error' as NovaIconName,
    variant: 'status' as NovaIconVariant,
    color: 'error' as NovaIconColor,
  },
  statusInfo: {
    name: 'info' as NovaIconName,
    variant: 'status' as NovaIconVariant,
    color: 'info' as NovaIconColor,
  },
} as const;

// Re-export everything from the icons module
export * from '../icons';
