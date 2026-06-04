'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { ANALYTICS_DATA, MY_RECEIPTS } from '@/lib/dummyData';

const SpendingChart = dynamic(() => import('@/components/SpendingChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[180px] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-samparka border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun'];
const MONTH_VALUES = [8200, 11300, 9800, 14200, 10600, 12448];

export default function AnalyticsPage() {
  const maxMonth = Math.max(...MONTH_VALUES);

  function handleExport() {
    const csv = [
      ['Shop', 'Category', 'Amount', 'Date'],
      ...MY_RECEIPTS.map(r => [r.shop, r.category, r.amount.toFixed(2), r.time]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'Samparka-Analytics-June2025.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#F5F5F5] pb-24">

      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/receipts" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 btn-press">
            <BackIcon />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black text-gray-900">Analytics</h1>
            <p className="text-xs text-gray-400">June 2025</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-semibold text-samparka border border-samparka px-3 py-1.5 rounded-full btn-press hover:bg-samparka-light transition-colors"
          >
            <ExportIcon />Export CSV
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* Hero card */}
        <div className="bg-samparka rounded-2xl p-5 text-white">
          <p className="text-xs font-medium opacity-75 uppercase tracking-wider">Total Spent — June 2025</p>
          <p className="text-4xl font-black mt-1 tracking-tight">
            Rs {ANALYTICS_DATA.totalThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">
              {ANALYTICS_DATA.receiptCount} receipts
            </span>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">
              {ANALYTICS_DATA.categories.length} categories
            </span>
          </div>
        </div>

        {/* Monthly trend */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Monthly Trend</p>
          <div className="flex items-end gap-2 h-20">
            {MONTH_LABELS.map((label, i) => {
              const pct = (MONTH_VALUES[i] / maxMonth) * 100;
              const isLast = i === MONTH_LABELS.length - 1;
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: 64 }}>
                    <div
                      className={`w-full rounded-t-md transition-all ${isLast ? 'bg-samparka' : 'bg-gray-200'}`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold ${isLast ? 'text-samparka' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spending by category chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Spending by Category</p>
          <SpendingChart />
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category Breakdown</p>
          </div>
          <div className="divide-y divide-gray-50">
            {ANALYTICS_DATA.categories.map(cat => {
              const pct = (cat.amount / ANALYTICS_DATA.totalThisMonth) * 100;
              return (
                <div key={cat.name} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 tabular-nums">
                        Rs {cat.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-1.5">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Transactions</p>
            <Link href="/receipts" className="text-xs font-semibold text-samparka">See all</Link>
          </div>
          <div className="divide-y divide-gray-50 pb-1">
            {MY_RECEIPTS.slice(0, 5).map(item => (
              <Link
                key={item.id}
                href={`/r/${item.receiptRef}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: item.categoryColor + '20', color: item.categoryColor }}
                  >
                    {item.shop[0]}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800 leading-tight">{item.shop}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
                <span className="text-[13px] font-bold text-gray-900 tabular-nums">
                  Rs {item.amount.toLocaleString('en-IN')}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-300 pb-2">
          Powered by <span className="text-samparka font-semibold">Samparka</span>
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
