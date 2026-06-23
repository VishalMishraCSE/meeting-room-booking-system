# Lumina Workspace Design System

**ID:** `asset-stub-assets_9bd97f33835d4964a9e334c1add7cc5d` (referencing `assets/9bd97f33835d4964a9e334c1add7cc5d`)

## Style Guidelines

### Brand & Style
This design system is built for a premium, high-fidelity booking experience. The aesthetic is rooted in **Glassmorphism** and **High-Contrast Modernism**, evoking the immersive feel of cinema booking platforms. It prioritizes depth through transparency, vibrant accent colors, and a "glow" architecture that guides the user toward conversion actions. 

The personality is sophisticated, technical, and frictionless. It treats the office environment as a luxury space, using dark backgrounds to reduce eye strain while making interactive elements "pop" with neon-inspired gradients and soft backlighting.

### Layout & Spacing
The layout follows a **Fluid Grid** model with high-density spacing. 
- **Desktop:** 12-column grid with 24px gutters. Content is often grouped into glassmorphic "cards" that span 3, 4, or 6 columns.
- **Mobile:** Single column with 16px margins.
- **Rhythm:** An 8px base unit is used for all internal spacing. Room lists use a tight 12px vertical stack to allow more visibility of options, while hero sections use a 48px gap to emphasize the selected room imagery.

### Elevation & Depth
This design system moves away from traditional drop shadows in favor of **Tonal Layering and Glows**.
1. **Level 0 (Floor):** Slate-950 solid background.
2. **Level 1 (Cards):** Slate-900 at 40% opacity with a `backdrop-blur` of 12px. The border is a 1px solid `slate-800/50`.
3. **Level 2 (Active/Hover):** When an element is selected, it receives an inner glow (box-shadow inset) of the primary color and a soft outer drop shadow with a 20px blur using the primary color at 20% opacity.
4. **Interactive Elements:** Use "Linear-Gradient" fills rather than solid colors to simulate light hitting a physical surface.

### Components

#### Buttons
- **Primary Action:** Pill-shaped, Indigo-to-Violet gradient. On hover, it pulses with a subtle scale-up (1.02x) and an increased outer glow.
- **Secondary:** Transparent with a Slate-800 border and a subtle white-to-transparent gradient fill on hover.

#### Status Badges
- **Available:** Glowing Emerald dot next to "Available" text.
- **Busy:** Amber pulse animation for rooms currently in use.

#### Time Slot Picker
- **Pill-shaped containers:** Unselected slots have a subtle Slate-800 border. Selected slots take on the Indigo/Violet gradient with white text. Unavailable slots are 30% opacity with a strike-through.

#### Date Scroller
- A horizontal interactive list. The "Active" date is centered, scaled up slightly, and sits on a glowing Indigo underline.

#### Input Fields
- Dark backgrounds (Slate-900/60) with an "Inner Glow" focus state rather than just a border change. Text is light slate (#94a3b8) for placeholders and white for active input.

#### Glass Cards
- Used for room details. Must include a 1px top-highlight (white at 10% opacity) to simulate the edge of a glass pane catching the light.

---

## Design Markdown Configuration (designMd)

```yaml
name: Lumina Workspace
colors:
  surface: '#0c1324'
  surface-dim: '#0c1324'
  surface-bright: '#33394c'
  surface-container-lowest: '#070d1f'
  surface-container-low: '#151b2d'
  surface-container: '#191f31'
  surface-container-high: '#23293c'
  surface-container-highest: '#2e3447'
  on-surface: '#dce1fb'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dce1fb'
  inverse-on-surface: '#2a3043'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00885d'
  on-tertiary-container: '#000703'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0c1324'
  on-background: '#dce1fb'
  surface-variant: '#2e3447'
typography:
  headline-xl:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter: 16px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
  section-gap: 48px
```

## Theme Details
- **Color Mode:** DARK
- **Headline Font:** OUTFIT
- **Body Font:** INTER
- **Label Font:** INTER
- **Primary Color:** `#6366f1` (Electric Indigo)
- **Secondary Color:** `#8b5cf6` (Purple/Violet)
- **Tertiary Color:** `#10b981` (Emerald Green)
- **Neutral Color:** `#020617` (Slate-950)
- **Spacing Scale:** 2
