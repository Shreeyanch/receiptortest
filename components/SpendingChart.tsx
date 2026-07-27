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
import { usePreferences } from '@/lib/PreferencesContext';
import { formatCurrency, type CurrencyCode } from '@/lib/formatCurrency';
import { CATEGORY_COLORS } from '@/lib/dummyData';

interface ChartItem {
  name: string;
  value: number;
  color?: string;
}

function CustomTooltip({ active, payload, label, currency }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  currency?: CurrencyCode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-xl px-3 py-2 border border-ash/10">
      <p className="text-xs font-semibold text-ink">{label}</p>
      <p className="text-sm font-bold text-pine">
        {formatCurrency(payload[0].value, currency || 'NPR')}
      </p>
    </div>
  );
}

const FALLBACK_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#6366F1', '#14B8A6', '#8A8578'];

export default function SpendingChart({ data }: { data: ChartItem[] }) {
  const { currency } = usePreferences();

  if (!data || data.length === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center">
        <p className="text-ash/40 text-sm">No data to chart</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F4F2EC" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#8A8578', fontFamily: 'Inter, sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#8A8578', fontFamily: 'Inter, sans-serif' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: '#F9FAFB', radius: 6 }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((item, idx) => (
            <Cell key={idx} fill={item.color || CATEGORY_COLORS[item.name] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
