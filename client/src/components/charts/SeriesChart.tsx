import { useMemo } from 'react';
import { areaY, barY, defineChart, lineY } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { Chart } from '@tanstack/charts/react';
import type { ChartDataPoint } from '@/types/common.type';
import { CHART_SERIES, type ChartSeriesIndex } from './chart.tokens';

export type SeriesChartKind = 'line' | 'bar' | 'area';

interface SeriesChartProps {
  data: ChartDataPoint[];
  /** Screen-reader description. Required — the marks carry no text of their own. */
  ariaLabel: string;
  kind?: SeriesChartKind;
  series?: ChartSeriesIndex;
  height?: number;
  className?: string;
}

/**
 * The one cartesian chart. Line, bar, and area differ by a single mark, so
 * they are a prop rather than three near-identical files — the recharts
 * versions of this were byte-identical apart from the mark and the fill.
 */
const SeriesChart = ({
  data,
  ariaLabel,
  kind = 'line',
  series = 1,
  height = 220,
  className,
}: SeriesChartProps) => {
  const stroke = CHART_SERIES[series];

  const definition = useMemo(() => {
    const mark =
      kind === 'bar'
        ? barY(data, { x: 'name', y: 'value', fill: stroke })
        : kind === 'area'
          ? areaY(data, { x: 'name', y: 'value', fill: stroke, fillOpacity: 0.12, stroke })
          : lineY(data, { x: 'name', y: 'value', stroke, strokeWidth: 2 });

    return defineChart({
      marks: [mark],
      scales: {
        x: { scale: () => scaleBand().padding(0.28) },
        y: { scale: scaleLinear, nice: true, grid: true },
      },
      tooltip,
    });
  }, [data, kind, stroke]);

  return (
    <Chart
      definition={definition}
      height={height}
      ariaLabel={ariaLabel}
      className={className}
    />
  );
};

export default SeriesChart;
