# Token translation (`client/src/index.css` → Dart)

Source of truth is `index.css`; where it disagrees with `client/DESIGN.md`,
the CSS won (per ground rules).

## Colour

| CSS | Dart (`BasisTokens`) |
| --- | --- |
| `--paper #fff / #000` | `paper` (light/dark) |
| `--ink #000 / #fff` | `ink` |
| `--surface #f3f3f3 / #141414` | `surface` |
| `--surface-hover #e2e2e2 / #232323` | `surfaceHover` |
| `--surface-sunken #fafafa / #0a0a0a` | `surfaceSunken` (nested cards) |
| `--line #e2e2e2 / #2e2e2e` | `line` (every hairline/control edge) |
| `--line-strong #afafaf / #5e5e5e` | `lineStrong` |
| `--muted #6e6e6e / #a3a3a3` | `muted` |
| `--disabled-fg #afafaf / #5e5e5e` | `disabledFg` |
| `--accent-ink #318549 / #4cbe72` | `accentInk` — position in network only |
| `--accent-strong #26663a / #74d492` | `accentStrong` |
| `--accent-surface #eef6f1 / #10231a` | `accentSurface` |
| `--accent-line #a9d0b7 / #2c6b45` | `accentLine` |
| `--danger/--warning/--info` + surfaces/lines | same names in Dart, both themes |
| `--chart-1…5` (accent first) | `chart1…5` |

Accent appears only in: page-header stop marker, nav icons, `RouteBadge`,
journey step-spine connectors. Primary buttons/focus/selection are `--ink`.

## Type

DM Sans everywhere; Barlow Condensed 600 (`BarlowCondensed`) for route
numbers only. Getters match web utilities: `typePageTitle` (28), `typeH2`
(26), `typeH3` (20), `typeCardTitle` (16/600), `typeMetric` (28/tabular/500),
`typeBody` (16/400), `typeBodySm` (14/400), `typeLabel` (13/600), `typeMeta`
(13/muted), `typeEyebrow` (12/muted/500). Weights 400/500/600, 12sp floor,
no letter-spacing.

## Surface / controls / motion

- Radii: control 8, card 12, pill 999. Heights 36/40/44, default 40, journey
  flow 44 (`AppButton size: lg`).
- `BasisCard`: 12px radius, 1px `--line`, `--paper`, no shadow; nested →
  `--surface-sunken`. `QuietCard`: 8px `--surface`. Shadows only on menus
  (`--shadow-menu`) and dialogs (`--shadow-modal`).
- Focus: 1px inset `--ink` ring + `--ink` border; invalid: `--danger` edge +
  icon + message. Built once in `lib/widgets/inputs/` from `control.ts`.
- Entrance: fade + 8px rise, 200ms, `--ease-glide` (`Cubic(0.22,1,0.36,1)`);
  honors `MediaQuery.disableAnimations`. No cascades/parallax/hover scale.
- Map literals kept by hand: `#318549` polylines, `#6e6e6e` secondary.
