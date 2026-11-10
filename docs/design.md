# Design: House Price Relevance

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.

## System
- Genre: editorial
- Shape of the first page: Stage hero (/); app screens for the prediction workspace (/prediction); content pages for /model, /analytics, /about
- Theme: Studio (Hallmark catalog, `references/themes/studio.md`, applied without substitution)
- Axes: light/roman-serif/warm · posture: restrained
- Material: cool studio-white proof paper (hue 215) with an ink dot grid and grain on the masthead, hero and colophon only; blue-black ink; crop marks on every printed piece; orange construction guides; one cadmium-orange signal on the single primary action

## Tokens
`src/styles/tokens.css` is the source of truth. The roles:
```css
:root {
  --color-paper: oklch(97.2% 0.006 215);  --color-paper-2: oklch(94% 0.009 215);  --color-paper-3: oklch(90.5% 0.011 215);  --color-paper-hi: oklch(99% 0.004 215);
  --color-ink: oklch(16% 0.032 250);  --color-ink-2: oklch(34% 0.022 245);  --color-muted: oklch(49% 0.018 240);  --color-rule: oklch(84% 0.010 225);
  --color-accent: oklch(68% 0.172 50);  --color-accent-ink: oklch(16% 0.032 250);  --color-focus: oklch(52% 0.15 48);
  --color-dot: color-mix(in oklab, var(--color-ink) 20%, transparent);  --color-mark: color-mix(in oklab, var(--color-ink) 72%, transparent);
  --font-display: "Hedvig Letters Serif", ui-serif, Georgia, serif;  --font-body: "Geist", ui-sans-serif, system-ui, sans-serif;  --font-outlier: "Sofia Sans Extra Condensed", "Arial Narrow", ui-sans-serif, sans-serif;
  --radius-card: 3px;  --radius-pill: 3px;  --radius-control: 2px;  --rule-hair: 1px;  --shadow-card: none;  --shadow-sheet: <paper-object shadow, lit top left>;
}
```
The spacing scale, the type scale, the easings and the durations are the scaffold's and live in `tokens.css`. `.scope-app` fixes the type scale (ratio 1.2) and a 40px control for app screens.

## Type
- Display: Hedvig Letters Serif 400 only, `--tracking-display`, line-height 1.0 to 1.04, sentence case, optical sizing on. Heads, figures and the wordmark only; never running text.
- Body: Geist 400/500, line-height 1.55, ink-2 for running text. Labels and captions: Geist 500 one step smaller, sentence case, untracked, `--color-muted`, tabular figures.

## Surfaces
- `.proof` (grain over a 24px dot grid) on the masthead, the hero and the colophon; the rest is clean paper. Never behind running text.
- `.crop` / `.crop--sheet` draws eight 1px `--color-mark` ticks off the corners of a printed piece (sheet, card, control, focused field).
- Two rules: `--color-rule` between rows, `--color-ink` opening a set (`.set`). `--shadow-sheet` on paper objects only.
- Orange draws construction (`.guide`, the baseline guides under figures) and fills nothing but the primary control.

## Controls
- Primary: `--color-accent` fill, `--color-accent-ink` text · 2px radius · 1px ink border with a second rule inset 2px · 48px (40px in `.scope-app`) · crop marks open on hover and focus
- Secondary: paper-hi, same border, radius and height
- Fields: 3px radius, 1px `--color-muted` border, ink border and crop marks on focus; errors in `--color-error`
- Links: orange underline on hover

## Motion
- Character: still; state changes at `--dur-short` on `--ease-out`, opacity and transform only; under reduced motion the full construction stays visible and still.

## Exports
`src/styles/tokens.css` in this project. Tailwind, DTCG or shadcn blocks are added here on request, per `export-formats.md`.
