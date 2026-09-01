# Basis Transport Design System

> Reference for anyone — human or agent — generating UI in this codebase.
> **`src/index.css` is the source of truth.** Where this document and that file
> disagree, the file wins and this document is the bug.

---

## 0. The one-paragraph version

Black, white, and the greys between them carry every piece of structure. One
green — `#318549` — is the only colour in the chrome, and it marks position in
the network. Pages are laid on white. A card is told from the page by a single
1px hairline, not by a fill and not by a shadow. Type is DM Sans at one weight
ladder that stops at 500. If a screen needs another colour to be understood,
the screen is wrong, not the palette.

This chassis is shared with Peekaboo; the accent is what makes it Basis.

---

## 1. Never write a raw value

Every colour, radius, height, duration, and z-index is a token in
`src/index.css`. Components read tokens; they do not restate them.

```tsx
// yes
<section className="card-framed p-5" />
<p className="type-meta">Updated 2 hours ago</p>

// no — three decisions the system already made
<section className="rounded-xl border border-gray-200 shadow-lg p-5" />
<p className="text-xs text-gray-500">Updated 2 hours ago</p>
```

The two exceptions, both unavoidable: Google Maps polyline/marker styling takes
literal hex (keep `#318549` and `#6e6e6e` in sync by hand), and a handful of
`::selection` and print rules.

---

## 2. Colour

### Neutrals — pure greyscale, no hue at any step

| Token             | Light     | Dark      | Use                                        |
| ----------------- | --------- | --------- | ------------------------------------------ |
| `--paper`         | `#ffffff` | `#000000` | Page ground, cards, menus, navbar, sidebar |
| `--ink`           | `#000000` | `#ffffff` | Body text, primary buttons, focus, selection |
| `--surface`       | `#f3f3f3` | `#141414` | **Inline** fill: chips, menu hover, disabled |
| `--surface-hover` | `#e2e2e2` | `#232323` | Hover on a surface fill                    |
| `--surface-sunken`| `#fafafa` | `#0a0a0a` | Notes, and cards nested inside cards       |
| `--line`          | `#e2e2e2` | `#2e2e2e` | Every hairline and control edge            |
| `--line-strong`   | `#afafaf` | `#5e5e5e` | Control edge on hover                      |
| `--muted`         | `#6e6e6e` | `#a3a3a3` | Secondary text                             |
| `--disabled-fg`   | `#afafaf` | `#5e5e5e` | Text in a disabled control                 |

A hue in the neutral ramp is not a style choice, it is noise: it was a sage
ramp once, and a white card on a near-white sage ground separated by a sage
hairline is a card you have to hunt for. That is the failure this table exists
to prevent.

### The accent

| Token             | Light     | Dark      |
| ----------------- | --------- | --------- |
| `--accent-ink`    | `#318549` | `#4cbe72` |
| `--accent-strong` | `#26663a` | `#74d492` |
| `--accent-surface`| `#eef6f1` | `#10231a` |
| `--accent-line`   | `#a9d0b7` | `#2c6b45` |

The accent means **position in the network** — the stop you are on, the route
you would board. It appears in four places and nowhere else:

1. the page header's stop marker (`.app-page-stop`),
2. sidebar icons, including the current row's,
3. route number badges (`.route-badge`),
4. the connectors on a journey's step spine.

It never states what a control does. Primary buttons, input focus, and
selection are `--ink`, because "this is the main action" is a job for contrast,
not hue.

### Consequence and charts — the only other colour

`--danger` / `--warning` / `--info` / `--approve` exist because "this failed"
must not depend on telling two greys apart. Colour never travels alone: the
icon and the label always say it too. `--approve` is the accent, not a second
green.

Charts get real hue (`--chart-1`…`--chart-5`, accent first) because grey
strokes are not tellable apart — and must also vary `strokeDasharray`.

---

## 3. Type

**DM Sans** for everything. **Barlow Condensed** (`--font-family-route`) for
route numbers only — a route number is set condensed because the blind on the
front of the bus is.

Compose the utility, never the size. A component writes `type-card-title`, not
`text-lg font-semibold`.

| Utility            | Size                  | Weight | Use                        |
| ------------------ | --------------------- | ------ | -------------------------- |
| `type-page-title`  | 28 → 46px (clamp)     | 500    | The `h1`, one per page     |
| `type-h2` / `-h3`  | 24–30px / 20px        | 500    | Marketing sections         |
| `type-card-title`  | 16px                  | 600    | Card and section headings  |
| `type-metric`      | 28px, tabular         | 500    | A single figure            |
| `type-body`        | 16px                  | 400    | Body copy                  |
| `type-body-sm`     | 14px                  | 400    | Dense body copy            |
| `type-label`       | 13px                  | 600    | Field labels               |
| `type-meta`        | 13px, `--muted`       | 400    | Descriptions, timestamps   |
| `type-eyebrow`     | 12px, `--muted`       | 500    | The area a page belongs to |

