# Nova Universe Design System

This folder contains the starter design system for Nova Universe. It includes:

- **tokens.js**: Centralized design tokens for colors, spacing, and typography.
- **Button.js**: Example reusable React component using tokens.

## Usage

Import tokens and components in your modules:

```js
import { colors, spacing, fontSizes } from '../design-system/tokens';
import Button from '../design-system/Button';
```

# Button Component Refactor: Unified Design System

## What Changed

- Button.js now imports design tokens from `design/theme.js`.
- Button.css uses CSS variables for colors, font, and spacing.
- All style values are now controlled by the design system tokens.

## Usage

```js
import Button from '../src/components/Button';
```

## Next Steps

- Refactor other components (Card, Input, Modal, etc.) to use tokens.
- Update Tailwind config to reference theme.js tokens.
- Document token usage and enforce via code review.
- Test for visual and functional correctness.

## Next Steps

- Add more components (Input, Card, Modal, etc.)
- Expand tokens for more design properties
- Integrate with Storybook or Bit.dev for documentation and isolated development
- Document usage and contribution guidelines
