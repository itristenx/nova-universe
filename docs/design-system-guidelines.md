# Nova Universe Design System Guidelines

## Overview
This design system uses centralized design tokens (colors, fonts, spacing) defined in `/design/theme.ts` and injected as CSS variables at the root via the `ThemeProvider`. All UI components should use these tokens for consistent, scalable styling.

## Usage
- **Access tokens in CSS:** Use CSS variables, e.g. `var(--color-primary)`, `var(--font-sans)`, `var(--spacing-md)`.
- **Access tokens in JS/TS:** Import from `/design/theme.ts`.
- **Component styling:** Use external CSS files for each component. Reference tokens via CSS variables.
- **Theme switching:** The `ThemeProvider` injects tokens and handles light/dark/system mode.

## Adding New Tokens
1. Edit `/design/theme.ts` to add new colors, fonts, or spacing values.
2. Tokens will be injected automatically as CSS variables at the root.
3. Use new tokens in component CSS as `var(--color-yourtoken)` etc.

## Components Inventory
- Button
- Card
- Input
- Select
- Modal
- Checkbox
- Radio
- Switch
- Textarea
- Tooltip
- Avatar
- Badge/Tag
- Alert/Notification
- Loader/Spinner
- Skeleton Loader
- Progress Bar
- Pagination
- Tabs
- Drawer/Sidebar
- Stepper
- Accordion/Collapse
- Menu/Dropdown
- Snackbar/Toast

## Usage Examples
See `/showcase` route in the app for live usage and code examples of every component.

## Contributing New Components
- Place new UI components in `/nova-core/src/components/ui/`.
- Use external CSS files and reference tokens via CSS variables.
- Add a demo to the Showcase page for easy testing and documentation.
- Document props and usage in the component file.
- Ensure visual and functional consistency with existing components.

## Best Practices
- Use atomic/component-based design for reusability.
- Prefer CSS variables for all styling.
- Test components visually and functionally before merging.
- Update documentation when adding new tokens or components.

## Example
```css
.button {
  background: var(--color-primary);
  color: var(--color-base);
  font-family: var(--font-sans);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--spacing-xs);
}
```

## Questions?
Contact the design system maintainers or open an issue in the repo.

## Universal Login Component
- The `LoginPage` in `/nova-core/src/pages/auth/LoginPage.tsx` is a universal, context-aware login component.
- It detects and adapts to SSO (SAML/Okta), passkey (WebAuthn), and local login contexts.
- Supports dynamic branding, error states, and server status/configuration.
- To extend: add new login methods, customize branding, or enhance context detection in this file.
- This is the only login entry point and should be used for all authentication flows.
