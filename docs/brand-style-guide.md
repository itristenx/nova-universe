# Nova Universe Brand Style Guide
**Version 1.0** | Phase 3 Implementation | August 2025

---

## 🎯 Brand Vision

**Mission**: Transform IT service management through an intuitive, space-inspired universe of interconnected modules.

**Vision**: To be the leading enterprise ITSM platform that makes complex workflows feel effortless and engaging.

**Brand Personality**: 
- **Professional**: Enterprise-grade reliability and security
- **Innovative**: Cutting-edge AI and automation capabilities  
- **Approachable**: User-friendly interfaces that reduce cognitive load
- **Unified**: Cohesive experience across all touchpoints

---

## 🎨 Visual Identity

### Logo Usage

| Context | Logo Variant | Usage Guidelines |
|---------|-------------|------------------|
| **Light Backgrounds** | Nova_Universe_Dark.png | Primary logo for web interfaces, documents |
| **Dark Backgrounds** | Nova_Universe_Light.png | Dark mode interfaces, presentations |
| **Monochrome** | SVG outline version | Favicons, watermarks, single-color applications |
| **Icon Only** | "N" lettermark | Mobile app icons, small spaces |

**Logo Clear Space**: Minimum clear space = height of the "N" in Nova
**Minimum Size**: 120px wide for digital, 1 inch for print

### Color Palette

#### Primary Colors
```css
/* Nova Blue - Primary brand color */
--nova-blue-50: #EFF4FF
--nova-blue-100: #DBE5FF  
--nova-blue-200: #BFD2FF
--nova-blue-300: #93B5FF
--nova-blue-400: #3F57FF  /* Primary */
--nova-blue-500: #2847E8
--nova-blue-600: #1E39CC
--nova-blue-700: #1B2FA6
--nova-blue-800: #1C2B85
--nova-blue-900: #1E2969

/* Nova Pink - Accent color */
--nova-pink-50: #FFF0F5
--nova-pink-100: #FFE1EC
--nova-pink-200: #FFC7DA
--nova-pink-300: #FF9CB8
--nova-pink-400: #FF5C8A  /* Accent */
--nova-pink-500: #FF2B70
--nova-pink-600: #F01859
--nova-pink-700: #C8124A
--nova-pink-800: #A51345
--nova-pink-900: #8B1542
```

#### Semantic Colors
```css
/* Success */
--success-50: #ECFDF5
--success-500: #32D18A
--success-700: #047857

/* Warning */ 
--warning-50: #FFFBEB
--warning-500: #FFB02E
--warning-700: #B45309

/* Error */
--error-50: #FEF2F2
--error-500: #FF4D4F
--error-700: #B91C1C

/* Info */
--info-50: #EFF6FF
--info-500: #3B82F6
--info-700: #1D4ED8
```

#### Neutral Palette
```css
/* Light Theme */
--neutral-50: #F9FAFB   /* Background */
--neutral-100: #F3F4F6  /* Surface elevated */
--neutral-200: #E5E7EB  /* Border subtle */
--neutral-300: #D1D5DB  /* Border */
--neutral-400: #9CA3AF  /* Text muted */
--neutral-500: #6B7280  /* Text secondary */
--neutral-600: #4B5563  /* Text primary */
--neutral-700: #374151
--neutral-800: #1F2937
--neutral-900: #111827

/* Dark Theme */
--dark-50: #FAFAFA
--dark-100: #F5F5F5
--dark-200: #E5E5E5  
--dark-300: #D4D4D4
--dark-400: #A3A3A3
--dark-500: #737373
--dark-600: #525252
--dark-700: #404040
--dark-800: #262626
--dark-900: #171717
--dark-950: #0A0A0A   /* Background dark */
```

### Typography

#### Font Hierarchy
```css
/* Primary Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Headings */
--font-heading: 'Inter', sans-serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Scale */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
```

#### Usage Guidelines
- **Headlines**: Bold weight, Nova Blue or neutral-900/neutral-50
- **Body Text**: Regular weight, neutral-600/neutral-300  
- **Captions**: Small size, neutral-500/neutral-400
- **Interactive Elements**: Medium weight, appropriate semantic colors

### Spacing & Layout

#### Spacing Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

#### Grid System
- **Desktop**: 12-column grid, 24px gutters
- **Tablet**: 8-column grid, 20px gutters  
- **Mobile**: 4-column grid, 16px gutters
- **Container Max Width**: 1280px

### Elevation & Shadows

```css
/* Shadow Scale */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Border Radius */
--radius-sm: 0.125rem;  /* 2px */
--radius-base: 0.25rem; /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;  /* Full radius */
```

