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
  fill = '#e6ede5',
  strokeWidth = 2,
}: DashboardGraphProps) => {
  return (
    <ResponsiveContainer height={height} width={width}>
      <ComposedChart compact data={data}>
        <Area
          connectNulls
          dataKey="value"
          fill={fill}
          stackId={1}
          fillOpacity={0.8}
          strokeWidth={strokeWidth}
          stroke="#283618"
          type={type || 'natural'}
          name="Trips"
        />
        <XAxis
          dataKey={dataKey}
          tick={{ fontSize: 12, fill: '#666' }}
          axisLine={{ stroke: '#ddd' }}
          tickLine={{ stroke: '#ddd' }}
          padding={{ left: 10, right: 10 }}
          style={{
            fontSize: '12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        />
        <Legend />
        <YAxis
          allowDataOverflow
          tickSize={10}
          tickMargin={20}
          className="text-[12px]!"
          style={{
            fontSize: '12px',
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontSize: '12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
          formatter={(value: number) => [`${value} Trips`, '']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <CartesianGrid
          strokeDasharray={'5 5'}
          y={0}
          vertical={vertical}
          stroke="#eee"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default DashboardGraph;
