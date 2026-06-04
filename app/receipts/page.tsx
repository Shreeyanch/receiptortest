'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { MY_RECEIPTS, type ReceiptListItem } from '@/lib/dummyData';

const FILTERS = ['All', 'Today', 'This Week', 'Processing', 'Refunded'] as const;
type Filter = typeof FILTERS[number];

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

function ReceiptRow({ item }: { item: ReceiptListItem }) {
  return (
    <Link href={`/r/${item.receiptRef}`} className="flex items-center gap-3 py-3.5 px-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
      {/* Category dot */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
        style={{ backgroundColor: item.categoryColor + '22', color: item.categoryColor }}
      >
        {item.shop[0]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-[13.5px] truncate">{item.shop}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-gray-400">{item.time}</span>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: item.categoryColor + '18', color: item.categoryColor }}
          >
            {item.category}
          </span>
        </div>
      </div>

      {/* Amount + chevron */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="font-bold text-[13.5px] text-gray-900 tabular-nums">
          Rs {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
        <ChevronRight />
      </div>
    </Link>
  );
}

export default function ReceiptsPage() {
  const [filter, setFilter]   = useState<Filter>('All');
  const [search, setSearch]   = useState('');
  const [addTooltip, setAddTooltip] = useState(false);

  const total = MY_RECEIPTS.reduce((s, r) => s + r.amount, 0);

  const filtered = useMemo(() => {
    let list = MY_RECEIPTS;

    if (filter === 'Today')     list = list.filter(r => r.time.toLowerCase().startsWith('today'));
    if (filter === 'This Week') list = list.filter(r => ['today', 'yesterday', '2 days', '3 days', '4 days', '5 days'].some(k => r.time.toLowerCase().includes(k)));
    if (filter === 'Processing' || filter === 'Refunded') list = [];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.shop.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }

    return list;
  }, [filter, search]);

  return (
    <main className="min-h-screen bg-[#F5F5F5] pb-24">

      {/* ── Header ── */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">My Receipts</h1>
            <p className="text-xs text-gray-400 mt-0.5">June 2025</p>
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
            <BellIcon />
          </button>
        </div>

        {/* Summary card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-samparka rounded-2xl p-4 flex items-center justify-between text-white">
            <div>
              <p className="text-[11px] font-medium opacity-80 uppercase tracking-wider">This Month</p>
              <p className="text-2xl font-black mt-0.5">
                Rs {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium opacity-80 uppercase tracking-wider">Receipts</p>
              <p className="text-2xl font-black mt-0.5">{MY_RECEIPTS.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">

        {/* Search */}
        <div className="relative mb-3">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search receipts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white rounded-2xl pl-9 pr-4 py-3 text-sm text-gray-700 shadow-sm border border-gray-100 outline-none focus:border-samparka focus:ring-2 focus:ring-samparka/10 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all btn-press
                ${filter === f
                  ? 'bg-samparka text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Receipts list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-300 text-4xl mb-3">🧾</p>
              <p className="text-gray-400 text-sm font-medium">No receipts found</p>
              <p className="text-gray-300 text-xs mt-1">
                {search ? 'Try a different search term' : 'No receipts in this category'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((item, i) => (
                <ReceiptRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-4">
          {filtered.length} receipt{filtered.length !== 1 ? 's' : ''} shown
        </p>
      </div>

      {/* ── FAB ── */}
      <div className="fixed bottom-20 right-4 z-40">
        <div className="relative">
          {addTooltip && (
            <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl">
              Add receipt manually
              <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900" />
            </div>
          )}
          <button
            onClick={() => { setAddTooltip(true); setTimeout(() => setAddTooltip(false), 2000); }}
            className="w-14 h-14 bg-samparka rounded-full shadow-[0_4px_16px_rgba(29,158,117,0.4)] flex items-center justify-center btn-press"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
