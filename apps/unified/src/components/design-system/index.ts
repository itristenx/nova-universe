/**
 * Nova Universe Design System
 * Apple Liquid Glass 2025 Components
 * 
 * Production-ready component library with glassmorphism effects,
 * spring-based animations, and ServiceNow Next Experience parity.
 */

// ============================================================================
// Phase 1: Core Shell & Layout
// ============================================================================

export { LiquidGlassShell } from './LiquidGlassShell';

export { WorkspaceLayout, WorkspaceCard } from './WorkspaceLayout';
export type { WorkspaceLayoutProps, WorkspaceTab, WorkspaceCardProps } from './WorkspaceLayout';

export { ContextPanel, ContextPanelSection, ContextPanelField } from './ContextPanel';
export type { ContextPanelProps, ContextPanelSectionProps, ContextPanelFieldProps } from './ContextPanel';

// Feedback Components
export { DynamicIsland, useDynamicIsland } from './DynamicIsland';
export type { DynamicIslandProps, DynamicIslandNotification, DynamicIslandVariant } from './DynamicIsland';

// Data Display Components
export { DataGrid } from './DataGrid';
export type { DataGridProps, DataGridColumn } from './DataGrid';

// ============================================================================
// Phase 2: Core ITSM Components
// ============================================================================

// Forms
export { SmartForm } from './SmartForm';
export type { FormField, SmartFormProps } from './SmartForm';

// Activity & Timeline
export { Timeline, TimelineItem } from './Timeline';
export type { TimelineEvent } from './Timeline';

// Status & Metrics
export { StatusBadge, StatusBadgeGroup } from './StatusBadge';
export type { StatusBadgeVariant, StatusBadgeSize, StatusBadgeProps } from './StatusBadge';

export { MetricCard, MetricCardGrid } from './MetricCard';
export type { MetricTrend, MetricCardProps } from './MetricCard';

// Search & Navigation
export { SearchBar } from './SearchBar';
export type { SearchResult, SearchBarProps } from './SearchBar';

// Overlays & Dialogs
export { Modal, ModalButton, useConfirmModal } from './Modal';
export type { ModalSize, ModalProps } from './Modal';

export { Dropdown, DropdownButton } from './Dropdown';
export type { DropdownItem, DropdownProps } from './Dropdown';

// ============================================================================
// Legacy Components (to be upgraded to Liquid Glass)
// ============================================================================

export { AppleButton } from './AppleButton';
export { AppleCard } from './AppleCard';
export { AppleStatsCard } from './AppleStatsCard';
export { AppleTable } from './AppleTable';
export { AppleForm } from './AppleForm';
