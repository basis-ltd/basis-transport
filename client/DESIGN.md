# Basis Transport Design System

> Reference for AI agents generating UI code. All values are sourced from the actual codebase.

---

## 0. Global constraints (mandatory)

These rules override older examples elsewhere in this document when they conflict.

### Border radius

- **Maximum radius for any UI surface is `rounded-md`.** Use `rounded-md` for cards, panels, tables, popovers, auth shells, inputs, and buttons.
- **Do not use** `rounded-lg`, `rounded-xl`, `rounded-2xl`, or `rounded-full` in new work. (Legacy pages may still contain them until migrated.)
- **Skeleton loaders** may use `rounded-[4px]` (smaller than `rounded-md`, acceptable).

### Typography

- **Default size** for body copy, labels, buttons, table cells, and most UI text: **`text-[12px]`** (12px).
- **Maximum** size for any UI or body text: **`text-[13px]`** (13px)—use sparingly for page titles, one emphasis line, or error messages.
- **Do not use** `text-xs` / `text-sm` / `text-base` / `text-lg` / `text-xl` / `text-2xl` and larger utilities for new screens; use **12px / 13px only** and differentiate hierarchy with **weight** (`font-light`, `font-medium`, `font-semibold`).

### Sections, cards, and elevation

- **Do not use borders** to define page sections, cards, tables, auth panels, or major layout regions (`border`, `border-b` on sections, `border-primary/10` wrappers, etc.).
- **Use `shadow-sm` only** for separation and depth on those surfaces. **Do not use** `shadow-md`, `shadow-lg`, or heavier shadows for new work.
- **Exceptions (borders allowed):** true **form controls** (input outline, checkbox/radio stroke), **focus / invalid** rings, and **1px hairlines** inside a component where required for accessibility (e.g. separator between two inputs)—not around whole sections.

### Semantic HTML (restrict `div` / `span`)

- **Do not default to `div` or `span` for structure.** Use elements that describe purpose: `main`, `section`, `article`, `header`, `footer`, `nav`, `aside`, `ul` / `ol` / `li`, `p`, `h1`–`h6`, `button`, `a`, `label`, `figure` / `figcaption`, `time`, `address`, `dialog`, `fieldset` / `legend`, and table markup (`table`, `thead`, `tbody`, `tr`, `th`, `td`) where content matches.
- **Replace generic wrappers** when the region has meaning: page shell → `main`; titled blocks → `section` with a heading; intro copy above a section → `header`; link groups → `nav`; supplementary content → `aside`; body copy → `p` (not `div` with text).
- **`div` / `span` are allowed only** for **presentational grouping** with no document role—e.g. a single flex/grid row inside an already-semantic parent, or a hook for layout where no HTML element fits. Keep such wrappers **minimal**; do not nest long chains of anonymous `div`s where one semantic container suffices.
- **Never use `div` (or `span`) as a clickable control**—use `button` or `a` with appropriate styles. Do not fake headings with styled `div`s; use `h1`–`h6` and match visual caps via classes in §2.

---

## 1. Color System

### Brand Colors (CSS Variables — `client/src/index.css`)

| Token                    | Light Mode Value | Purpose                    |
| ------------------------ | ---------------- | -------------------------- |
| `--primary`              | `#283618`        | Forest green, main brand   |
| `--primary-foreground`   | `#344e41`        | Primary text on bg         |
| `--secondary`            | `#4a6741`        | Sage green, secondary text |
| `--secondary-foreground` | `#283618`        | Text on secondary bg       |
| `--background`           | `#fafaf8`        | Page background (off-white)|
| `--background-secondary` | `#f3f3f1`        | Alt background sections    |
| `--foreground`           | `oklch(0.145 0 0)` | Body text (near-black)  |
| `--border`               | `#e4e4dd`        | Default border             |
| `--input`                | `#e4e4dd`        | Input border/bg base       |
| `--destructive`          | `oklch(0.577 0.245 27.325)` | Error/danger red |
| `--muted`                | `oklch(0.97 0 0)` | Muted background          |
| `--muted-foreground`     | `oklch(0.556 0 0)` | Muted/placeholder text   |
| `--ring`                 | `oklch(0.708 0 0)` | Focus ring color          |

