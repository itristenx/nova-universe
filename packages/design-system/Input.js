/**
 * Nova Universe Input Component
 * Phase 3 Implementation - Form input with design tokens
 */

import { colors, spacing, typography, borderRadius, transitions } from './tokens';

const inputStyles = `
.nova-input {
  /* Base styles */
  font-family: ${typography.fontFamily.sans.join(', ')};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.normal};
  line-height: ${typography.lineHeight.normal};
  
  /* Layout */
  display: block;
  width: 100%;
  height: ${spacing[10]};
  
  /* Spacing */
  padding: 0 ${spacing[3]};
  
  /* Appearance */
  background-color: ${colors.background};
  border: 1px solid ${colors.muted}40;
  border-radius: ${borderRadius.md};
  color: ${colors.content};
  
  /* Transitions */
  transition: all ${transitions.duration[150]} ${transitions.easing.inOut};
  
  /* Focus state */
  outline: none;
}

.nova-input:focus {
  border-color: ${colors.primary};
  box-shadow: 0 0 0 3px ${colors.primary}20;
}

.nova-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: ${colors.surface};
}

.nova-input::placeholder {
  color: ${colors.muted};
}

/* Size variants */
.nova-input--sm {
  height: ${spacing[8]};
  padding: 0 ${spacing[2]};
  font-size: ${typography.fontSize.sm};
}

.nova-input--lg {
  height: ${spacing[12]};
  padding: 0 ${spacing[4]};
  font-size: ${typography.fontSize.lg};
}

/* State variants */
.nova-input--error {
  border-color: ${colors.error};
}

.nova-input--error:focus {
  border-color: ${colors.error};
  box-shadow: 0 0 0 3px ${colors.error}20;
}

.nova-input--success {
  border-color: ${colors.success};
}

.nova-input--success:focus {
  border-color: ${colors.success};
  box-shadow: 0 0 0 3px ${colors.success}20;
}

/* Input group styles */
.nova-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.nova-input-group .nova-input {
  position: relative;
  z-index: 1;
}

.nova-input-group__addon {
  display: flex;
  align-items: center;
  padding: 0 ${spacing[3]};
  background-color: ${colors.surface};
  border: 1px solid ${colors.muted}40;
  font-size: ${typography.fontSize.sm};
  color: ${colors.muted};
}

.nova-input-group__addon--prepend {
  border-right: none;
  border-radius: ${borderRadius.md} 0 0 ${borderRadius.md};
}

.nova-input-group__addon--append {
  border-left: none;
  border-radius: 0 ${borderRadius.md} ${borderRadius.md} 0;
}

.nova-input-group__addon--prepend + .nova-input {
  border-radius: 0 ${borderRadius.md} ${borderRadius.md} 0;
}

.nova-input-group .nova-input + .nova-input-group__addon--append {
  border-radius: 0 ${borderRadius.md} ${borderRadius.md} 0;
}

/* Label styles */
.nova-label {
  display: block;
  font-family: ${typography.fontFamily.sans.join(', ')};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.content};
  margin-bottom: ${spacing[1]};
}

.nova-label--required::after {
  content: ' *';
  color: ${colors.error};
}

/* Help text styles */
.nova-help-text {
  margin-top: ${spacing[1]};
  font-size: ${typography.fontSize.xs};
  color: ${colors.muted};
}

.nova-help-text--error {
  color: ${colors.error};
}

.nova-help-text--success {
  color: ${colors.success};
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = inputStyles;
  document.head.appendChild(styleElement);
}

export default function Input({
  type = 'text',
  size = 'md',
  state,
  disabled = false,
  placeholder,
  value,
  onChange,
  className = '',
  ...props
}) {
  const baseClasses = 'nova-input';
  const sizeClass = `nova-input--${size}`;
  const stateClass = state ? `nova-input--${state}` : '';
  
  const allClasses = [baseClasses, sizeClass, stateClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <input
      type={type}
      className={allClasses}
      disabled={disabled}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

// Label component
export function Label({ children, required = false, htmlFor, className = '' }) {
  const labelClasses = `nova-label ${required ? 'nova-label--required' : ''} ${className}`;
  
  return (
    <label htmlFor={htmlFor} className={labelClasses}>
      {children}
    </label>
  );
}

// Help text component
export function _HelpText({ children, state, className = '' }) {
  const helpClasses = `nova-help-text ${state ? `nova-help-text--${state}` : ''} ${className}`;
  
  return (
    <div className={helpClasses}>
      {children}
    </div>
  );
}

// Input group component
export function _InputGroup({ children, className = '' }) {
  return (
    <div className={`nova-input-group ${className}`}>
      {children}
    </div>
  );
}

// Input addon component
export function _InputAddon({ children, position = 'prepend', className = '' }) {
  const addonClasses = `nova-input-group__addon nova-input-group__addon--${position} ${className}`;
  
  return (
    <div className={addonClasses}>
      {children}
    </div>
  );
}
