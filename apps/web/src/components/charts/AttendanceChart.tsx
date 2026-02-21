'use client';

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

interface AttendanceDataPoint {
  month: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  rate: number;
}

interface AttendanceChartProps {
  data: AttendanceDataPoint[];
  title?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string; payload: AttendanceDataPoint }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload;

  return (
    <div className="bg-gray-900 dark:bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-gray-300 mb-1.5">{label}</p>
      <div className="space-y-1">
        <p className="text-xs text-gray-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Present:{' '}
          <span className="font-semibold text-white">{point.present}</span>
        </p>
        <p className="text-xs text-gray-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Absent:{' '}
          <span className="font-semibold text-white">{point.absent}</span>
        </p>
        <p className="text-xs text-gray-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
          Late:{' '}
          <span className="font-semibold text-white">{point.late}</span>
        </p>
      </div>
      <div className="mt-1.5 pt-1.5 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          Total: <span className="text-white font-medium">{point.total}</span>
          {' | '}
          Rate:{' '}
          <span className="text-emerald-400 font-medium">
            {point.rate.toFixed(1)}%
          </span>
        </p>
      </div>
    </div>
  );
}

function CustomLegend({
  payload,
}: {
  payload?: { value: string; color: string }[];
}) {
  if (!payload) return null;

  return (
    <div className="flex items-center justify-center gap-4 mb-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function AttendanceChart({ data, title }: AttendanceChartProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[250px] text-sm text-gray-400">
          No attendance data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
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
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              dx={-4}
              allowDecimals={false}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
            />

            <Legend
              content={<CustomLegend />}
              verticalAlign="top"
            />

            <Bar
              dataKey="present"
              name="Present"
              stackId="attendance"
              fill="#10b981"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="late"
              name="Late"
              stackId="attendance"
              fill="#f59e0b"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="absent"
              name="Absent"
              stackId="attendance"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