### Landing Page Palette (`LandingPage.tsx` Colors object)

Used for marketing/public pages with inline styles:

```ts
const Colors = {
  primary: '#283618',        // Deep forest green
  primaryLight: '#4a6741',   // Lighter sage
  primaryLighter: '#6b8563', // Even lighter sage
  neutral: '#2d2d2d',        // Near black (headings)
  neutralLight: '#666666',   // Medium gray (body text)
  neutralLighter: '#999999', // Light gray
  bg: '#fafaf8',             // Off-white background
  bgAlt: '#f3f3f1',          // Alt section background
  white: '#ffffff',
};
```

### Opacity Patterns

Used with Tailwind's `/` opacity syntax on `primary`:

| Pattern             | Usage                             |
| ------------------- | --------------------------------- |
| `primary/5`         | Subtle fills, hover wash, overlays |
| `primary/10`        | Hover backgrounds, tinted chips    |
| `primary/15`        | Border hints (inline `${Colors.primary}15`) |
| `primary/20`        | Input borders, outline control chrome |
| `primary/30`        | Focus ring                        |
| `primary/40`        | Focus border                      |
| `primary/90`        | Primary button hover              |

---

## 2. Typography

### Font

- **Family:** `Work Sans` (Google Fonts, weights 100–900 + italics)
- **Fallback:** `sans-serif`
- **Default UI size:** **12px** — `text-[12px]`
- **Largest UI size:** **13px** — `text-[13px]` (titles, errors, rare emphasis)

### Weight Scale

| Weight        | Tailwind Class  | Usage                                    |
| ------------- | --------------- | ---------------------------------------- |
| 300 (Light)   | `font-light`    | **Default body text**, inputs, buttons   |
| 500 (Medium)  | `font-medium`   | Emphasis, nav brand, card titles         |
| 600 (Semibold)| `font-semibold` | Strongest headings (still `text-[12px]` or `text-[13px]`) |

### Text Size Scale

**Default (most UI):**
```
text-[12px] font-light leading-tight
```

**Strong title / single headline line (max size):**
```
text-[13px] font-semibold text-primary leading-tight
```

**Form elements** (inputs, buttons, labels, checkboxes)—**12px**:
```
text-[12px]
```
(If space is tight, `text-[11px]` is allowed only inside dense tables; prefer 12px.)

**Icons** (FontAwesome in inputs/buttons)—keep icon glyph visually smaller than label text, e.g.:
```
text-[9px] sm:text-[10px] md:text-[10px] max-lg:text-[11px]
```

**Heading component** (`TextInputs.tsx`) — sizes should be aligned to tokens in code; **target spec:**

| Level | Target classes (conceptual)                          |
| ----- | ---------------------------------------------------- |
| h1    | `text-[13px] font-semibold text-primary leading-tight` |
| h2    | `text-[13px] font-semibold text-primary leading-tight` |
| h3–h6 | `text-[12px] font-semibold text-primary leading-tight` |

**Landing page headings** — same caps (hierarchy via weight, not pixel jumps):

| Element    | Classes                                              |
| ---------- | ---------------------------------------------------- |
| Hero title | `text-[13px] font-semibold leading-tight` (or `font-light` if a softer hero line is desired—still 13px max) |
| Section title | `text-[13px] font-medium leading-tight`         |
| Card title | `text-[12px] font-medium leading-tight`              |
| Body       | `text-[12px] leading-relaxed font-light`             |
| Muted / small | `text-[12px] font-light` with muted color      |

---

## 3. Component Patterns

### Button (`client/src/components/inputs/Button.tsx`)

A `<Link>` by default, renders `<button>` when `submit` or `type="submit"`.

**Base classes:**
```
py-[1px] h-10 px-4 font-light leading-tight
flex items-center gap-1.5 justify-center text-center
border border-[1px] border-primary rounded-md
text-[12px]
text-primary bg-white
hover:bg-primary hover:text-white
cursor-pointer ease-in-out duration-200 hover:scale-[1.01]
```

**Variants** (via boolean props):

