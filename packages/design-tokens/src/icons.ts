/**
 * Iconography System for Nova Universe
 * Consistent icon system using Lucide React with Nova Universe styling
 */

// Common icon variants used throughout Nova Universe
export const iconMappings = {
  // Navigation icons
  dashboard: 'home',
  tickets: 'ticket',
  agents: 'users',
  reports: 'bar-chart-3',
  settings: 'settings',
  profile: 'user-circle',
  notifications: 'bell',
  search: 'search',
  menu: 'menu',
  close: 'x',
  
  // Action icons
  add: 'plus',
  edit: 'edit-3',
  delete: 'trash-2',
  save: 'save',
  cancel: 'x-circle',
  refresh: 'refresh-cw',
  download: 'download',
  upload: 'upload',
  share: 'share-2',
  copy: 'copy',
  
  // Status icons
  success: 'check-circle',
  warning: 'alert-triangle',
  error: 'x-circle',
  info: 'info',
  pending: 'clock',
  in_progress: 'play-circle',
  completed: 'check-circle-2',
  
  // Priority icons
  low: 'chevron-down',
  medium: 'minus',
  high: 'chevron-up',
  critical: 'alert-circle',
  
  // Ticket status icons
  open: 'circle',
  assigned: 'user-check',
  resolved: 'check-circle',
  closed: 'x-circle',
  
  // Communication icons
  chat: 'message-circle',
  email: 'mail',
  phone: 'phone',
  video: 'video',
  
  // File icons
  file: 'file',
  image: 'image',
  document: 'file-text',
  pdf: 'file-text',
  attachment: 'paperclip',
  
  // Arrows and navigation
  arrow_up: 'arrow-up',
  arrow_down: 'arrow-down',
  arrow_left: 'arrow-left',
  arrow_right: 'arrow-right',
  chevron_up: 'chevron-up',
  chevron_down: 'chevron-down',
  chevron_left: 'chevron-left',
  chevron_right: 'chevron-right',
  
  // UI elements
  filter: 'filter',
  sort: 'arrow-up-down',
  view_list: 'list',
  view_grid: 'grid-3x3',
  calendar: 'calendar',
  clock: 'clock',
  
  // User and team
  user: 'user',
  team: 'users',
  organization: 'building',
  
  // Technical icons
  api: 'code',
  database: 'database',
  server: 'server',
  monitor: 'monitor',
  mobile: 'smartphone',
  tablet: 'tablet',
  
  // Security
  lock: 'lock',
  unlock: 'unlock',
  security: 'shield',
  key: 'key',
  
  // Themes
  light: 'sun',
  dark: 'moon',
  auto: 'monitor',
  
  // Miscellaneous
  help: 'help-circle',
  external_link: 'external-link',
  star: 'star',
  bookmark: 'bookmark',
  tag: 'tag',
  location: 'map-pin'
} as const

// Icon size presets
export const iconSizes = {
  xs: 12,   // 12px
  sm: 16,   // 16px  
  md: 20,   // 20px
  lg: 24,   // 24px
  xl: 32,   // 32px
  '2xl': 48 // 48px
} as const

// CSS classes for icon sizes
export const iconSizeClasses = {
  xs: 'w-3 h-3',      // 12px
  sm: 'w-4 h-4',      // 16px
  md: 'w-5 h-5',      // 20px
  lg: 'w-6 h-6',      // 24px
  xl: 'w-8 h-8',      // 32px
  '2xl': 'w-12 h-12'  // 48px
} as const

// Common icon color schemes
export const iconColorClasses = {
  default: 'text-gray-600 dark:text-gray-400',
  primary: 'text-primary-600 dark:text-primary-400',
  secondary: 'text-gray-500 dark:text-gray-500',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  muted: 'text-gray-400 dark:text-gray-600',
  white: 'text-white',
  black: 'text-black dark:text-white'
} as const

// Icon variant definitions for different contexts
export const iconVariants = {
  // Button icons
  button: {
    size: 'sm' as const,
    className: 'mr-2'
  },
  
  // Navigation icons
  nav: {
    size: 'md' as const,
    className: 'mr-3'
  },
  
  // Status indicators
  status: {
    size: 'sm' as const,
    className: 'inline-block'
  },
  
  // Table cell icons
  table: {
    size: 'sm' as const,
    className: 'inline-block'
  },
  
  // Card header icons
  card: {
    size: 'lg' as const,
    className: 'mb-2'
  },
  
  // Notification icons
  notification: {
    size: 'md' as const,
    className: 'mr-3 flex-shrink-0'
  }
} as const

// Utility functions for icon system
export const getIconName = (semantic: keyof typeof iconMappings): string => {
  return iconMappings[semantic]
}

export const getIconClass = (
  size: keyof typeof iconSizes = 'md',
  color: keyof typeof iconColorClasses = 'default',
  additionalClasses = ''
): string => {
  const sizeClass = iconSizeClasses[size]
  const colorClass = iconColorClasses[color]
  
  return [sizeClass, colorClass, additionalClasses].filter(Boolean).join(' ')
}

// Generate Lucide icon import statements
export const generateIconImports = (icons: (keyof typeof iconMappings)[]): string => {
  const lucideIcons = icons.map(icon => iconMappings[icon])
  const uniqueIcons = [...new Set(lucideIcons)]
  
  // Convert kebab-case to PascalCase for Lucide imports
  const pascalCaseIcons = uniqueIcons.map(icon => {
    return icon
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
  })
  
  return `import { ${pascalCaseIcons.join(', ')} } from 'lucide-react'`
}

// Icon configuration for different Nova Universe apps
export const appIconSets = {
  core: [
    'dashboard', 'tickets', 'agents', 'reports', 'settings', 'profile',
    'add', 'edit', 'delete', 'search', 'filter', 'refresh', 'notifications'
  ],
  
  orbit: [
    'dashboard', 'tickets', 'profile', 'chat', 'help', 'search',
    'add', 'edit', 'file', 'attachment', 'calendar', 'notifications'
  ],
  
  pulse: [
    'dashboard', 'tickets', 'agents', 'reports', 'mobile', 'location',
    'add', 'edit', 'refresh', 'search', 'filter', 'clock', 'phone'
  ]
} as const

// Default icon props for consistency
export const defaultIconProps = {
  strokeWidth: 2,
  className: getIconClass('md', 'default')
} as const

export type NovaIconName = keyof typeof iconMappings
export type NovaIconSize = keyof typeof iconSizes  
export type NovaIconColor = keyof typeof iconColorClasses
export type NovaIconVariant = keyof typeof iconVariants
