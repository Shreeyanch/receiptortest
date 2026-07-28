'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  Search,
  Bell,
  ChevronRight,
  Coffee,
  ShoppingCart,
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  Film,
  HeartPulse,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { type ReceiptListItem } from '@/lib/dummyData';
import { usePreferences } from '@/lib/PreferencesContext';
import { useReceipts } from '@/lib/ReceiptsContext';
import { formatCurrency, type CurrencyCode } from '@/lib/formatCurrency';

const FILTERS = ['All', 'Today', 'This Week'] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_TRANSLATION_KEYS: Record<string, string> = {
  All: 'receipts.filter.all',
  Today: 'receipts.filter.today',
  'This Week': 'receipts.filter.thisWeek',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Food & Drink': Coffee,
  Groceries: ShoppingCart,
  Shopping: ShoppingBag,
  Restaurants: Utensils,
  Transport: Car,
  Utilities: Zap,
  Entertainment: Film,
  Health: HeartPulse,
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Cleared: { bg: 'bg-success/12', text: 'text-success' },
  Processing: { bg: 'bg-warning/12', text: 'text-warning' },
  Refunded: { bg: 'bg-destructive/12', text: 'text-destructive' },
};

function getDelay(index: number): string {
  const delays = ['0s', '0.06s', '0.12s', '0.18s', '0.24s', '0.3s', '0.36s', '0.42s', '0.48s', '0.54s'];
  return delays[index] ?? '0.6s';
}

function ReceiptRow({ item, index }: { item: ReceiptListItem; index: number }) {
  const { currency } = usePreferences();
  const IconComp = CATEGORY_ICONS[item.category] ?? Coffee;
  const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.Cleared;

  return (
    <Link
      href={`/r/${item.receiptRef}`}
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 active:bg-muted/60"
      style={{ animationDelay: getDelay(index) }}
    >
      {/* Category icon circle */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: item.categoryColor + '18' }}
      >
        <IconComp size={18} style={{ color: item.categoryColor }} />
      </div>

      {/* Middle content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-foreground">{item.shop}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{item.time}</span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor: item.categoryColor + '14',
              color: item.categoryColor,
            }}
          >
            {item.category}
          </span>
        </div>
      </div>

      {/* Right: amount + status + chevron */}
      <div className="flex flex-shrink-0 items-center gap-2">
        <div className="text-right">
          <span className="font-mono text-[13.5px] font-bold tabular-nums text-foreground">
            {formatCurrency(item.amount, currency as CurrencyCode)}
          </span>
          <div className="mt-0.5">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide ${statusStyle.bg} ${statusStyle.text}`}
            >
              {item.status}
            </span>
          </div>
        </div>
        <ChevronRight size={16} className="flex-shrink-0 text-border" />
      </div>
    </Link>
  );
}

export default function ReceiptsPage() {
  const { t, currency } = usePreferences();
  const { setReceipts: setContextReceipts } = useReceipts();
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/receipts')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.receipts.length > 0) {
          const enriched = json.receipts.map((r: ReceiptListItem & { items?: ReceiptListItem['items'] }) => ({
            ...r,
            receiptRef: r.receiptRef || r.receiptId,
            isDummy: false,
          }));
          setReceipts(enriched);
          setContextReceipts(enriched);
        } else {
          setReceipts([]);
          setContextReceipts([]);
        }
      })
      .catch(() => {
        setReceipts([]);
        setContextReceipts([]);
      })
      .finally(() => setLoading(false));
  }, [setContextReceipts]);

  const filtered = useMemo(() => {
    let list = receipts;

    if (filter === 'Today')
      list = list.filter((r) => r.time.toLowerCase().startsWith('today'));
    if (filter === 'This Week')
      list = list.filter((r) =>
        ['today', 'yesterday', '2 days', '3 days', '4 days', '5 days'].some((k) =>
          r.time.toLowerCase().includes(k)
        )
      );

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.shop.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [filter, search, receipts]);

  const totalFiltered = filtered.reduce((s, r) => s + r.amount, 0);

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background pb-32">
      {/* ── Header card ── */}
      <header className="animate-fade-slide-down px-4 pb-4 pt-12">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-foreground">
              {t('receipts.title')}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">June 2025</p>
          </div>
          <button
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted active:scale-95"
          >
            <Bell size={18} className="text-foreground" />
          </button>
        </div>

        {/* Emerald total-spent card */}
        <div
          className="rounded-[var(--radius)] p-4 text-white"
          style={{ backgroundColor: 'oklch(0.52 0.11 162)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider opacity-80">
                {t('receipts.thisMonth')}
              </p>
              <p className="mt-0.5 font-mono text-2xl font-black tabular-nums">
                {formatCurrency(totalFiltered, currency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wider opacity-80">
                {t('receipts.receipts')}
              </p>
              <p className="mt-0.5 font-mono text-2xl font-black tabular-nums">
                {filtered.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Search bar ── */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder={t('receipts.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[var(--radius)] border border-border bg-card py-3 pl-9 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/10"
          />
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div
        className="flex gap-2 overflow-x-auto px-4 pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`animate-soft-pop flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all btn-press
              ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground'
              }`}
          >
            {t(FILTER_TRANSLATION_KEYS[f])}
          </button>
        ))}
      </div>

      {/* ── Receipt list ── */}
      <div className="px-4 pt-1">
        <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card">
          {loading ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 w-32 h-32">
                <DotLottieReact
                  src="/aIXJHzLGsG.lottie"
                  loop
                  autoplay
                />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('receipts.loading')}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 w-32 h-32">
                <DotLottieReact
                  src="/aIXJHzLGsG.lottie"
                  loop
                  autoplay
                />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('receipts.empty.title')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/50">
                {search
                  ? t('receipts.empty.search')
                  : t('receipts.empty.filter')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filtered.map((item, i) => (
                <div key={item.id} className="animate-receipt-rise">
                  <ReceiptRow item={item} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Count */}
        <p className="mt-4 text-center text-[11px] text-muted-foreground/40">
          {t('receipts.shown', { n: filtered.length })}
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
