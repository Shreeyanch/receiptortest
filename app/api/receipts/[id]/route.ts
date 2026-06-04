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
