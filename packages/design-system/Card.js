/**
 * Nova Universe Card Component
 * Phase 3 Implementation - Card component with design tokens
 */

import { colors, spacing, borderRadius, shadows } from './tokens';

const cardStyles = `
.nova-card {
  /* Base styles */
  background-color: ${colors.background};
  border: 1px solid ${colors.muted}20;
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.sm};
  overflow: hidden;
  transition: all 150ms ease-in-out;
}

.nova-card:hover {
  box-shadow: ${shadows.md};
}

/* Card variants */
.nova-card--elevated {
  box-shadow: ${shadows.lg};
  border: none;
}

.nova-card--flat {
  box-shadow: none;
  border: 1px solid ${colors.muted}40;
}

.nova-card--outlined {
  box-shadow: none;
  border: 2px solid ${colors.primary}20;
}

/* Interactive card */
.nova-card--interactive {
  cursor: pointer;
  transition: all 150ms ease-in-out;
}

.nova-card--interactive:hover {
  transform: translateY(-2px);
  box-shadow: ${shadows.xl};
}

.nova-card--interactive:active {
  transform: translateY(0);
  box-shadow: ${shadows.md};
}

/* Card sections */
.nova-card__header {
  padding: ${spacing[6]};
  border-bottom: 1px solid ${colors.muted}20;
  background-color: ${colors.surface};
}

.nova-card__body {
  padding: ${spacing[6]};
}

.nova-card__footer {
  padding: ${spacing[6]};
  border-top: 1px solid ${colors.muted}20;
  background-color: ${colors.surface};
}

/* Compact padding variant */
.nova-card--compact .nova-card__header,
.nova-card--compact .nova-card__body,
.nova-card--compact .nova-card__footer {
  padding: ${spacing[4]};
}

/* No padding variant */
.nova-card--no-padding .nova-card__body {
  padding: 0;
}

/* Card title */
.nova-card__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${colors.content};
  line-height: 1.5;
}

/* Card subtitle */
.nova-card__subtitle {
  margin: ${spacing[1]} 0 0 0;
  font-size: 0.875rem;
  color: ${colors.muted};
  line-height: 1.4;
}

/* Card text */
.nova-card__text {
  margin: 0;
  color: ${colors.content};
  line-height: 1.5;
}

/* Card media */
.nova-card__media {
  width: 100%;
  height: auto;
  display: block;
}

/* Card actions */
.nova-card__actions {
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  margin-top: ${spacing[4]};
}

.nova-card__actions--right {
  justify-content: flex-end;
}

.nova-card__actions--center {
  justify-content: center;
}

.nova-card__actions--between {
  justify-content: space-between;
}

/* Status variants */
.nova-card--success {
  border-left: 4px solid ${colors.success};
}

.nova-card--warning {
  border-left: 4px solid ${colors.warning};
}

.nova-card--error {
  border-left: 4px solid ${colors.error};
}

.nova-card--info {
  border-left: 4px solid ${colors.info};
}

/* Loading state */
.nova-card--loading {
  position: relative;
  overflow: hidden;
}

.nova-card--loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    ${colors.muted}20,
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = cardStyles;
  document.head.appendChild(styleElement);
}

export default function Card({
  children,
  variant = 'default',
  padding = 'default',
  interactive = false,
  loading = false,
  status,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses = 'nova-card';
  const variantClass = variant !== 'default' ? `nova-card--${variant}` : '';
  const paddingClass = padding !== 'default' ? `nova-card--${padding}` : '';
  const interactiveClass = interactive ? 'nova-card--interactive' : '';
  const loadingClass = loading ? 'nova-card--loading' : '';
  const statusClass = status ? `nova-card--${status}` : '';

  const allClasses = [
    baseClasses,
    variantClass,
    paddingClass,
    interactiveClass,
    loadingClass,
    statusClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={allClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

// Card Header component
export function CardHeader({ children, className = '' }) {
  return <div className={`nova-card__header ${className}`}>{children}</div>;
}

// Card Body component
export function CardBody({ children, className = '' }) {
  return <div className={`nova-card__body ${className}`}>{children}</div>;
}

// Card Footer component
export function CardFooter({ children, className = '' }) {
  return <div className={`nova-card__footer ${className}`}>{children}</div>;
}

// Card Title component
export function CardTitle({ children, className = '' }) {
  return <h3 className={`nova-card__title ${className}`}>{children}</h3>;
}

// Card Subtitle component
export function CardSubtitle({ children, className = '' }) {
  return <p className={`nova-card__subtitle ${className}`}>{children}</p>;
}

// Card Text component
export function CardText({ children, className = '' }) {
  return <p className={`nova-card__text ${className}`}>{children}</p>;
}

// Card Actions component
export function CardActions({ children, justify = 'left', className = '' }) {
  const justifyClass = justify !== 'left' ? `nova-card__actions--${justify}` : '';

  return <div className={`nova-card__actions ${justifyClass} ${className}`}>{children}</div>;
}
