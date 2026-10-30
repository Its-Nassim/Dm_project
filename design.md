

# Design: HousePrice AI (2028 Proptech Edition)

The shared design system for HousePrice AI. Evolved from Dusk into a 2028-grade institutional proptech & valuation platform.

## System & Macrostructure
- **Genre**: modern-minimal / institutional proptech
- **Theme**: Refined Dusk · deep twilight slate (`oklch(15.5% 0.012 268)`), micro-hairline dividers (`oklch(26% 0.015 268)`), precise periwinkle accent (`oklch(76% 0.11 274)`), with controlled apricot (`oklch(80% 0.09 65)`) and emerald confidence cues.
- **Macrostructure**:
  - **Workbench & Split Studio**: Core valuation loop (`/prediction` and `/prediction/result`). Dense yet breathable parameter controls beside live reactive estimate telemetry.
  - **Photographic & Editorial**: Marketing & narrative pages (`/` and `/about`). Restrained twilight landscape, high typographic discipline, calm institutional authority.
  - **Analytical Terminal**: Data & architecture routes (`/analytics` and `/model`). Filterable interactive matrices, waterfall attribution charts, and tabular diagnostics.

## Tokens & Materiality
- **Surfaces**: Layered slate elevation (`--color-surface-0` canvas, `--color-surface-1` baseline, `--color-surface-2` raised, `--color-surface-inset` recessed inputs). No generic blurry translucent overlays; crisp hairline borders (`1px solid var(--color-rule)`) and subtle top-edge lighting.
- **Typography**: Fluid type scale with strict tabular figures (`tabular-nums`) for all prices, coordinates, square footage, error metrics, and statistics.
- **Container Variety**: Strict compliance with Hallmark Rule F7. Avoid uniform box recipes: use ruled split rows, recessed metric tallies, floating stat pill strips, and framed workbenches rather than identical cards.

## Core Interaction Loop
1. **Interactive Valuation Workbench (`/prediction`)**: Full spectrum of real King County features (ZIP/Neighborhood, SqFt, Bedrooms, Bathrooms, Grade, Year Built, Waterfront, View) with instant reactive inline valuation estimation, responsive stepper/sections, and keyboard focus control.
2. **Confidence Valuation Dossier (`/prediction/result`)**: Confident hero valuation estimate with animated tabular numbers, confidence interval range ($X – $Y), valuation drivers breakdown (Living Area, Location Factor, Grade, Waterfront), comp benchmarks, and PDF/share affordances.
3. **Responsive & Accessible**: Strict WCAG AA contrast (minimum 4.5:1 text, 3:1 controls), visible focus rings (`2px solid var(--color-focus)`), zero layout shifts, and full viewport adaptability (375px to 1920px+).

## Cohesive Imagery Layer
- **Art Direction**: Contemporary Pacific Northwest residential architecture captured during twilight dusk. Natural cedar slats, low-e glass, blackened steel, and basalt stone foundation bathed in warm interior tungsten light (`oklch(80% 0.09 65)`) set against a deep indigo twilight sky (`oklch(15.5% 0.012 268)`). Muted, calm, realistic; zero AI artifacts, no floating elements, no stock faces, no simulated listing logos.
- **Asset Pipeline**:
  - Hero Stage: `/images/hero/hero-dusk-residence.jpg` (16:9, architectural residence at dusk).
  - Archetype Presets: `/images/properties/prop-single-family.jpg`, `prop-townhouse.jpg`, `prop-condo.jpg`, `prop-waterfront.jpg` (4:3, property type cards and reactive telemetry).
  - Comparable Sales: `/images/comps/comp-phinney.jpg`, `comp-greenwood.jpg`, `comp-45th.jpg`, `comp-bellevue.jpg` (16:10, recent transaction comps with distance and variance badges).
- **Engineering & UX Standards**:
  - Component: Reusable `<PropertyImage />` with explicit CSS `aspect-ratio` containers for zero cumulative layout shift (CLS).
  - Loading: Native `loading="lazy"` on comp grids and cards; `fetchPriority="high"` on hero stage.
  - Fallbacks: Dusk gradient shimmer skeleton while loading, and a blueprint SVG wireframe fallback on error.
  - Materiality: Calibrated ambient gradient scrim preventing bright window glare from breaking dark slate UI contrast.

