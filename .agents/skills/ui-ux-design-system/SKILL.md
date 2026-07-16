---
name: ui-ux-design-system
description: Use when generating color palettes, design tokens (Tailwind/CSS Variables), UI/UX wireframes, accessible HTML/CSS components (WCAG AA/AAA), and translating Figma node structures into frontend code. Fits Angular and Astro stacks.
---

# UI/UX Design System, Color Palettes & Frontend Tokens Guide

## Overview

This skill guides the AI agent to act as a **Senior Design Engineer** and **UX/UI Specialist**. It provides rules for generating modern, cohesive, and premium user interfaces. It emphasizes using programmatic tokens (Tailwind config, CSS variables) and accessible color palettes rather than plain/basic default colors.

---

## Core Guidelines

### 1. Aesthetic Excellence (Premium & Modern Design)

- **Never use raw primary colors** (like pure `#FF0000`, `#0000FF`, `#00FF00`). Always use curated HSL/RGB palettes (e.g., Catppuccin, Tailwind Slate, Emerald, Violet, Radix Colors, or HSL-shifted gradients).
- **Emphasize Sleek Dark Modes**: Implement soft near-blacks (e.g., `#0F0F15`, `#11111b`, `#181825`) with subtle borders (e.g., `rgba(255,255,255,0.05)` or HSL border lines) and vibrant accents.
- **Typography Hierarchy**: Use modern sans-serif fonts (e.g., _Outfit_, _Inter_, _Roboto_) with appropriate font-weight contrast.
  - Titles: `font-bold tracking-tight text-slate-100` (often with a soft gradient clip).
  - Body: `text-slate-400 font-normal leading-relaxed`.
- **Micro-Animations & Shadows**: Add small interactive transitions (`transition-all duration-300 ease-out hover:scale-[1.01] hover:brightness-110`) and soft blurred box-shadows.

---

## Color Harmony & HSL Token Generation

When generating palettes, use CSS Custom Properties (`var(--color-...)`) inside the CSS configuration to easily transition between themes.

### Suggested HSL Design System Tokens

```css
:root {
  /* Brand Accents */
  --primary-hue: 250; /* Indigo/Violet */
  --primary: hsl(var(--primary-hue), 85%, 65%);
  --primary-hover: hsl(var(--primary-hue), 85%, 55%);

  --secondary-hue: 190; /* Cyan */
  --secondary: hsl(var(--secondary-hue), 80%, 45%);

  /* Neutral Palette (Catppuccin Mocha / Slate inspired) */
  --bg-base: hsl(240, 21%, 8%); /* Soft dark background */
  --bg-surface: hsl(240, 21%, 12%); /* Panel / Card background */
  --bg-overlay: hsl(240, 21%, 16%); /* Popover / Dropdown background */

  /* Text */
  --text-main: hsl(226, 64%, 92%);
  --text-muted: hsl(228, 12%, 65%);

  /* Borders */
  --border: hsla(240, 21%, 20%, 0.4);
}
```

### Applying Accents in Tailwind Config

Instruct the user or agent to link these HSL custom properties inside their `tailwind.config.js` to enable utility classes like `bg-primary`, `text-text-muted`, and border utilities:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        background: 'var(--color-bg-base)',
        surface: 'var(--color-bg-surface)',
      },
    },
  },
};
```

---

## Framework Integration

### 1. Angular (v19 to v22)

- **Leverage Spartan UI**: For Angular, recommend **Spartan UI** (Radix UI for Angular). It uses headless primitives combined with Tailwind classes, similar to Shadcn/ui in React.
- Avoid inline styling; always declare component layout with utility Tailwind classes and reusable semantic components.

### 2. Astro

- Use Tailwind CSS for structured component development.
- Expose Astro content collections dynamically. Keep styling centralized under `src/styles/global.css`.

---

## Figma-to-Code Translation Steps

When reading layout outputs from the Figma MCP server:

1. **Extract Typography & Colors**: Map Figma's raw RGB/RGBA vectors into CSS Variables (or HSL tokens).
1. **Determine Grid/Flex Layouts**: Use Tailwind flex-containers (`flex items-center justify-between gap-4`) or CSS Grid templates. Do not use absolute positioning unless strictly necessary for decorative layers.
1. **Encapsulate**: Export component code with clear inputs (`@Input` in Angular) or props (Astro) to maintain separation of concerns.
