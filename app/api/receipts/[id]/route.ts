import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ReceiptModel } from '@/lib/models/Receipt';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const receipt = await ReceiptModel.findOne({ receiptId: params.id }).lean();

    if (!receipt) {
      return NextResponse.json(
        { success: false, error: 'Receipt not found' },
        { status: 404 }
      );
    }

    // Fire-and-forget view count increment
    ReceiptModel.updateOne(
      { receiptId: params.id },
      { $inc: { viewCount: 1 } }
    ).exec();

    return NextResponse.json({ success: true, receipt });
  } catch (error) {
    console.error(`GET /api/receipts/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch receipt' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    await ReceiptModel.updateOne(
      { receiptId: params.id },
      { $addToSet: { viewedBy: userId } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`POST /api/receipts/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to record view' },
      { status: 500 }
    );
  }
}
