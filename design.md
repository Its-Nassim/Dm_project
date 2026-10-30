# Design: HousePrice AI (2028 Proptech Edition)

The shared design system for HousePrice AI. Evolved from Dusk into an institutional proptech housing classification platform.

## System & Macrostructure
- **Genre**: modern-minimal / institutional proptech
- **Theme**: Refined Dusk · deep twilight slate (`oklch(15.5% 0.012 268)`), micro-hairline dividers (`oklch(26% 0.015 268)`), precise periwinkle accent (`oklch(76% 0.11 274)`), with controlled apricot (`oklch(80% 0.09 65)`) and emerald status cues.
- **Macrostructure**:
  - **Workbench & Two-Mode Studio**: Core classification loop (`/prediction` with Single house and Upload CSV tabs). Dense yet breathable parameter controls beside live predicted class badge, echoed asking price, and class probabilities.
  - **Photographic & Editorial**: Marketing & narrative pages (`/` and `/about`). Restrained twilight landscape, high typographic discipline, calm institutional authority.
  - **Analytical Terminal**: Data & architecture routes (`/analytics` and `/model`). Clean figure gallery for exploratory data analysis plots, Decision Tree specifications, and tabular evaluation diagnostics.

## Tokens & Materiality
- **Surfaces**: Layered slate elevation (`--color-surface-0` canvas, `--color-surface-1` baseline, `--color-surface-2` raised, `--color-surface-inset` recessed inputs). No generic blurry translucent overlays; crisp hairline borders (`1px solid var(--color-rule)`) and subtle top-edge lighting.
- **Typography**: Fluid type scale with strict tabular figures (`tabular-nums`) for all prices, coordinates, square footage, error metrics, and statistics.
- **Container Variety**: Strict compliance with Hallmark Rule F7. Avoid uniform box recipes: use ruled split rows, recessed metric tallies, floating stat pill strips, and framed workbenches rather than identical cards.

## Core Interaction Loop
1. **Single House Classification (`/prediction?mode=single`)**: Schema-driven form with asking price (USD) as required input, numeric inputs, categorical dropdowns, binary switches, and instant validation. Displays predicted class badge (Class 0 Cheaper than average, Class 1 Reasonable price, Class 2 Over priced, Class 3 Too over priced), echoed asking price, and class probabilities meter bars.
2. **Batch CSV Classification (`/prediction?mode=csv`)**: Drag-and-drop CSV upload, client-side validation against schema headers, summary tiles for classified/failed counts per class, paginated scrollable results table with class badges and error status, and CSV results export.
3. **Responsive & Accessible**: Strict WCAG AA contrast (minimum 4.5:1 text, 3:1 controls including the four class tokens), visible focus rings (`2px solid var(--color-focus)`), zero layout shifts, and full viewport adaptability (375px to 1920px+).

## Cohesive Imagery Layer
- **Art Direction**: Contemporary Pacific Northwest residential architecture captured during twilight dusk. Natural cedar slats, low-e glass, blackened steel, and basalt stone foundation bathed in warm interior tungsten light (`oklch(80% 0.09 65)`) set against a deep indigo twilight sky (`oklch(15.5% 0.012 268)`). Muted, calm, realistic; zero AI artifacts, no floating elements, no stock faces, no simulated listing logos.
- **Asset Pipeline**:
  - Hero Stage: `/images/hero/hero-dusk-residence.jpg` (16:9, architectural residence at dusk).
  - Tour Imagery: `/images/properties/prop-single-family.jpg`, `prop-townhouse.jpg`, `prop-condo.jpg`, `prop-waterfront.jpg` (4:3).
- **Engineering & UX Standards**:
  - Component: Reusable `<PropertyImage />` with explicit CSS `aspect-ratio` containers for zero cumulative layout shift (CLS).
  - Loading: Native `loading="lazy"` on comp grids and cards; `fetchPriority="high"` on hero stage.
  - Fallbacks: Dusk gradient shimmer skeleton while loading, and a blueprint SVG wireframe fallback on error.
  - Materiality: Calibrated ambient gradient scrim preventing bright window glare from breaking dark slate UI contrast.
