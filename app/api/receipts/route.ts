import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/mongodb';
import { ReceiptModel } from '@/lib/models/Receipt';

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
    return NextResponse.json({ success: true, receipts });
  } catch (error) {
    console.error('GET /api/receipts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}
