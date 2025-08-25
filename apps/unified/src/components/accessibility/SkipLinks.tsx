import { useTranslation } from 'react-i18next';

interface SkipLink {
  href: string;
  label: string;
  shortcut?: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'skipLinks.mainContent', shortcut: 'Alt+M' },
  { href: '#navigation', label: 'skipLinks.navigation', shortcut: 'Alt+N' },
  { href: '#search', label: 'skipLinks.search', shortcut: 'Alt+S' },
  { href: '#help', label: 'skipLinks.help', shortcut: 'Alt+H' },
];

export default function SkipLinks({ links = defaultLinks, className = '' }: SkipLinksProps) {
  const { t } = useTranslation(['accessibility', 'common']);

  const handleSkipClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    const target = document.querySelector(href);
    if (target) {
      // Focus the target element
      if (target instanceof HTMLElement) {
        target.focus();

        // If target isn't naturally focusable, make it temporarily focusable
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
          target.addEventListener(
            'blur',
            () => {
              target.removeAttribute('tabindex');
            },
            { once: true },
          );
        }

        // Scroll to target with smooth behavior
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  return (
    <div className={`skip-links ${className}`}>
      {links.map((link, index) => (
        <a
          key={`${link.href}-${index}`}
          href={link.href}
          onClick={(e) => handleSkipClick(e, link.href)}
          className="skip-link"
          data-shortcut={link.shortcut}
          title={link.shortcut ? `${t(link.label)} (${link.shortcut})` : t(link.label)}
        >
          {t(link.label)}
          {link.shortcut && (
            <span className="skip-link-shortcut" aria-hidden="true">
              {link.shortcut}
            </span>
          )}
        </a>
      ))}

      <style>{`
        .skip-links {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #000;
          color: #fff;
          padding: 8px;
          text-decoration: none;
          border-radius: 4px;
          z-index: 9999;
        }
        .skip-links:focus {
          top: 6px;
        }
        .skip-links:hover {
          background: #333;
        }
        .skip-links:focus-visible {
          outline: 2px solid #4f46e5;
        }
      `}</style>
    </div>
  );
}

// Hook for managing skip links and keyboard shortcuts
export function useSkipLinks() {
  const { t } = useTranslation(['accessibility']);

  const registerShortcuts = () => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Skip links shortcuts (Alt + key)
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'm':
            e.preventDefault();
            focusElement('#main-content');
            break;
          case 'n':
            e.preventDefault();
            focusElement('#navigation');
            break;
          case 's':
            e.preventDefault();
            focusElement('#search');
            break;
          case 'h':
            e.preventDefault();
            focusElement('#help');
            break;
          case '/':
            e.preventDefault();
            showKeyboardShortcuts();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  };

  const focusElement = (selector: string) => {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement) {
      element.focus();

      // Make temporarily focusable if needed
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1');
        element.addEventListener(
          'blur',
          () => {
            element.removeAttribute('tabindex');
          },
          { once: true },
        );
      }

      // Scroll into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const showKeyboardShortcuts = () => {
    // This could open a modal or sidebar with all available shortcuts
    console.log('Keyboard shortcuts:', {
      'Alt+M': t('accessibility:skipLinks.mainContent'),
      'Alt+N': t('accessibility:skipLinks.navigation'),
      'Alt+S': t('accessibility:skipLinks.search'),
      'Alt+H': t('accessibility:skipLinks.help'),
      'Alt+/': t('accessibility:skipLinks.showShortcuts'),
      Esc: t('accessibility:skipLinks.close'),
      Tab: t('accessibility:skipLinks.nextElement'),
      'Shift+Tab': t('accessibility:skipLinks.previousElement'),
    });
  };

  return {
    registerShortcuts,
    focusElement,
    showKeyboardShortcuts,
  };
}
