# Nova Universe Design System Component Library
**Version 1.0** | Phase 3 Implementation | August 2025

---

## 🎯 Component Library Overview

This document provides comprehensive specifications for all UI components in the Nova Universe design system. Each component is designed for consistency, accessibility, and optimal user experience across all Nova modules.

---

## 🎨 Design Tokens Implementation

### CSS Custom Properties
```css
:root {
  /* Colors - Primary */
  --nova-blue-50: #EFF4FF;
  --nova-blue-400: #3F57FF;
  --nova-blue-500: #2847E8;
  --nova-blue-600: #1E39CC;
  
  /* Colors - Semantic */
  --success: #32D18A;
  --warning: #FFB02E;
  --error: #FF4D4F;
  --info: #3B82F6;
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  
  /* Radius */
  --radius-sm: 0.125rem;
  --radius-base: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

---

## 🧱 Core Components

### 1. Button Component

#### Variants
- **Primary**: Main call-to-action buttons
- **Secondary**: Secondary actions  
- **Outline**: Border-only style
- **Ghost**: Text-only style
- **Danger**: Destructive actions

#### Sizes
- **xs**: 24px height, 12px padding
- **sm**: 32px height, 16px padding  
- **md**: 40px height, 20px padding (default)
- **lg**: 48px height, 24px padding
- **xl**: 56px height, 28px padding

#### React Component Specification
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### CSS Implementation
```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-family);
  font-weight: 500;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 150ms ease;
  text-decoration: none;
}

.button--primary {
  background: var(--nova-blue-400);
  color: white;
  border-color: var(--nova-blue-400);
}

.button--primary:hover {
  background: var(--nova-blue-500);
  border-color: var(--nova-blue-500);
}

.button--primary:focus {
  outline: 2px solid var(--nova-blue-400);
  outline-offset: 2px;
}

.button--secondary {
  background: white;
  color: var(--nova-blue-400);
  border-color: var(--nova-blue-400);
}

.button--md {
  height: 40px;
  padding: 0 var(--space-5);
  font-size: var(--text-sm);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 2. Input Components

#### Text Input
```tsx
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  helper?: string;
  error?: string;
  label?: string;
}
```

#### Select Component
```tsx
interface SelectProps {
  options: Array<{value: string; label: string; disabled?: boolean}>;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  label?: string;
  helper?: string;
  error?: string;
}
```

#### Textarea Component
```tsx
interface TextareaProps {
  rows?: number;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  helper?: string;
  error?: string;
}
```

### 3. Card Component

#### Specifications
```tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}
```

#### CSS Implementation
```css
.card {
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 150ms ease;
}

.card--elevated {
  box-shadow: var(--shadow-md);
  border: none;
}

.card--hover:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

.card__header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--neutral-200);
  font-weight: 600;
}

.card__content {
  padding: var(--space-6);
}

.card__footer {
  padding: var(--space-6);
  border-top: 1px solid var(--neutral-200);
  background: var(--neutral-50);
}
```

### 4. Modal Component

#### Specifications
```tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

#### Accessibility Features
- Focus trap when open
- Return focus to trigger element on close
- Escape key to close
- Overlay click to close (optional)
- Proper ARIA attributes

### 5. Badge Component

#### Variants
```tsx
interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}
```

#### Status Badge Examples
- **Active**: Green background, white text
- **Pending**: Yellow background, dark text
- **Inactive**: Gray background, white text
- **Error**: Red background, white text

---

## 📱 Layout Components

### 1. Container Component
```tsx
interface ContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  center?: boolean;
  children: React.ReactNode;
}
```

### 2. Grid System
```tsx
interface GridProps {
  columns?: number | {sm?: number; md?: number; lg?: number; xl?: number};
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

interface GridItemProps {
  span?: number | {sm?: number; md?: number; lg?: number; xl?: number};
  children: React.ReactNode;
}
```

### 3. Stack Component
```tsx
interface StackProps {
  direction?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  children: React.ReactNode;
}
```

---

## 🎛️ Interactive Components

### 1. Tabs Component
```tsx
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}
```

### 2. Dropdown Menu
```tsx
interface DropdownMenuProps {
  trigger: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

interface DropdownMenuItemProps {
  disabled?: boolean;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect?: () => void;
  children: React.ReactNode;
}
```

### 3. Accordion Component
```tsx
interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  children: React.ReactNode;
}

