import { useMemo } from 'react';
import { barY, defineChart, lineY } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { Chart } from '@tanstack/charts/react';
import { CHART_SERIES, type ChartSeriesIndex } from './chart.tokens';

interface SparklineProps {
  values: number[];
  kind?: 'line' | 'bar';
  series?: ChartSeriesIndex;
  /** What the shape means. Sparklines have no axes, so this is the only label. */
  ariaLabel: string;
  width?: number;
  height?: number;
}

/**
 * A trend shape, not a chart: no axes, no grid, no tooltip. It sits next to a
 * number that already states the value, so its job is direction and volatility.
 */
const Sparkline = ({
  values,
  kind = 'line',
  series = 1,
  ariaLabel,
  width = 80,
  height = 40,
}: SparklineProps) => {
  const color = CHART_SERIES[series];

  const definition = useMemo(() => {
    const data = values.map((value, index) => ({ index: String(index), value }));
    return defineChart({
      marks: [
        kind === 'bar'
          ? barY(data, { x: 'index', y: 'value', fill: color })
          : lineY(data, { x: 'index', y: 'value', stroke: color, strokeWidth: 1.75 }),
      ],
      scales: {
        x: { scale: () => scaleBand().padding(0.2), axis: false },
        y: { scale: scaleLinear, axis: false },
      },
      layout: { margin: { top: 2, right: 0, bottom: 2, left: 0 } },
    });
  }, [values, kind, color]);

  if (!values.length) return null;

  return (
    <Chart definition={definition} width={width} height={height} ariaLabel={ariaLabel} />
  );
};

export default Sparkline;