| Prop       | Override Classes                                                    |
| ---------- | ------------------------------------------------------------------- |
| `primary`  | `bg-primary! text-white! hover:bg-primary! hover:text-white! shadow-sm!` |
| `danger`   | `bg-red-700! border-none! text-white! hover:bg-red-700! shadow-sm!`     |
| `disabled` | `bg-secondary! shadow-none! hover:scale-[1]! cursor-default! text-white text-opacity-80 border-none! duration-0!` |
| `styled={false}` | `bg-transparent! shadow-none! text-primary! border-none! py-0! px-0! hover:bg-transparent!` |

**Props:** `route`, `value`, `onClick`, `type`, `disabled`, `primary`, `styled`, `className`, `submit`, `danger`, `icon` (FontAwesome), `isLoading`, `children`

**Loading state:** Replaces content with `<Loader>` spinner.

### shadcn Button (`client/src/components/ui/button.tsx`)

Uses `class-variance-authority`. Variants:

| Variant     | Classes                                                         |
| ----------- | --------------------------------------------------------------- |
| `default`   | `bg-primary text-white shadow-sm hover:bg-primary/90`          |
| `destructive` | `bg-destructive text-white shadow-xs hover:bg-destructive/90`|
| `outline`   | `border border-primary/20 bg-white text-primary shadow-sm hover:bg-primary/10` |
| `secondary` | `bg-primary/10 text-primary shadow-sm hover:bg-primary/20`    |
| `ghost`     | `hover:bg-primary/10 hover:text-primary`                       |
| `link`      | `text-primary underline-offset-4 hover:underline`              |

Sizes: `default` (h-10 px-5), `sm` (h-9 px-3), `lg` (h-11 px-6), `icon` (size-9) — prefer **`text-[12px]`** on label content where you control text.

### Input (`client/src/components/inputs/Input.tsx`)

Wraps shadcn `<UIInput>` with label, error message, prefix/suffix icon support, and loading skeleton.

**Outer label structure:**
```html
<label class="flex flex-col gap-2 w-full">
  <header>  <!-- label text + required indicator -->
  <article> <!-- input + prefix/suffix + error -->
</label>
```

**Label text:** `pl-1 flex items-center gap-1.5 text-[12px] font-light leading-tight text-secondary`

**Required indicator:** Red `*` with tooltip: `text-red-600`, tooltip bg `bg-red-600`

**Input field classes:**
```
!h-10 min-h-10 !py-0 px-3
font-light leading-tight
placeholder:!font-light placeholder:text-[12px]
text-[12px]
flex items-center w-full
rounded-md border border-[1px] border-primary/20
outline-none focus:outline-none
focus:border-primary
focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20
ease-in-out duration-200 bg-white shadow-sm
```

**Prefix icon area:** `absolute inset-y-0 start-0 ps-3` — adds `ps-10` to input  
**Suffix icon area:** `absolute inset-y-0 end-0 pe-3` — adds `pe-10` to input  
**Read-only:** `!border-[.1px] !border-background hover:cursor-default focus:!border-background`

**Checkbox variant** (type="checkbox"):
```
w-4 h-4 border-[1.5px] cursor-pointer border-secondary
data-[state=checked]:bg-primary text-white
```
Label: `text-[12px] font-light leading-tight`

**Radio variant** (type="radio"):
```
w-4 h-4 border-[1.5px] rounded-md cursor-pointer border-secondary
accent-primary focus:border-primary
```

**Error message:** `text-red-500 text-[13px]` (via `InputErrorMessage`) — **only** exception for routine copy at 13px.

### Loader (`client/src/components/inputs/Loader.tsx`)

**Spinner:** `animate-spin text-primary` — sizes: `small` (size-4), `medium` (size-6), `large` (size-8)

**Skeleton loader:** `animate-pulse bg-gray-200 rounded-[4px]`
| Type   | Height  |
| ------ | ------- |
| text   | 1.3rem  |
| input  | 2.5rem  |
| button | 2.5rem  |
| card   | 13rem   |
| table  | 20rem   |

### Select, TextArea, Tooltip, Popover

