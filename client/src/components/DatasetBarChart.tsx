import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { BarChartDataPoint } from '../api/datasetApi';

interface DatasetBarChartProps {
  title: string;
  data: BarChartDataPoint[];
  xKey?: string;
  yKey?: string;
  barColor?: string;
  height?: number;
  subtitle?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
}

// Custom tooltip renderer for clean presentation
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-custom-tooltip">
        <p className="chart-tooltip-label">{`Bin / Range: ${label}`}</p>
        <p className="chart-tooltip-value">
          {`${payload[0].name || 'Frequency'}: ${
            typeof payload[0].value === 'number'
              ? payload[0].value.toLocaleString()
              : payload[0].value
          }`}
        </p>
      </div>
    );
  }
  return null;
};

export const DatasetBarChart: React.FC<DatasetBarChartProps> = ({
  title,
  data,
  xKey = 'name',
  yKey = 'value',
  barColor = '#2563eb',
  height = 320,
  subtitle,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <div className="chart-title-area">
            <h3>{title}</h3>
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
        </div>
        <div
          style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          No distribution data available for this column.
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-title-area">
          <h3>{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
        <span className="badge badge-gray">{data.length} intervals</span>
      </div>

      <div className="chart-wrapper" style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 12, right: 16, left: -10, bottom: 24 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              interval={0}
              angle={data.length > 5 ? -25 : 0}
              textAnchor={data.length > 5 ? 'end' : 'middle'}
              height={data.length > 5 ? 45 : 30}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '8px', fontSize: '12px' }}
            />
            <Bar
              dataKey={yKey}
              name="Frequency / Count"
              fill={barColor}
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DatasetBarChart;
