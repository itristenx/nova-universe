# Nova Universe Branding Guide

This document provides an overview of the branding system for Nova Universe, including design tokens, components, and usage guidelines.

---

## Design Tokens

### Colors
Refer to `assets/branding/color-palette.json` for the full color palette.

### Typography
- **Headings**: Sans-serif, bold, modern.
- **Body Text**: Sans-serif, regular weight.
- Fonts: "Inter", "Roboto", "SF Pro Display/Text".

---

## Components

### Button
- **File**: `src/components/Button.js`
- **Styles**: `src/components/Button.css`
- **Props**:
  - `label` (string, required): The text displayed on the button.
  - `onClick` (function, required): The function to call when the button is clicked.
  - `type` (string, optional): The button style (`primary`, `secondary`, `danger`). Default is `primary`.
  - `disabled` (boolean, optional): Whether the button is disabled. Default is `false`.

---

## Mockups and Wireframes

### Integration Management
- **Wireframe**: `design/wireframes/integration-management.md`
- **Mockup**: `design/mockups/integration-management.md`

---

## Usage

- Follow the style guide in `docs/style-guide.md`.
- Use the component library in `src/components` for consistent UI.
- Refer to mockups and wireframes for layout and flow.
