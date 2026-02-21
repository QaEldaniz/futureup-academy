'use client';

import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts';

interface GradeDataPoint {
  month: string;
  avg: number;
  count: number;
}

interface GradeChartProps {
  data: GradeDataPoint[];
  title?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: GradeDataPoint }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload;

  return (
    <div className="bg-gray-900 dark:bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-gray-300 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">
        Avg Grade:{' '}
        <span className="text-purple-400">{point.avg.toFixed(1)}</span>
      </p>
      <p className="text-xs text-gray-400">
        {point.count} {point.count === 1 ? 'grade' : 'grades'}
      </p>
    </div>
  );
}

export function GradeChart({ data, title }: GradeChartProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[250px] text-sm text-gray-400">
          No grade data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradeLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="gradeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              dy={8}
            />

            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              dx={-4}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: '#6366f1',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
            />

            <Area
              type="monotone"
              dataKey="avg"
              stroke="url(#gradeLineGradient)"
              strokeWidth={2.5}
              fill="url(#gradeAreaGradient)"
              dot={{
                r: 4,
                fill: '#6366f1',
                stroke: '#1f2937',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: '#8b5cf6',
                stroke: '#1f2937',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
