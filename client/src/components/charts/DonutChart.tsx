import { useMemo } from 'react';
import { defineChart } from '@tanstack/charts';
import { pie, polar, radialArc } from '@tanstack/charts/polar';
import { Chart } from '@tanstack/charts/react';
import type { ChartDataPoint } from '@/types/common.type';
import { CHART_SERIES, type ChartSeriesIndex } from './chart.tokens';

interface DonutChartProps {
  data: ChartDataPoint[];
  /** Screen-reader description. The arcs carry no text of their own. */
  ariaLabel: string;
  height?: number;
  /** Rendered in the hole — a total, a rate, whatever the slices add up to. */
  centerValue?: string;
  centerLabel?: string;
  className?: string;
}

const seriesFor = (index: number): ChartSeriesIndex =>
  ((index % 5) + 1) as ChartSeriesIndex;

/**
 * Part-to-whole. The legend is rendered as real text beside the arcs rather
 * than inside the SVG, so the categories stay selectable, translatable, and
 * readable when the chart is too small to label.
 */
const DonutChart = ({
  data,
  ariaLabel,
  height = 200,
  centerValue,
  centerLabel,
  className,
}: DonutChartProps) => {
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          polar({
            marks: [
              radialArc(pie(data, { value: 'value', gapAngle: 0.03 }), {
                /* PolarLength is a number or a function of the layout — the
                   hole has to be derived from the resolved radius, not a
                   percentage string. */
                innerRadius: (layout) => layout.radius * 0.62,
                cornerRadius: 2,
                fill: (d) => CHART_SERIES[seriesFor(d.index)],
              }),
            ],
            scales: { angle: null, radius: null },
          }),
        ],
        scales: { x: null, y: null },
      }),
    [data]
  );

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className={className}>
      <div className="relative">
        <Chart definition={definition} height={height} ariaLabel={ariaLabel} />
        {(centerValue || centerLabel) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && <span className="type-metric">{centerValue}</span>}
            {centerLabel && <span className="type-meta">{centerLabel}</span>}
          </div>
        )}
      </div>

      <ul className="mt-3 flex flex-col gap-1.5">
        {data.map((item, index) => (
          <li key={item.name} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: CHART_SERIES[seriesFor(index)] }}
            />
            <span className="type-body-sm min-w-0 flex-1 truncate">{item.name}</span>
            <span className="type-meta tabular text-(--ink)">
              {item.value}
              {total > 0 && (
                <span className="text-(--muted)">
                  {' '}
                  ({Math.round((item.value / total) * 100)}%)
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DonutChart;