Hierarchy comes from size, space, and colour. The weight ladder is 400 → 500 →
600 and stops there. 12px is the floor. No letter-spacing: DM Sans is drawn to
sit correctly at every size. Figures in tables, money, counts, and dates get
`.tabular`.

---

## 4. Surfaces

```
--radius-control: 8px    inputs, selects, buttons, chips, menus
--radius-card:   12px    cards, panels, dialogs
--radius-pill:  999px    status badges, sidebar rows
```

```css
.card-framed  /* 12px radius, 1px --line, --paper fill, no shadow */
.card-quiet   /*  8px radius, --surface fill, no edge */
```

**Cards do not float.** `--shadow-card` is `none` by design; the hairline is
the whole card. Only things that genuinely leave the page cast anything:
`--shadow-menu` for dropdowns and popovers, `--shadow-modal` for dialogs.

A card nested inside a card drops to `--surface-sunken` — two identical whites
separated by one hairline stop reading as two objects.

---

## 5. Controls

One height scale, so a field and the button beside it share an edge:
`--control-sm: 36px`, `--control-md: 40px` (the default), `--control-lg: 44px`.

The whole contract lives in `src/components/inputs/control.ts`. Import from
`components/inputs/` — `Button`, `Input`, `Select`, `TextArea`, `FieldShell` —
never from `components/ui/`, which stays stock shadcn and is upgraded from the
registry.

- **Buttons:** `primary` is `--ink` on `--paper`; `outline` is a bordered
  secondary; `breadcrumb` is a compact surface-filled wayfinding chip.
- **Focus:** a 1px inset `--ink` ring plus an `--ink` border. Never an outline,
  never a coloured ring.
- **Invalid:** `--danger` edge *and* an icon *and* a message.
- **Forms:** react-hook-form — `useForm`, `Controller`, `handleSubmit`, and
  `errors` fed to `errorMessage`. Match `pages/auth/Login.tsx`.

---

## 6. Page grammar

Authenticated pages compose `components/layout/PageShell.tsx` and inherit the
rhythm rather than restating it:

```tsx
<PageBody>                                   {/* max-w-[1180px], gap-7 */}
  <PageHeader eyebrow="People" title="Users" description="…" actions={…} />
  <PageNote>A standing constraint.</PageNote>
  <PageSection title="Directory">…</PageSection>
  <DetailList columns={3} items={…} />
  <PageFooter>…</PageFooter>
</PageBody>
```

`PageHeader` carries the **route rail** (`.app-page-stop`): a filled accent
stop on the eyebrow's line with a line running down the title. It is the one
signature element and the only place the accent runs at full strength.

Blocks inside `PageBody` must not set their own outer margins — the container
owns the gap. A block that carries `margin-bottom` stacks it on the gap and the
same two panels end up different distances apart in different shells.

---

## 7. Semantic HTML

Use the element that describes the purpose: `main`, `section`, `article`,
`header`, `footer`, `nav`, `aside`, `ul`/`ol`/`li`, `p`, `h1`–`h6`, `button`,
`a`, `label`, `figure`, `time`, `dl`/`dt`/`dd`, and real table markup.

`div` and `span` are for presentational grouping only. Never a `div` as a
control — that is a `button` or an `a`. Never a styled `div` as a heading.

---

## 8. Motion and layers

Entrance is one fade plus an 8px rise (`.animate-fade-in-up`). No stagger
cascades, no parallax, no hover scale on cards. `--dur-menu: 100ms`,
`--dur-state: 200ms`, `--dur-sweep: 500ms`. `prefers-reduced-motion` is
honoured globally.

One z-ladder, and nothing invents its own:

```
--z-sidebar-scrim 40 · --z-sidebar 45 · --z-navbar 50
--z-popover 100 · --z-modal 200 · --z-toast 300
```

---

## 9. Accessibility floor

Keyboard focus is always visible. Colour is never the only carrier of meaning.
Body text meets 4.5:1 and UI edges meet 3:1 in both themes. Every control is at
least 36px tall, and touch targets in the journey flow are 44px. Wide content
scrolls inside its own container; the page body never scrolls sideways.

`e2e/ui-consistency.spec.ts` enforces the load-bearing parts of this document —
card fill, edge contrast, radius, title and description sizes, and which shell
each route renders in. If you change a rule here, change that spec with it.
