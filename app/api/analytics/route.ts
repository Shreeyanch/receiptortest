import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ReceiptModel } from '@/lib/models/Receipt';
import { verifySession } from '@/lib/verifySession';
import { categorizeReceipt, getCategoryColor } from '@/lib/categories';

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) {
      return NextResponse.json({ success: true, empty: true });
    }

    await connectDB();

    const receipts = await ReceiptModel.find({ viewedBy: session.userId })
      .sort({ createdAt: -1 })
      .lean();

    if (receipts.length === 0) {
      return NextResponse.json({ success: true, empty: true });
    }

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    /* ── Totals ── */
    let monthlyTotal = 0;
    let prevMonthTotal = 0;
    for (const r of receipts) {
      const d = new Date(r.createdAt);
      if (d >= thisMonthStart) monthlyTotal += r.total;
      else if (d >= prevMonthStart && d <= prevMonthEnd) prevMonthTotal += r.total;
    }

    /* ── Trend: daily spend for last 30 days ── */
    const dailyMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = 0;
    }
    for (const r of receipts) {
      const key = new Date(r.createdAt).toISOString().slice(0, 10);
      if (key in dailyMap) dailyMap[key] += r.total;
    }
    const trendDays = Object.entries(dailyMap).map(([dateStr, amount]) => {
      const d = new Date(dateStr + 'T00:00:00');
      return {
        date: d.toLocaleString('en', { month: 'short', day: 'numeric' }),
        label: '',
        amount: Math.round(amount),
      };
    });

    /* ── Monthly trend: last 12 months ── */
    const monthlyMap: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en', { month: 'short' });
      monthlyMap[key] = 0;
    }
    for (const r of receipts) {
      const d = new Date(r.createdAt);
      const key = d.toLocaleString('en', { month: 'short' });
      if (key in monthlyMap) monthlyMap[key] += r.total;
    }
    const trendMonths = Object.entries(monthlyMap).map(([month, amount]) => ({
      date: month,
      label: '',
      amount: Math.round(amount),
    }));

    /* ── Category breakdown ── */
    const catMap: Record<string, number> = {};
    for (const r of receipts) {
      const { category } = categorizeReceipt(r.items);
      catMap[category] = (catMap[category] || 0) + r.total;
    }
    const totalAll = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;
    const categoryBreakdown = Object.entries(catMap)
      .map(([name, amount]) => ({
        name,
        amount: Math.round(amount),
        color: getCategoryColor(name),
        percentage: (amount / totalAll) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);

    /* ── Recent transactions (last 5) ── */
    const recent = receipts.slice(0, 5).map((r) => {
      const { category, color } = categorizeReceipt(r.items);
      const d = new Date(r.createdAt);
      const diffMs = now.getTime() - d.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let timeLabel: string;
      if (diffDays === 0) {
        const h = d.getHours();
        const m = d.getMinutes();
        const ampm = h >= 12 ? 'pm' : 'am';
        const h12 = h % 12 || 12;
        timeLabel = `Today ${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
      } else if (diffDays === 1) {
        timeLabel = 'Yesterday';
      } else if (diffDays < 7) {
        timeLabel = `${diffDays} days ago`;
      } else {
        timeLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      return {
        id: r._id,
        shop: r.shopName,
        amount: r.total,
        category,
        categoryColor: color,
        time: timeLabel,
        receiptRef: r.receiptId,
      };
    });

    /* ── Transaction count ── */
    const thisMonthCount = receipts.filter(
      (r) => new Date(r.createdAt) >= thisMonthStart
    ).length;
    const prevMonthCount = receipts.filter(
      (r) => new Date(r.createdAt) >= prevMonthStart && new Date(r.createdAt) <= prevMonthEnd
    ).length;

    return NextResponse.json({
      success: true,
      monthlyTotal: Math.round(monthlyTotal),
      prevMonthTotal: Math.round(prevMonthTotal),
      trendDays,
      trendMonths,
      categoryBreakdown,
      recentTransactions: recent,
      thisMonthCount,
      prevMonthCount,
    });
  } catch (error) {
    console.error('GET /api/analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