All use shadcn/ui base from `client/src/components/ui/` with custom wrappers in `client/src/components/inputs/` and `client/src/components/custom/`.

**TextArea:** `min-h-16 rounded-md bg-white px-4 py-3 shadow-sm field-sizing-content text-[12px]`
**Custom Tooltip:** `text-[12px] bg-primary text-white rounded-md shadow-sm`, delay 100ms  
**Custom Popover:** `bg-white mt-4 w-full p-2 rounded-md shadow-sm` (no section border; rely on shadow)

### Dashboard Card (`client/src/components/dashboard/DashboardCard.tsx`)

```
bg-white shadow-sm rounded-md p-5 gap-4
(no outer border — depth from shadow-sm only)
hover:scale-[1.02] transition-transform duration-200
```
Optional subtle overlay (if used): keep very light; prefer no overlay.  
Icon container: `p-3 rounded-md bg-primary/10 text-primary shadow-sm`

### Table (`client/src/components/table/Table.tsx`)

Container: `rounded-md w-full bg-white/90 shadow-sm` (no outer section border)  
Header cells: `p-4 text-[12px] text-secondary` (or `text-[13px]` only if spec requires)  
Body cells: `p-4 text-[12px]`  
Row hover: `hover:bg-background`

---

## 4. Layout & Spacing

### Containers

| Context          | Max Width     | Padding            |
| ---------------- | ------------- | ------------------ |
| Landing sections | `max-w-4xl`   | `px-6 lg:px-8`    |
| Landing header   | `max-w-6xl`   | `px-6 lg:px-8`    |
| Landing footer   | `max-w-6xl`   | `px-6 lg:px-8`    |
| Final CTA        | `max-w-3xl`   | `px-6 lg:px-8`    |
| Navbar (app)     | `w-full`      | `px-6 md:px-12`   |
| Auth forms       | `max-w-[420px]`| `p-8`             |

### Section Spacing

Landing page sections: `py-24` between sections, `py-16` for footer. Separate **sections** with **background alternation** or **spacing**, not bordered boxes.

### Grid Patterns

| Layout              | Classes                              |
| ------------------- | ------------------------------------ |
| 2-col content       | `grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16` |
| 3-col steps         | `grid grid-cols-1 md:grid-cols-3 gap-8` |
| 3-col stats         | `grid grid-cols-3 gap-8 lg:gap-12`  |
| Benefit cards       | `grid grid-cols-1 md:grid-cols-2 gap-8` |
| Feature list        | `grid grid-cols-1 md:grid-cols-2 gap-10` |
| Form fields         | `grid grid-cols-2 gap-6 p-6`        |
| Footer columns      | `grid grid-cols-1 md:grid-cols-3 gap-12` |

### Common Gap Values

`gap-1`, `gap-1.5`, `gap-2`, `gap-3`, `gap-4`, `gap-5`, `gap-6`, `gap-8`, `gap-10`, `gap-12`

---

## 5. Visual Effects

### Border radius

| Usage              | Class          |
| ------------------ | -------------- |
| **Default (cap)**  | `rounded-md`   |
| Skeleton loaders   | `rounded-[4px]`|

Do **not** use larger radii than `rounded-md` for new UI. Prefer theme token `--radius` alignment with `rounded-md` only.

### Borders

**Sections and cards:** avoid outer borders; use **`shadow-sm`** instead.

| Pattern                | Usage                        |
| ---------------------- | ---------------------------- |
| `border border-primary/20` | Inputs, outline buttons (controls only) |
| `border-[1.5px] border-secondary` | Checkboxes, radios  |
| `border-[.1px] border-background` | Read-only inputs     |
| `border-gray-200`     | Dropdown menus (legacy; prefer shadow-sm separation) |

### Shadows

**Maximum elevation for surfaces: `shadow-sm`.** Do not use `shadow-md` or `shadow-lg` on new section/card/auth/table chrome.

| Class        | Usage                              |
| ------------ | ---------------------------------- |
| `shadow-xs`  | Destructive buttons, checkboxes    |
| `shadow-sm`  | **Default and maximum** for cards, inputs, navbar, popovers, dropdowns, auth panels |

