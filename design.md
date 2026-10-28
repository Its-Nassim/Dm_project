

# Design: HousePrice AI

The shared system for the HousePrice AI website and valuation demo. Change it on purpose; routes share these rules.

## System
- Genre: modern-minimal
- Shape of the first page: Narrative Workflow adapted to a one-moment valuation tool; the app screens remain task-led
- Theme: Console, deal 2/3 · graphite ground, warm amber action, cool blue data
- Axes: dark/grotesk-sans/chromatic-amber · posture: restrained

## Tokens
`src/styles/tokens.css` is the source of truth. Inter remains the display and body face; no external type family is introduced. Graphite surfaces and pale ink carry the interface; amber is reserved for primary actions and focus, while cyan-blue marks data. Hairline rules, compact radii and tabular figures replace glow, glass and repeated cards.

## Layout
- One centered 1320px container with responsive gutters.
- Marketing pages lead with the product and keep page-specific compositions.
- Analytics, model and prediction routes use task-led screen layouts.
- Breakpoints: 60rem for layout, 40rem for compact type and gutters.

## Controls
- Primary: amber fill, dark ink, 4px radius, at least 44px target.
- Secondary: transparent graphite surface, hairline border, same radius and target.
- Inputs: dark inset surface, visible label, stable 1px border and instant focus ring.

## Motion
- Character: restrained; short color and transform transitions only.
- Reduced motion: transitions, animations and smooth scrolling stop.

## Exports
`src/styles/tokens.css` in this project.
