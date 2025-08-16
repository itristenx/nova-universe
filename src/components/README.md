# Component Library

This directory contains reusable UI components for Nova Universe.

## Components

### Button

- **File**: `Button.js`
- **Styles**: `Button.css`
- **Description**: A reusable button component with primary, secondary, and danger styles.
- **Props**:
  - `label` (string, required): The text displayed on the button.
  - `onClick` (function, required): The function to call when the button is clicked.
  - `type` (string, optional): The button style (`primary`, `secondary`, `danger`). Default is `primary`.
  - `disabled` (boolean, optional): Whether the button is disabled. Default is `false`.

---

## Usage

```jsx
import Button from './Button';

<Button label="Click Me" onClick={() => alert('Button clicked!')} type="primary" />;
```