### Transitions & Animations

**Durations:**
- `duration-50` — fast (checkbox toggle)
- `duration-200` — standard (buttons, inputs, hover effects)
- `duration-300` — slow (navbar transitions)

**Easing:** `ease-in-out` (default for all interactive elements)

**Hover scale:** `hover:scale-[1.01]` (buttons), `hover:scale-[1.02]` (dashboard cards)

**Scroll animations** (landing page, via IntersectionObserver):
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
```
Staggered delays: `0s`, `0.1s`, `0.15s`, `0.2s`, `0.3s`

**Radix UI animations** (select, popover, tooltip):
- `animate-in` / `animate-out`
- `fade-in-0` / `fade-out-0`
- `zoom-in-95` / `zoom-out-95`
- `slide-in-from-top-2` / `slide-in-from-bottom-2`

**Loader animations:**
- Spinner: `animate-spin`
- Skeleton: `animate-pulse`, `animationDuration: 1.2s`

---

## 6. Accessibility

### Focus States

All interactive elements use:
```
focus-visible:ring-2 focus-visible:ring-primary/20
focus-visible:border-primary (or focus-visible:border-primary/40)
```
Outline removed via `outline-none focus:outline-none` — focus is indicated by ring + border color change.

### Disabled States

- Buttons: `bg-secondary text-white text-opacity-80 cursor-default hover:scale-[1] duration-0`
- Inputs: `disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60`

### Validation

- Error border: `aria-invalid:ring-destructive/20 aria-invalid:border-destructive`
- Error text: `text-red-500 text-[13px]`
- Required: red `*` with tooltip explaining the field is required

### ARIA Patterns

- Navbar: `aria-label`, `aria-haspopup`, `aria-expanded` on dropdown toggle
- Decorative elements: `aria-hidden="true"` (Three.js canvas, SVG icons)
- Semantic roles: `role="menu"`, `role="menuitem"` in dropdowns

### Semantic structure

Follow **§0 — Semantic HTML**: prefer landmarks and text-level semantics over `div` / `span`; use ARIA roles only when a native element cannot represent the pattern (e.g. some composite widgets).

---

## 7. Navbar (`client/src/containers/navigation/Navbar.tsx`)

Prefer **shadow-sm** for separation from content; **avoid** a full-width bottom border on the bar if you are standardizing on borderless sections—use `shadow-sm` only.

```
fixed top-0 left-0 w-full h-[9vh]
bg-background/90 backdrop-blur
shadow-sm
z-[1000] transition-all duration-300
```

**Brand:** `flex items-center gap-2 text-[13px] font-semibold text-primary`, logo `w-10 h-10`

**User menu button:** `p-2 px-[11px] rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-white`

**Dropdown:** `absolute right-0 mt-2 w-40 bg-white rounded-md shadow-sm py-2 z-50` (no border; separation via shadow)  
Items: `flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-primary/10 hover:text-primary font-medium rounded-md text-[12px]`

---

## 8. Auth Forms (`Login.tsx`, `Signup.tsx`)

**Card container (no outer border):**
```
w-full max-w-[420px] shadow-sm rounded-md
bg-white/90 p-8
```

**Form layout:** `flex flex-col gap-4` (fields), `gap-5` (fieldset)

**Footer:** `flex flex-col items-center gap-2`, links as `text-primary text-[12px] hover:underline transition-colors`

**Title / subtitle:** `text-[13px]` (or `font-light` / `font-semibold` as needed) for title; `text-[12px] leading-relaxed` for subtitle—respect global caps.

---

## 9. Landing Page Structure

### Section Anatomy

Each section follows this pattern (background alternation, not bordered panels):
```html
<section class="py-24" style={{ backgroundColor: Colors.white | Colors.bgAlt }}>
  <article class="max-w-4xl mx-auto px-6 lg:px-8">
    <header class="text-center mb-16 animate-on-scroll">
      <!-- h2 + optional subtitle — text-[13px] / text-[12px] -->
    </header>
    <!-- Content grid -->
  </article>
