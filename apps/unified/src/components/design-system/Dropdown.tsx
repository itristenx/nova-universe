import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  children?: DropdownItem[];
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  selected?: string;
  className?: string;
}

/**
 * Dropdown - Menu component with keyboard navigation and nested menus
 */
export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'left',
  selected,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const enabledItems = items.filter(item => !item.disabled && !item.divider);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < enabledItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : enabledItems.length - 1
        );
        break;
      case 'ArrowRight':
        if (focusedIndex >= 0 && enabledItems[focusedIndex]?.children) {
          e.preventDefault();
          setActiveSubmenu(enabledItems[focusedIndex].id);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setActiveSubmenu(null);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          const item = enabledItems[focusedIndex];
          if (item?.children) {
            setActiveSubmenu(item.id);
          } else {
            item?.onClick?.();
            setIsOpen(false);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (activeSubmenu) {
          setActiveSubmenu(null);
        } else {
          setIsOpen(false);
        }
        break;
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;

    if (item.children) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
    } else {
      item.onClick?.();
      setIsOpen(false);
      setActiveSubmenu(null);
    }
  };

  const renderItems = (itemList: DropdownItem[], isSubmenu = false) => {
    return itemList.map((item, index) => {
      if (item.divider) {
        return (
          <div
            key={item.id}
            className="my-1 h-px bg-gray-200/50 dark:bg-gray-700/50"
          />
        );
      }

      const isSelected = selected === item.id;
      const isFocused = focusedIndex === index && !isSubmenu;
      const hasSubmenu = item.children && item.children.length > 0;
      const submenuOpen = activeSubmenu === item.id;

      return (
        <div key={item.id} className="relative">
          <button
            onClick={() => handleItemClick(item)}
            onMouseEnter={() => hasSubmenu && setActiveSubmenu(item.id)}
            disabled={item.disabled}
            className={`
              w-full px-3 py-2
              flex items-center gap-3
              text-left
              font-sf-text text-sm
              transition-colors duration-200
              ${item.disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : item.danger
                  ? 'text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20'
                  : isFocused || submenuOpen
                    ? 'bg-apple-blue/10 dark:bg-apple-blue/20 text-apple-blue dark:text-apple-blue-dark'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
              }
            `}
            type="button"
          >
            {/* Icon */}
            {item.icon && (
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {item.icon}
              </span>
            )}

            {/* Label */}
            <span className="flex-1 truncate">
              {item.label}
            </span>

            {/* Selected indicator */}
            {isSelected && (
              <Check className="w-4 h-4 flex-shrink-0" />
            )}

            {/* Submenu indicator */}
            {hasSubmenu && (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
          </button>

          {/* Submenu */}
          {hasSubmenu && (
            <AnimatePresence>
              {submenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="
                    absolute left-full top-0 ml-1
                    min-w-[200px]
                    glass-heavy
                    rounded-apple-md
                    border border-gray-200/10 dark:border-gray-700/10
                    shadow-glass-lg
                    py-1
                    z-10
                  "
                >
                  {renderItems(item.children!, true)}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      );
    });
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger */}
      {/* eslint-disable-next-line */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
        className="appearance-none"
      >
        {trigger}
      </button>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
            className={`
              absolute top-full mt-2
              min-w-[200px]
              glass-heavy
              rounded-apple-md
              border border-gray-200/10 dark:border-gray-700/10
              shadow-glass-lg
              py-1
              z-50
              ${align === 'right' ? 'right-0' : 'left-0'}
            `}
          >
            {renderItems(items)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * DropdownButton - Trigger button with chevron
 */
export interface DropdownButtonProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({
  children,
  icon,
  variant = 'secondary',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-apple-blue dark:bg-apple-blue-dark text-white hover:bg-apple-blue/90 dark:hover:bg-apple-blue-dark/90',
    secondary: 'glass text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      className={`
        inline-flex items-center gap-2
        rounded-apple-sm
        font-sf-text font-medium
        transition-all duration-400 ease-apple
        hover-lift
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      type="button"
    >
      {icon}
      {children}
      <ChevronRight className="w-4 h-4 rotate-90" />
    </button>
  );
};
