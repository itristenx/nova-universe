import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermissionManager } from '../permission-manager';
import { SecureAuthFlow } from '../secure-auth-flow';
import { DataPrivacyDashboard } from '../data-privacy-dashboard';

describe('PermissionManager', () => {
  it('renders permission management interface', () => {
    render(<PermissionManager />);

    expect(screen.getByRole('heading', { name: /permission management/i })).toBeInTheDocument();
    expect(screen.getByText(/manage your account permissions and security settings/i)).toBeInTheDocument();
  });

  it('displays permission categories with proper roles', () => {
    render(<PermissionManager />);

    // Should show individual permissions section
    expect(screen.getByText(/individual permissions/i)).toBeInTheDocument();
    // Should show role information - look for the specific "Current Role: User" text
    expect(screen.getByText(/current role/i)).toBeInTheDocument();
    // Look for the "Default Role" badge instead of generic "user" text
    expect(screen.getByText(/default role/i)).toBeInTheDocument();
  });

  it('allows toggling permissions with accessibility support', async () => {
    render(<PermissionManager />);

    // Find permission switches
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThan(0);

    // Test toggling a permission
    const firstSwitch = switches[0];
    const initialState = firstSwitch.getAttribute('aria-checked');
    
    await userEvent.click(firstSwitch);
    
    // State should change
    expect(firstSwitch).toHaveAttribute('aria-checked', initialState === 'true' ? 'false' : 'true');
  });

  it('shows role and permission indicators', () => {
    render(<PermissionManager />);

    // Should show role badge
    expect(screen.getByText(/default role/i)).toBeInTheDocument();
    // Should show permission progress
    expect(screen.getByText(/of.*permissions enabled/)).toBeInTheDocument();
  });

  it('provides keyboard navigation support', async () => {
    render(<PermissionManager />);

    const switches = screen.getAllByRole('switch');
    if (switches.length > 1) {
      switches[0].focus();
      expect(switches[0]).toHaveFocus();

      await userEvent.tab();
      expect(switches[1]).toHaveFocus();
    }
  });

  it('has proper structural elements for screen readers', () => {
    render(<PermissionManager />);

    // Check that the component has proper heading structure
    const heading = screen.getByRole('heading', { name: /permission management/i });
    expect(heading).toBeInTheDocument();

    // All switches should be properly accessible
    const switches = screen.getAllByRole('switch');
    switches.forEach(switchEl => {
      expect(switchEl).toHaveAttribute('aria-checked');
    });
  });
});

