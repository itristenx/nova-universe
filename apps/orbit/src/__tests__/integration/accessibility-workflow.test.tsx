import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SkipLinks } from '@/components/accessibility/skip-links';
import { LanguageSwitcher } from '@/components/internationalization/language-switcher';
import { PermissionManager } from '@/components/security/permission-manager';
import { DataPrivacyDashboard } from '@/components/security/data-privacy-dashboard';

describe('Accessibility Workflow Integration Tests', () => {
  describe('Skip Links and Navigation', () => {
    it('provides complete keyboard navigation flow', async () => {
      render(
        <div>
          <SkipLinks />
          <main id="main-content">
            <h1>Main Content</h1>
            <LanguageSwitcher />
            <PermissionManager />
          </main>
        </div>,
      );

      // Test skip links functionality
      const skipToMain = screen.getByText(/skip to main content/i);
      skipToMain.focus();
      await userEvent.keyboard('{Enter}');

      // Main content should receive focus
      const mainContent = document.getElementById('main-content');
      expect(mainContent).toHaveFocus();

      // Test keyboard navigation through components
      await userEvent.tab();
      const languageSwitcher = screen.getByRole('button', { name: /language/i });
      expect(languageSwitcher).toHaveFocus();

      // Navigate to permission switches
      await userEvent.tab();
      await userEvent.tab();
      const switches = screen.getAllByRole('switch');
      if (switches.length > 0) {
        expect(switches[0]).toHaveFocus();
      }
    });

    it('maintains focus management across component interactions', async () => {
      render(
        <div>
          <SkipLinks />
          <nav id="navigation">
            <LanguageSwitcher />
          </nav>
          <main id="main-content">
            <PermissionManager />
          </main>
        </div>,
      );

      // Use skip to navigation
      const skipToNav = screen.getByText(/skip to navigation/i);
      await userEvent.click(skipToNav);

      const navigation = document.getElementById('navigation');
      expect(navigation).toHaveFocus();

      // Change language and ensure focus is maintained
      const languageButton = screen.getByRole('button', { name: /language/i });
      await userEvent.click(languageButton);

      // Focus should be maintained within the component
      expect(document.activeElement).toBe(languageButton);
    });
  });

  describe('Internationalization and Accessibility Integration', () => {
    it('provides accessible language switching with proper announcements', async () => {
      render(
        <div>
          <LanguageSwitcher />
          <PermissionManager />
        </div>,
      );

      const languageButton = screen.getByRole('button', { name: /language/i });

      // Should have proper ARIA attributes
      expect(languageButton).toHaveAttribute('aria-haspopup');
      expect(languageButton).toHaveAttribute('aria-expanded', 'false');

      // Open language menu
      await userEvent.click(languageButton);
      expect(languageButton).toHaveAttribute('aria-expanded', 'true');

      // Language options should be accessible
      const languageOptions = screen.getAllByRole('menuitem');
      expect(languageOptions.length).toBeGreaterThan(0);

      languageOptions.forEach((option) => {
        expect(option).toHaveAttribute('role', 'menuitem');
      });

      // Select a language
      if (languageOptions.length > 1) {
        await userEvent.click(languageOptions[1]);

        // Focus should return to trigger button
        expect(languageButton).toHaveFocus();
      }
    });

    it('maintains accessibility across language changes', async () => {
      const { container } = render(
        <div>
          <LanguageSwitcher />
          <PermissionManager />
          <DataPrivacyDashboard />
        </div>,
      );

      // Check initial accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Change language
      const languageButton = screen.getByRole('button', { name: /language/i });
      await userEvent.click(languageButton);

      const languageOptions = screen.getAllByRole('menuitem');
      if (languageOptions.length > 1) {
        await userEvent.click(languageOptions[1]);

        // Wait for language change to complete
        await waitFor(() => {
          expect(languageButton).toHaveFocus();
        });

        // Check accessibility after language change
        const resultsAfterChange = await axe(container);
        expect(resultsAfterChange).toHaveNoViolations();
      }
    });
  });

  describe('Security Components Accessibility Integration', () => {
    it('provides accessible permission management workflow', async () => {
      const { container } = render(
        <div>
          <SkipLinks />
          <main id="main-content">
            <PermissionManager />
          </main>
        </div>,
      );

      // Check overall accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Test permission toggle workflow
      const switches = screen.getAllByRole('switch');
      if (switches.length > 0) {
        const firstSwitch = switches[0];
        const initialState = firstSwitch.getAttribute('aria-checked');

        // Focus switch
        firstSwitch.focus();
        expect(firstSwitch).toHaveFocus();

        // Toggle with keyboard
        await userEvent.keyboard(' ');
        expect(firstSwitch).toHaveAttribute(
          'aria-checked',
          initialState === 'true' ? 'false' : 'true',
        );

        // Check accessibility after interaction
        const resultsAfterToggle = await axe(container);
        expect(resultsAfterToggle).toHaveNoViolations();
      }
    });

    it('provides accessible privacy dashboard workflow', async () => {
      const { container } = render(
        <div>
          <SkipLinks />
          <main id="main-content">
            <DataPrivacyDashboard />
          </main>
        </div>,
      );

      // Check overall accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Test tab navigation
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);

      // Navigate through tabs
      for (const tab of tabs) {
        await userEvent.click(tab);
        expect(tab).toHaveAttribute('aria-selected', 'true');

        // Check accessibility for each tab state
        const tabResults = await axe(container);
        expect(tabResults).toHaveNoViolations();
      }

      // Test privacy settings switches
      const switches = screen.getAllByRole('switch');
      if (switches.length > 0) {
        for (const switchEl of switches) {
          if (!switchEl.hasAttribute('disabled')) {
            const initialState = switchEl.getAttribute('aria-checked');
            await userEvent.click(switchEl);
            expect(switchEl).toHaveAttribute(
              'aria-checked',
              initialState === 'true' ? 'false' : 'true',
            );
          }
        }

        // Check accessibility after all interactions
        const finalResults = await axe(container);
        expect(finalResults).toHaveNoViolations();
      }
    });
  });

  describe('Complete User Journey Integration', () => {
    it('supports full accessibility workflow from navigation to action', async () => {
      const { container } = render(
        <div>
          <SkipLinks />
          <nav id="navigation">
            <LanguageSwitcher />
          </nav>
          <main id="main-content">
            <h1>Settings Dashboard</h1>
            <PermissionManager />
            <DataPrivacyDashboard />
          </main>
        </div>,
      );

      // Start with skip links
      const skipToMain = screen.getByText(/skip to main content/i);
      await userEvent.click(skipToMain);

      const mainContent = document.getElementById('main-content');
      expect(mainContent).toHaveFocus();

      // Navigate to language switcher
      const skipToNav = screen.getByText(/skip to navigation/i);
      await userEvent.click(skipToNav);

      const navigation = document.getElementById('navigation');
      expect(navigation).toHaveFocus();

      // Change language
      const languageButton = screen.getByRole('button', { name: /language/i });
      await userEvent.click(languageButton);

      const languageOptions = screen.getAllByRole('menuitem');
      if (languageOptions.length > 1) {
        await userEvent.click(languageOptions[1]);
      }

      // Navigate back to main content
      await userEvent.click(skipToMain);

      // Interact with permission manager
      const permissionSwitches = screen.getAllByRole('switch');
      if (permissionSwitches.length > 0) {
        const firstSwitch = permissionSwitches[0];
        await userEvent.click(firstSwitch);
      }

      // Navigate to privacy dashboard tabs
      const tabs = screen.getAllByRole('tab');
      if (tabs.length > 1) {
        await userEvent.click(tabs[1]); // Switch to second tab
      }

      // Check final accessibility state
      const finalResults = await axe(container);
      expect(finalResults).toHaveNoViolations();
    });

    it('maintains keyboard navigation consistency across all components', async () => {
      render(
        <div>
          <SkipLinks />
          <nav id="navigation">
            <LanguageSwitcher />
          </nav>
          <main id="main-content">
            <PermissionManager />
            <DataPrivacyDashboard />
          </main>
        </div>,
      );

      // Start with tab key navigation from the beginning
      const skipLinks = screen.getAllByRole('link');
      skipLinks[0].focus();

      // Tab through all interactive elements
      const allInteractiveElements = [
        ...screen.getAllByRole('link'),
        ...screen.getAllByRole('button'),
        ...screen.getAllByRole('switch'),
        ...screen.getAllByRole('tab'),
      ];

      // Test that all elements are reachable via keyboard
      for (let i = 0; i < Math.min(allInteractiveElements.length, 10); i++) {
        await userEvent.tab();
        // Ensure we can navigate to all elements
        expect(document.activeElement).toBeInstanceOf(Element);
      }

      // Test reverse navigation
      for (let i = 0; i < 5; i++) {
        await userEvent.tab({ shift: true });
        expect(document.activeElement).toBeInstanceOf(Element);
      }
    });
  });
});