interface AccordionItemProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}
```

---

## 📊 Data Display Components

### 1. Table Component
```tsx
interface TableProps {
  data: any[];
  columns: TableColumn[];
  sortable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  loading?: boolean;
  emptyState?: React.ReactNode;
}

interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}
```

### 2. Progress Components
```tsx
interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  label?: string;
}

interface ProgressCircularProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
}
```

### 3. Avatar Component
```tsx
interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  indicator?: 'online' | 'offline' | 'away' | 'busy';
  shape?: 'circle' | 'square';
}
```

---

## 🔔 Feedback Components

### 1. Alert Component
```tsx
interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  closable?: boolean;
  icon?: React.ReactNode;
  onClose?: () => void;
  children: React.ReactNode;
}
```

### 2. Toast Notification
```tsx
interface ToastProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  duration?: number;
  action?: {label: string; onClick: () => void};
  onClose?: () => void;
}
```

### 3. Loading States
```tsx
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary';
}
```

---

## 🎯 Form Components

### 1. Checkbox & Radio
```tsx
interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  description?: string;
  error?: string;
}

interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
}
```

### 2. Switch Component
```tsx
interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
}
```

---

## 🎨 Theme Configuration

### Dark Mode Implementation
```css
[data-theme="dark"] {
  --background: var(--dark-950);
  --surface: var(--dark-900);
  --text-primary: var(--dark-50);
  --text-secondary: var(--dark-300);
  --border: var(--dark-800);
}

.theme-provider {
  color-scheme: light dark;
  transition: background-color 200ms ease;
}
```

### Theme Provider Hook
```tsx
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
}

const useTheme = (): ThemeContextType => {
  // Implementation details
};
```

---

## ♿ Accessibility Guidelines

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Focus Management**: Visible focus indicators, logical tab order
- **Screen Readers**: Proper ARIA labels, roles, and descriptions
- **Motion**: Respect `prefers-reduced-motion` setting

### Component Accessibility Checklist
- [ ] Semantic HTML elements used where appropriate
- [ ] Proper ARIA attributes included
- [ ] Keyboard navigation support implemented
- [ ] Focus management for complex components
- [ ] Color is not the only means of conveying information
- [ ] Text alternatives provided for non-text content
- [ ] Error states clearly communicated

---

## 📋 Implementation Status

### Core Components Status
- [x] **Design Tokens** ✅ Defined
- [x] **Button Component** ✅ Specified
- [x] **Input Components** ✅ Specified
- [x] **Card Component** ✅ Specified
- [x] **Modal Component** ✅ Specified
- [x] **Badge Component** ✅ Specified

### Layout Components Status  
- [x] **Container** ✅ Specified
- [x] **Grid System** ✅ Specified
- [x] **Stack Component** ✅ Specified

### Interactive Components Status
- [x] **Tabs** ✅ Specified
- [x] **Dropdown Menu** ✅ Specified
- [x] **Accordion** ✅ Specified

### Data Display Status
- [x] **Table** ✅ Specified
- [x] **Progress** ✅ Specified
- [x] **Avatar** ✅ Specified

### Feedback Components Status
- [x] **Alert** ✅ Specified
- [x] **Toast** ✅ Specified
- [x] **Loading States** ✅ Specified

### Form Components Status
- [x] **Checkbox/Radio** ✅ Specified
- [x] **Switch** ✅ Specified

### Theme System Status
- [x] **Dark Mode** ✅ Specified
- [x] **Theme Provider** ✅ Specified

### Accessibility Status
- [x] **WCAG Guidelines** ✅ Documented
- [x] **Accessibility Checklist** ✅ Created

---

**Document Status**: ✅ Phase 3 Task 2 Complete  
**Last Updated**: August 9, 2025  
**Next Phase**: Task 3 - UX Workflow Design & User Journey Mapping