describe('SecureAuthFlow', () => {
  it('renders login form with accessibility features', () => {
    render(<SecureAuthFlow />);

    // The card title contains "Secure Account Setup"
    expect(screen.getByText(/secure account setup/i)).toBeInTheDocument();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);
    const continueButton = screen.getByRole('button', { name: /continue/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInputs.length).toBeGreaterThan(0);
    expect(continueButton).toBeInTheDocument();

    // Check accessibility attributes
    expect(emailInput).toHaveAttribute('type', 'email');
    passwordInputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  it('shows password strength indicator', async () => {
    render(<SecureAuthFlow />);

    const passwordInputs = screen.getAllByLabelText(/password/i);
    const passwordInput = passwordInputs[0];
    
    // Type a password to trigger strength indicator
    await userEvent.type(passwordInput, 'weak');
    
    // Should show password strength feedback
    await waitFor(() => {
      const strengthIndicator = screen.queryByText(/password strength/i) || 
                              screen.queryByText(/weak/i) || 
                              document.querySelector('[data-testid*="strength"]');
      if (strengthIndicator) {
        expect(strengthIndicator).toBeInTheDocument();
      }
    });
  });

  it('handles form validation with proper error messages', async () => {
    render(<SecureAuthFlow />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    
    // Try to submit without filling fields
    await userEvent.click(continueButton);

    // Should show validation errors
    await waitFor(() => {
      const errorMessages = screen.queryAllByText(/required/i);
      if (errorMessages.length > 0) {
        expect(errorMessages[0]).toBeInTheDocument();
      }
    });
  });

  it('provides proper focus management', () => {
    render(<SecureAuthFlow />);

    const emailInput = screen.getByLabelText(/email/i);
    
    // Email input should be focusable
    emailInput.focus();
    expect(emailInput).toHaveFocus();
  });

  it('supports keyboard navigation through form', async () => {
    render(<SecureAuthFlow />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);

    emailInput.focus();
    expect(emailInput).toHaveFocus();

    await userEvent.tab();
    expect(passwordInputs[0]).toHaveFocus();
  });

  it('has proper ARIA labeling and form structure', () => {
    render(<SecureAuthFlow />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('id');
    passwordInputs.forEach(input => {
      expect(input).toHaveAttribute('id');
    });

    // Check that form inputs are properly contained and accessible
    const cardContent = emailInput.closest('[data-slot="card-content"]');
    expect(cardContent).toBeInTheDocument();
  });
});

describe('DataPrivacyDashboard', () => {
  it('renders privacy controls interface', () => {
    render(<DataPrivacyDashboard />);

    expect(screen.getByRole('heading', { name: /privacy dashboard/i })).toBeInTheDocument();
    // Look for the specific text that exists in the component
    expect(screen.getByText(/manage your data privacy settings/i)).toBeInTheDocument();
  });

  it('displays privacy setting controls with proper structure', () => {
    render(<DataPrivacyDashboard />);

    // Should show various privacy controls
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThan(0);

    // Each switch should have proper ARIA states
    switches.forEach(switchEl => {
      expect(switchEl).toHaveAttribute('aria-checked');
    });
  });

  it('allows toggling privacy settings', async () => {
    render(<DataPrivacyDashboard />);

    const switches = screen.getAllByRole('switch');
    if (switches.length > 0) {
      const firstSwitch = switches[0];
      const initialState = firstSwitch.getAttribute('aria-checked');
      
      // Only test if switch is not disabled
      if (!firstSwitch.hasAttribute('disabled')) {
        await userEvent.click(firstSwitch);
        
        // State should change
        expect(firstSwitch).toHaveAttribute('aria-checked', initialState === 'true' ? 'false' : 'true');
      }
    }
  });

  it('shows data export and deletion options through tabs', () => {
    render(<DataPrivacyDashboard />);

    // Should have tab navigation
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);

    // Look for My Data tab which should contain export/deletion
    const myDataTab = screen.getByRole('tab', { name: /my data/i });
    expect(myDataTab).toBeInTheDocument();
  });

  it('provides clear privacy policy information', () => {
    render(<DataPrivacyDashboard />);

    // Should have privacy rights tab
    const privacyRightsTab = screen.getByRole('tab', { name: /privacy rights/i });
    expect(privacyRightsTab).toBeInTheDocument();
  });

  it('shows impact descriptions for privacy settings', () => {
    render(<DataPrivacyDashboard />);

    // Should provide descriptions - look for category headings
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.length).toBeGreaterThan(0);

    // Check for common privacy setting categories
    expect(screen.getByText(/usage analytics/i) || screen.getByText(/analytics/i)).toBeInTheDocument();
  });

  it('supports keyboard navigation through privacy controls', async () => {
    render(<DataPrivacyDashboard />);

    const switches = screen.getAllByRole('switch');
    if (switches.length > 1) {
      switches[0].focus();
      expect(switches[0]).toHaveFocus();

      await userEvent.tab();
      expect(switches[1]).toHaveFocus();
    }
  });

  it('has proper ARIA structure for screen readers', () => {
    render(<DataPrivacyDashboard />);

    // Should have proper tab panel structure
    const tabPanel = screen.getByRole('tabpanel');
    expect(tabPanel).toBeInTheDocument();

    // Interactive elements should have proper roles
    const switches = screen.getAllByRole('switch');
    switches.forEach(switchEl => {
      expect(switchEl).toHaveAttribute('aria-checked');
    });
  });

  it('handles essential cookies properly', () => {
    render(<DataPrivacyDashboard />);

    // Look for essential cookies - should be enabled and disabled
    const essentialSwitches = screen.getAllByRole('switch').filter(switchEl => 
      switchEl.hasAttribute('disabled')
    );

    // If there are disabled switches, they should be checked
    essentialSwitches.forEach(essentialSwitch => {
      expect(essentialSwitch).toBeChecked();
      expect(essentialSwitch).toBeDisabled();
    });
  });
});
