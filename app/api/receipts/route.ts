import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/mongodb';
import { ReceiptModel, type IReceipt } from '@/lib/models/Receipt';
import { categorizeReceipt } from '@/lib/categories';

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://receiptortest.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectDB();

    const receiptId = nanoid(6);
    const receipt = await ReceiptModel.create({ receiptId, ...body });

    return NextResponse.json(
      {
        success: true,
        receiptId: receipt.receiptId,
        url: `${BASE_URL}/r/${receipt.receiptId}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/receipts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create receipt' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const receipts = await ReceiptModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    const categorized = receipts.map((r) => {
      const { category, color } = categorizeReceipt(r.items);

      const d = new Date(r.createdAt);
      const now = new Date();
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
        receiptId: r.receiptId,
        items: r.items,
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json({ success: true, receipts: categorized });
  } catch (error) {
    console.error('GET /api/receipts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}
