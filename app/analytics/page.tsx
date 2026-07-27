'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
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
import { usePreferences } from '@/lib/PreferencesContext';
import { formatCurrency, type CurrencyCode } from '@/lib/formatCurrency';
import {
  TREND_DAYS,
  MONTHLY_TOTAL,
  PREV_MONTH_TOTAL,
  CATEGORY_BREAKDOWN,
  RECENT_TRANSACTIONS,
  type TrendPoint,
} from '@/lib/analyticsData';

type Range = '1W' | '1M' | '3M' | '1Y';
const RANGES: Range[] = ['1W', '1M', '3M', '1Y'];

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

/* ── Chart constants ── */
const SVG_W = 340;
const SVG_H = 170;
const PAD = { t: 8, b: 24, l: 8, r: 8 };
const CHART_W = SVG_W - PAD.l - PAD.r;
const CHART_H = SVG_H - PAD.t - PAD.b;

/* ── Helpers ── */
function getDelay(index: number): string {
  const delays = ['0s', '0.06s', '0.12s', '0.18s', '0.24s', '0.3s', '0.36s', '0.42s'];
  return delays[index] ?? '0.5s';
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const cx1 = a.x + (b.x - a.x) / 2;
    const cy1 = a.y;
    const cx2 = cx1;
    const cy2 = b.y;
    d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${b.x} ${b.y}`;
  }
  return d;
}

function buildAreaPath(linePath: string, leftX: number, rightX: number, bottomY: number): string {
  return linePath + ` L ${rightX} ${bottomY} L ${leftX} ${bottomY} Z`;
}

/* ── SVG Line Chart ── */
function TrendChart({
  data,
  currency,
}: {
  data: TrendPoint[];
  currency: CurrencyCode;
}) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: number;
    label: string;
  } | null>(null);

  const { points, maxVal, pathD, areaD } = useMemo(() => {
    const pts = data.map((d, i) => ({
      x: PAD.l + (i / Math.max(data.length - 1, 1)) * CHART_W,
      y: PAD.t + CHART_H - (d.amount / 2200) * CHART_H, // scale to ~2200 max
      value: d.amount,
      label: d.date,
    }));
    const max = Math.max(...data.map((d) => d.amount), 1);
    const line = buildSmoothPath(pts);
    const area = buildAreaPath(line, pts[0]?.x ?? PAD.l, pts[pts.length - 1]?.x ?? PAD.l + CHART_W, PAD.t + CHART_H);
    return { points: pts, maxVal: max, pathD: line, areaD: area };
  }, [data]);

  const pathLen = useMemo(() => {
    if (typeof document === 'undefined') return 800;
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', pathD);
    return el.getTotalLength?.() ?? 800;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathD]);

  /* x-axis labels: show ~6 evenly spaced */
  const xLabels = useMemo(() => {
    const count = Math.min(data.length, 6);
    const step = Math.max(1, Math.floor((data.length - 1) / (count - 1)));
    const indices: number[] = [];
    for (let i = 0; i < data.length; i += step) {
      indices.push(i);
    }
    if (indices[indices.length - 1] !== data.length - 1) {
      indices[indices.length - 1] = data.length - 1;
    }
    return indices.map((i) => ({
      x: PAD.l + (i / Math.max(data.length - 1, 1)) * CHART_W,
      label: data[i].date,
    }));
  }, [data]);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-auto overflow-visible"
        aria-label="Monthly spending trend line chart"
        role="img"
      >
        <title>Monthly spending trend. Highest point Rs {maxVal.toLocaleString('en-IN')}</title>

        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = PAD.t + CHART_H * (1 - frac);
          return (
            <line
              key={frac}
              x1={PAD.l}
              y1={y}
              x2={PAD.l + CHART_W}
              y2={y}
              stroke="oklch(0.9 0.006 106)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Definition for gradient fill */}
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.52 0.11 162)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="oklch(0.52 0.11 162)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={areaD}
          fill="url(#trendFill)"
          className="animate-trend-fade"
          style={{ animationDelay: '0.3s' }}
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="oklch(0.52 0.11 162)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLen}
          strokeDashoffset={pathLen}
          className="animate-trend-draw"
          style={{ '--path-length': pathLen } as React.CSSProperties}
        />

        {/* Dot markers + hover areas */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="3"
              fill="oklch(0.52 0.11 162)"
              className="animate-trend-fade"
              style={{ animationDelay: `${0.8 + i * 0.03}s` }}
            />
            {/* Invisible larger hit area for hover */}
            <rect
              x={p.x - 12}
              y={p.y - 12}
              width="24"
              height="24"
              fill="transparent"
              onMouseEnter={() =>
                setTooltip({ x: p.x, y: p.y, value: p.value, label: p.label })
              }
              onMouseLeave={() => setTooltip(null)}
              className="cursor-pointer"
            />
          </g>
        ))}

        {/* X-axis labels */}
        {xLabels.map((xl, i) => (
          <text
            key={i}
            x={xl.x}
            y={SVG_H - 2}
            textAnchor="middle"
            fill="oklch(0.52 0.012 100)"
            fontSize="9"
            fontFamily="var(--font-geist-mono), monospace"
          >
            {xl.label}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(tooltip.x / SVG_W) * 100}%`,
            top: `${(tooltip.y / SVG_H) * 100}%`,
          }}
        >
          <div className="mb-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-lg">
            <p className="text-[10px] text-muted-foreground">{tooltip.label}</p>
            <p className="font-mono text-xs font-bold tabular-nums text-foreground">
              {formatCurrency(tooltip.value, currency)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Category Bar Row ── */
function CategoryBar({
  name,
  amount,
  color,
  percentage,
  index,
  currency,
}: {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  index: number;
  currency: CurrencyCode;
}) {
  const IconComp = CATEGORY_ICONS[name] ?? ShoppingBag;
  return (
    <div
      className="animate-receipt-rise flex items-center gap-3 px-4 py-2.5"
      style={{ animationDelay: getDelay(index) }}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: color + '18' }}
      >
        <IconComp size={16} style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="truncate text-[13px] font-semibold text-foreground">{name}</span>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <span className="font-mono text-[13px] font-bold tabular-nums text-foreground">
              {formatCurrency(amount, currency)}
            </span>
            <span className="text-[10px] text-muted-foreground">{percentage.toFixed(1)}%</span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="animate-bar-grow h-full rounded-full"
            style={{
              '--bar-width': `${percentage}%`,
              backgroundColor: color,
              width: `${percentage}%`,
            } as React.CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function AnalyticsPage() {
  const { currency, t } = usePreferences();
  const [range, setRange] = useState<Range>('1M');

  const trendData = useMemo(() => {
    switch (range) {
      case '1W':
        return TREND_DAYS.slice(-7);
      case '1M':
        return TREND_DAYS;
      case '3M': {
        // Simulate 3 months by repeating data with varied values
        const factor = [1.0, 0.92, 1.08];
        return TREND_DAYS.map((d, i) => ({
          ...d,
          amount: Math.round(d.amount * factor[i % 3]),
        }));
      }
      case '1Y': {
        // Simulate 12 monthly data points
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthValues = [38500, 36200, 41800, 39400, 37200, 41820, 40500, 42800, 39600, 41200, 38900, 43500];
        return months.map((m, i) => ({
          date: m,
          label: '',
          amount: monthValues[i],
        }));
      }
    }
  }, [range]);

  const delta = MONTHLY_TOTAL - PREV_MONTH_TOTAL;
  const deltaPct = ((delta / PREV_MONTH_TOTAL) * 100).toFixed(1);
  const isUp = delta >= 0;

  const avgPerDay = Math.round(MONTHLY_TOTAL / 30);
  const avgPrevDay = Math.round(PREV_MONTH_TOTAL / 30);
  const avgDelta = avgPerDay - avgPrevDay;
  const avgDeltaPct = ((avgDelta / avgPrevDay) * 100).toFixed(1);

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background pb-32">
      {/* ── Header card ── */}
      <header className="animate-fade-slide-down px-4 pb-4 pt-12">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/receipts"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted active:scale-95"
              aria-label="Back to receipts"
            >
              <ChevronLeft size={18} className="text-foreground" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-foreground">{t('analytics.title')}</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">June 2025</p>
            </div>
          </div>
          <button
            aria-label="Download report"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted active:scale-95"
          >
            <Download size={18} className="text-foreground" />
            <span className="sr-only">Download report</span>
          </button>
        </div>

        {/* Emerald total-spent card */}
        <div
          className="relative overflow-hidden rounded-[var(--radius)] p-5 text-white"
          style={{ backgroundColor: 'oklch(0.52 0.11 162)' }}
        >
          {/* Subtle decorative blobs */}
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-30"
            style={{ backgroundColor: 'oklch(0.6 0.13 155)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full opacity-20"
            style={{ backgroundColor: 'oklch(0.7 0.1 170)' }}
          />

          <div className="relative z-10">
            <p className="text-[11px] font-medium uppercase tracking-wider opacity-80">
              {t('analytics.totalSpent')}
            </p>
            <p className="mt-1 font-mono text-3xl font-black tabular-nums tracking-tight">
              {formatCurrency(MONTHLY_TOTAL, currency)}
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
              <TrendingUp size={14} className={isUp ? 'text-green-300' : 'text-red-300'} />
              <span>
                {isUp ? '+' : ''}{deltaPct}% vs last month
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Range toggle chips ── */}
      <div
        className="flex gap-2 overflow-x-auto px-4 pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`animate-soft-pop flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all btn-press ${
              range === r
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-muted-foreground'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* ── Monthly Trend chart ── */}
      <div className="px-4 pb-3">
        <div className="rounded-[var(--radius)] border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('analytics.monthlyTrend')}
            </p>
            <span className="text-[10px] text-muted-foreground/60">
              {range === '1Y' ? 'Monthly' : 'Daily'} spend
            </span>
          </div>
          <TrendChart data={trendData} currency={currency} />
        </div>
      </div>

      {/* ── Stat cards (2-col grid) ── */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-3">
        <div className="animate-receipt-rise rounded-[var(--radius)] border border-border bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Avg / day
          </p>
          <p className="mt-1 font-mono text-lg font-black tabular-nums text-foreground">
            {formatCurrency(avgPerDay, currency)}
          </p>
          <p className="mt-0.5 flex items-center gap-0.5 text-[10px] font-medium" style={{ color: avgDelta >= 0 ? 'oklch(0.6 0.13 155)' : 'oklch(0.577 0.2 27.325)' }}>
            <TrendingUp size={11} />
            {avgDelta >= 0 ? '+' : ''}{avgDeltaPct}%
          </p>
        </div>
        <div className="animate-receipt-rise rounded-[var(--radius)] border border-border bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Transactions
          </p>
          <p className="mt-1 font-mono text-lg font-black tabular-nums text-foreground">
            {TREND_DAYS.filter((d) => d.amount > 0).length}
          </p>
          <p className="mt-0.5 flex items-center gap-0.5 text-[10px] font-medium text-success">
            <TrendingUp size={11} />
            +8.2%
          </p>
        </div>
      </div>

      {/* ── Category Breakdown ── */}
      <div className="px-4 pb-3">
        <div className="rounded-[var(--radius)] border border-border bg-card">
          <div className="px-4 pb-1 pt-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('analytics.spendingByCategory')}
            </p>
          </div>
          <div className="divide-y divide-border/60">
            {CATEGORY_BREAKDOWN.map((cat, i) => (
              <CategoryBar
                key={cat.name}
                name={cat.name}
                amount={cat.amount}
                color={cat.color}
                percentage={cat.percentage}
                index={i}
                currency={currency}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="px-4 pb-3">
        <div className="rounded-[var(--radius)] border border-border bg-card">
          <div className="flex items-center justify-between px-4 pb-1 pt-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('analytics.recentTransactions')}
            </p>
            <Link
              href="/receipts"
              className="text-[11px] font-semibold transition-colors hover:opacity-80"
              style={{ color: 'oklch(0.52 0.11 162)' }}
            >
              {t('analytics.seeAll')}
            </Link>
          </div>
          <div className="divide-y divide-border/60">
            {RECENT_TRANSACTIONS.map((item, i) => {
              const IconComp = CATEGORY_ICONS[item.category] ?? ShoppingBag;
              return (
                <Link
                  key={item.id}
                  href={`/r/${item.receiptRef}`}
                  className="animate-receipt-rise flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 active:bg-muted/60"
                  style={{ animationDelay: getDelay(i) }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: item.categoryColor + '18' }}
                  >
                    <IconComp size={16} style={{ color: item.categoryColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">{item.shop}</p>
                    <p className="font-mono text-[10px] tabular-nums text-muted-foreground">{item.time}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <span className="font-mono text-[13px] font-bold tabular-nums text-foreground">
                      {formatCurrency(item.amount, currency)}
                    </span>
                    <ChevronRight size={14} className="text-border" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <p className="px-4 text-center text-[10px] text-muted-foreground/40">
        <span className="sr-only">Powered by </span>Samparka
      </p>

      <BottomNav />
    </main>
  );
}
