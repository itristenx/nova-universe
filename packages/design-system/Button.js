/**
 * Nova Universe Button Component
 * Phase 3 Implementation - Updated to use unified design tokens
 */

import { colors, spacing, typography, borderRadius, transitions } from './tokens';

// Button CSS styles using design tokens
const buttonStyles = `
.nova-button {
  /* Base styles using design tokens */
  font-family: ${typography.fontFamily.sans.join(', ')};
  font-weight: ${typography.fontWeight.medium};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.none};
  
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing[2]};
  
  /* Spacing */
  padding: ${spacing[2]} ${spacing[4]};
  
  /* Appearance */
  border: none;
  border-radius: ${borderRadius.md};
  cursor: pointer;
  text-decoration: none;
  
  /* Transitions */
  transition: all ${transitions.duration[150]} ${transitions.easing.inOut};
  
  /* Focus state */
  position: relative;
  outline: none;
}

.nova-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.nova-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Size Variants */
.nova-button--sm {
  padding: ${spacing[1]} ${spacing[3]};
  font-size: ${typography.fontSize.sm};
  height: ${spacing[8]};
}

.nova-button--md {
  padding: ${spacing[2]} ${spacing[4]};
  font-size: ${typography.fontSize.base};
  height: ${spacing[10]};
}

.nova-button--lg {
  padding: ${spacing[3]} ${spacing[6]};
  font-size: ${typography.fontSize.lg};
  height: ${spacing[12]};
}

/* Style Variants */
.nova-button--primary {
  background-color: ${colors.primary};
  color: white;
}

.nova-button--primary:hover:not(:disabled) {
  background-color: ${colors.primary}dd;
  transform: translateY(-1px);
}

.nova-button--secondary {
  background-color: ${colors.secondary};
  color: white;
}

.nova-button--secondary:hover:not(:disabled) {
  background-color: ${colors.secondary}dd;
  transform: translateY(-1px);
}

.nova-button--accent {
  background-color: ${colors.accent};
  color: white;
}

.nova-button--accent:hover:not(:disabled) {
  background-color: ${colors.accent}dd;
  transform: translateY(-1px);
}

.nova-button--outline {
  background-color: transparent;
  color: ${colors.primary};
  border: 1px solid ${colors.primary};
}

.nova-button--outline:hover:not(:disabled) {
  background-color: ${colors.primary};
  color: white;
}

.nova-button--ghost {
  background-color: transparent;
  color: ${colors.content};
}

.nova-button--ghost:hover:not(:disabled) {
  background-color: ${colors.surface};
}

.nova-button--success {
  background-color: ${colors.success};
  color: white;
}

.nova-button--success:hover:not(:disabled) {
  background-color: ${colors.success}dd;
  transform: translateY(-1px);
}

.nova-button--warning {
  background-color: ${colors.warning};
  color: white;
}

.nova-button--warning:hover:not(:disabled) {
  background-color: ${colors.warning}dd;
  transform: translateY(-1px);
}

.nova-button--error {
  background-color: ${colors.error};
  color: white;
}

.nova-button--error:hover:not(:disabled) {
  background-color: ${colors.error}dd;
  transform: translateY(-1px);
}

/* Loading state */
.nova-button--loading {
  color: transparent;
}

.nova-button--loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Icon buttons */
.nova-button--icon-only {
  padding: ${spacing[2]};
  width: ${spacing[10]};
  height: ${spacing[10]};
}

.nova-button--icon-only.nova-button--sm {
  width: ${spacing[8]};
  height: ${spacing[8]};
}

.nova-button--icon-only.nova-button--lg {
  width: ${spacing[12]};
  height: ${spacing[12]};
}
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = buttonStyles;
  document.head.appendChild(styleElement);
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  iconOnly = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseClasses = 'nova-button';
  const variantClass = `nova-button--${variant}`;
  const sizeClass = `nova-button--${size}`;
  const loadingClass = loading ? 'nova-button--loading' : '';
  const iconOnlyClass = iconOnly ? 'nova-button--icon-only' : '';

  const allClasses = [baseClasses, variantClass, sizeClass, loadingClass, iconOnlyClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={allClasses}
      disabled={disabled || loading}
      onClick={onClick}
      aria-disabled={disabled || loading}
      aria-label={iconOnly && !children ? 'Button' : undefined}
      aria-busy={loading}
      role="button"
      {...props}
    >
      {children}
    </button>
  );
}

// Named exports for different button types
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const AccentButton = (props) => <Button variant="accent" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const WarningButton = (props) => <Button variant="warning" {...props} />;
export const ErrorButton = (props) => <Button variant="error" {...props} />;
