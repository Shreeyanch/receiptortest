import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ReceiptModel } from '@/lib/models/Receipt';
import { verifySession } from '@/lib/verifySession';

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
    const session = await verifySession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    await ReceiptModel.updateOne(
      { receiptId: params.id },
      { $addToSet: { viewedBy: session.userId } }
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