</section>
```

Alternating backgrounds: `Colors.white` (#ffffff) and `Colors.bgAlt` (#f3f3f1)

### CTA Pattern

Primary + secondary button side by side:
```html
<nav class="flex flex-col sm:flex-row gap-4">
  <Button primary route="/dashboard">Create Free Account</Button>
  <Button route="#section">See how it works</Button>
</nav>
```

### Feature Icons (landing page)

Container: `w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0` with `backgroundColor: Colors.primary`  
SVG: `width="24" height="24"` with `stroke={Colors.white} strokeWidth="2"`

### Step Numbers

Container: `w-16 h-16 mx-auto mb-6 rounded-md flex items-center justify-center font-light text-[13px]` with primary bg + white text

### Testimonials

Card: `rounded-md p-8` with white bg and **`shadow-sm`** (no border)  
Quote text: `text-[12px] leading-relaxed mb-6`  
Attribution: `not-italic font-medium text-[12px]` in primary color, prefixed with `—`

---

## 10. Z-Index Hierarchy

| Layer     | Z-Index      | Element                |
| --------- | ------------ | ---------------------- |
| Navbar    | `z-[1000]`   | Fixed app navbar       |
| Landing header | `z-50`  | Fixed landing header   |
| Tooltips  | `z-[10000]`  | Custom tooltips        |
| Dropdowns | `z-50`       | Popovers, selects      |
| Canvas overlay | `z-10`  | Landing gradient overlays |
| Canvas content | `z-20`  | Landing hero content   |

---

## 11. File Organization

```
client/src/
├── components/
│   ├── ui/               # shadcn/ui primitives (do not modify directly)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── checkbox.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tooltip.tsx
│   │   ├── popover.tsx
│   │   └── sonner.tsx
│   ├── inputs/            # Custom form components (USE THESE)
│   │   ├── Button.tsx     # Primary button — use for all buttons
│   │   ├── Input.tsx      # Primary input — use for all text inputs
│   │   ├── TextArea.tsx   # Textarea wrapper
│   │   ├── Select.tsx     # Select wrapper
│   │   ├── TextInputs.tsx # Heading component
│   │   ├── Loader.tsx     # Spinner + skeleton loaders
│   │   └── ErrorLabels.tsx
│   ├── custom/            # Utility wrappers
│   │   ├── CustomTooltip.tsx
│   │   └── CustomPopover.tsx
│   ├── dashboard/
│   │   ├── DashboardCard.tsx
│   │   └── DashboardGraph.tsx
│   └── table/
│       ├── Table.tsx
│       └── TablePagination.tsx
├── containers/navigation/
│   └── Navbar.tsx
├── pages/
│   ├── auth/              # Login.tsx, Signup.tsx
│   └── common/            # LandingPage.tsx
├── index.css              # Theme tokens, CSS variables
└── lib/utils.ts           # cn() utility (clsx + twMerge)
```

---

## Quick Reference for AI Agents

When generating UI for this project:

1. **Always import from `components/inputs/`** (Button, Input, Select, TextArea) — not directly from `components/ui/`
2. **Default text weight is `font-light`** — use `font-medium` / `font-semibold` for emphasis; **do not** jump font size for hierarchy beyond 12px → 13px
3. **Default text size is `text-[12px]`**; **max** is `text-[13px]` (titles, errors)
4. **Primary color is forest green** (`#283618`) — not blue, not indigo
5. **Section/card chrome:** **no borders** — use **`shadow-sm` only** (no heavier shadows)
6. **Controls only:** `border-primary/20` on inputs and similar; not around whole sections
7. **Border radius:** **`rounded-md` maximum** for surfaces (skeletons may use `rounded-[4px]`)
8. **Height standard:** `h-10` for inputs and buttons
9. **Transitions:** `ease-in-out duration-200` for all interactive elements
10. **Focus pattern:** `focus-visible:ring-2 focus-visible:ring-primary/20` — never `outline`
11. **Use `cn()` from `@/lib/utils`** for conditional class merging
12. **Semantic HTML:** restrict `div` / `span`—use `main`, `section`, `header`, `footer`, `nav`, `article`, `aside`, `p`, lists, headings, `button`, `a`, etc.; see §0
