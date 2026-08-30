/**
 * Chart series colours.
 *
 * Everywhere else in the app colour is optional reinforcement — a badge still
 * reads without it because it carries an icon and a label. In a chart the
 * series colour IS the label, so this is the one place a five-step neutral
 * ramp genuinely failed: four grey strokes on one axis are not tellable apart.
 *
 * Authenticated app only. Resolved from CSS variables so dark mode lifts every
 * step in one place.
 */
export const CHART_SERIES = {
  1: 'var(--chart-1)',
  2: 'var(--chart-2)',
  3: 'var(--chart-3)',
  4: 'var(--chart-4)',
  5: 'var(--chart-5)',
} as const;

export type ChartSeriesIndex = keyof typeof CHART_SERIES;

/** Series still differ by dash pattern, so a multi-line chart survives greyscale. */
export const CHART_DASH: Record<ChartSeriesIndex, string | undefined> = {
  1: undefined,
  2: '6 3',
  3: '2 3',
  4: '10 4',
  5: '1 3',
};
