import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DashboardGraphProps {
  data: {
    month: string;
    value: number;
  }[];
  dataKey: string;
  height?: string;
  width?: string;
  type?:
    | 'basis'
    | 'basisClosed'
    | 'basisOpen'
    | 'linear'
    | 'monotone'
    | 'natural'
    | 'step'
    | 'stepAfter'
    | 'stepBefore';
  vertical?: boolean;
  fill?: string;
  strokeWidth?: number;
}

const DashboardGraph = ({
  data,
  dataKey,
  height = '90%',
  width = '100%',
  type = 'natural',
  vertical = false,
  fill = 'rgba(40, 54, 24, 0.12)',
  strokeWidth = 2,
}: DashboardGraphProps) => {
  const primaryStroke = '#283618';
  const axisMuted = '#4a6741';
  const gridLine = '#e4e4dd';

  return (
    <ResponsiveContainer height={height} width={width}>
      <ComposedChart compact data={data}>
        <Area
          connectNulls
          dataKey="value"
          fill={fill}
          stackId={1}
          fillOpacity={0.85}
          strokeWidth={strokeWidth}
          stroke={primaryStroke}
          type={type || 'natural'}
          name="Trips"
        />
        <XAxis
          dataKey={dataKey}
          tick={{ fontSize: 10, fill: axisMuted }}
          axisLine={{ stroke: gridLine }}
          tickLine={{ stroke: gridLine }}
          padding={{ left: 10, right: 10 }}
          style={{
            fontSize: '10px',
            fontFamily: 'Work Sans, system-ui, sans-serif',
          }}
        />
        <Legend />
        <YAxis
          allowDataOverflow
          tickSize={10}
          tickMargin={20}
          tick={{ fontSize: 10, fill: axisMuted }}
          axisLine={{ stroke: gridLine }}
          tickLine={{ stroke: gridLine }}
          className="text-[12px]!"
          style={{
            fontSize: '10px',
            fontFamily: 'Work Sans, system-ui, sans-serif',
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e4e4dd',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(40, 54, 24, 0.08)',
            fontSize: '10px',
            fontFamily: 'Work Sans, system-ui, sans-serif',
            color: primaryStroke,
          }}
          formatter={(value: number) => [`${value} Trips`, '']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <CartesianGrid
          strokeDasharray={'5 5'}
          y={0}
          vertical={vertical}
          stroke={gridLine}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default DashboardGraph;
