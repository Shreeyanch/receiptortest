'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ANALYTICS_DATA } from '@/lib/dummyData';

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-xl px-3 py-2 border border-gray-100">
      <p className="text-xs font-semibold text-gray-700">{label}</p>
      <p className="text-sm font-bold text-samparka">
        Rs {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export default function SpendingChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={ANALYTICS_DATA.chartData} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB', radius: 6 }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {ANALYTICS_DATA.chartData.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
