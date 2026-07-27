import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { RatingModel } from '@/lib/models/Rating';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { receiptId, shopName, stars, comment, contact } = body;

    if (!receiptId || !shopName || !stars || stars < 1 || stars > 3) {
      return NextResponse.json(
        { success: false, error: 'Invalid rating data' },
        { status: 400 }
      );
    }

    await connectDB();

    const rating = await RatingModel.create({
      receiptId,
      shopName,
      stars,
      comment: comment || '',
      contact: contact || '',
    });

    return NextResponse.json(
      { success: true, ratingId: rating._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/ratings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}