---

## 🌌 Module Branding

### Nova Module Identity System

Each Nova module has a distinct visual identity while maintaining brand cohesion:

| Module | Primary Color | Icon Style | Personality |
|--------|---------------|------------|-------------|
| **Nova Core** | Neutral Gray + Nova Blue | Gear with orbital rings | Foundational, reliable |
| **Nova Orbit** | Purple gradient | Orbiting planets | User-centric, welcoming |
| **Nova Pulse** | Electric Blue | Radar with pulse waves | Dynamic, real-time |
| **Nova Synth** | Cyan + Deep Blue | AI neural network | Intelligent, analytical |
| **Nova Comms** | Indigo + Slate | Communication waves | Connected, collaborative |
| **Nova Beacon** | Gold + Navy | Lighthouse beacon | Guidance, accessibility |
| **Nova Lore** | Sapphire + Cream | Knowledge crystalline | Wisdom, discovery |
| **Nova Forge** | Rust Red + Graphite | Tool workshop | Builder, developer-focused |

### Module Color Schemes
```css
/* Nova Core */
--core-primary: #3F57FF;
--core-secondary: #6B7280;

/* Nova Orbit */  
--orbit-primary: #8B5CF6;
--orbit-secondary: #A855F7;

/* Nova Pulse */
--pulse-primary: #06B6D4; 
--pulse-secondary: #0891B2;

/* Nova Synth */
--synth-primary: #10B981;
--synth-secondary: #059669;

/* Nova Comms */
--comms-primary: #6366F1;
--comms-secondary: #4F46E5;

/* Nova Beacon */
--beacon-primary: #F59E0B;
--beacon-secondary: #D97706;

/* Nova Lore */
--lore-primary: #3B82F6;
--lore-secondary: #2563EB;

/* Nova Forge */
--forge-primary: #EF4444;
--forge-secondary: #DC2626;
```

---

## 🎭 Voice & Tone

### Brand Voice
**Nova Platform**: Professional, competent, innovative
- "Let's streamline your workflow"
- "Your enterprise solution awaits"
- "Transforming complexity into clarity"

**Cosmo AI Assistant**: Friendly, helpful, slightly playful
- "🚀 Ready to tackle that ticket?"
- "I've found some relevant solutions for you"
- "Let me help you navigate this"

### Tone Guidelines

#### Do's
✅ Use active voice and clear language  
✅ Be concise and action-oriented  
✅ Acknowledge user effort and expertise  
✅ Provide context and next steps  
✅ Use space/cosmic metaphors subtly  

#### Don'ts  
❌ Use jargon without explanation  
❌ Be overly casual in enterprise contexts  
❌ Create anxiety with urgent language  
❌ Overuse space terminology  
❌ Assume technical knowledge  

---

## 📱 Application Guidelines

### Responsive Breakpoints
```css
/* Mobile First Approach */
--mobile: 320px;      /* Mobile portrait */
--mobile-l: 480px;    /* Mobile landscape */ 
--tablet: 768px;      /* Tablet portrait */
--tablet-l: 1024px;   /* Tablet landscape */
--desktop: 1280px;    /* Desktop */
--desktop-l: 1440px;  /* Large desktop */
--desktop-xl: 1920px; /* Extra large */
```

### Accessibility Standards
- **WCAG 2.1 AA Compliance** required
- **Minimum contrast ratio**: 4.5:1 for normal text, 3:1 for large text
- **Keyboard navigation**: All interactive elements accessible
- **Screen reader support**: Proper ARIA labels and descriptions
- **Focus indicators**: Visible focus states for all interactive elements

### Animation Principles
```css
/* Timing Functions */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);  
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Duration Scale */
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;
```

**Animation Guidelines**:
- Micro-interactions: 150-250ms
- Page transitions: 250-350ms  
- Loading states: 500ms+
- Respect `prefers-reduced-motion`

---

## 📋 Implementation Checklist

### Phase 3 Deliverables Status
- [x] **Brand Style Guide** ✅ Complete
- [ ] **Logo Assets** (SVG versions needed)
- [ ] **Design Token System** (CSS custom properties)
- [ ] **Component Library Documentation**
- [ ] **Usage Examples & Guidelines**
- [ ] **Accessibility Audit Documentation**

### Next Steps
1. Generate SVG logo variants
2. Implement design tokens in CSS
3. Create component library documentation
4. Design high-fidelity mockups
5. Conduct accessibility review
6. Get stakeholder sign-off

---

**Document Status**: ✅ Phase 3 Task 1 Complete  
**Last Updated**: August 9, 2025  
**Next Phase**: Task 2 - Complete Design System & Component Library
