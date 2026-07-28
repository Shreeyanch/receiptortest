import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { RestaurantModel } from '@/lib/models/Restaurant';
import { UserModel } from '@/lib/models/User';
import { WhatsAppSessionModel } from '@/lib/models/WhatsAppSession';

export async function POST() {
  try {
    await connectDB();

    /* ── Seed restaurant ── */
    const restaurant = await RestaurantModel.findOneAndUpdate(
      { name: 'Himalayan Coffee House' },
      {
        $set: {
          name: 'Himalayan Coffee House',
          location: 'Thamel, Kathmandu',
          phone: '+977-1-4567890',
          staff: [
            { staffId: '1212', name: 'Aarav Sharma' },
            { staffId: '1313', name: 'Priya Tamang' },
            { staffId: '1414', name: 'Rohan Gurung' },
          ],
        },
      },
      { upsert: true, new: true }
    );

    /* ── Seed user ── */
    const user = await UserModel.findOneAndUpdate(
      { phone: '+977-9812345678' },
      {
        $setOnInsert: {
          name: 'Shreeyanch Shrestha',
          phone: '+977-9812345678',
          password: '1234',
          sessionToken: 'SHREE-SAM-2025',
        },
      },
      { upsert: true, new: true }
    );

    /* ── Seed WhatsApp session for user ── */
    const session = await WhatsAppSessionModel.findOneAndUpdate(
      { phoneNumber: '+977-9812345678' },
      {
        $setOnInsert: {
          sessionToken: 'SHREE-SAM-2025',
          phoneNumber: '+977-9812345678',
          linkedReceiptIds: [],
          isVerified: true,
          expiresAt: new Date('2030-12-31'),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      restaurant: { id: restaurant._id, name: restaurant.name, staff: restaurant.staff },
      user: { id: user._id, name: user.name, phone: user.phone },
      session: { id: session._id, token: session.sessionToken, phone: session.phoneNumber },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/seed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed data' },
      { status: 500 }
    );
  }
}
