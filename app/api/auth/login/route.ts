import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { RestaurantModel } from '@/lib/models/Restaurant';

export async function POST(req: NextRequest) {
  try {
    const { loginId, password } = await req.json();

    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, error: 'Login ID and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    /* ── Normalize phone: try with and without +977- prefix ── */
    const phoneVariants = [loginId];
    if (/^98\d{8}$/.test(loginId)) {
      phoneVariants.push(`+977-${loginId}`);
    }
    if (loginId.startsWith('+977-') && loginId.length === 13) {
      phoneVariants.push(loginId.replace('+977-', ''));
    }

    /* ── Try user login (by phone) ── */
    const user = await UserModel.findOne({ phone: { $in: phoneVariants }, password }).lean();
    if (user) {
      return NextResponse.json({
        success: true,
        type: 'user',
        user: { id: user._id, name: user.name, phone: user.phone },
      });
    }

    /* ── Try staff login (by staffId) ── */
    const restaurant = await RestaurantModel.findOne({
      'staff.staffId': loginId,
    }).lean();

    if (restaurant) {
      const staff = restaurant.staff.find(s => s.staffId === loginId);
      if (staff && password === '1234') {
        return NextResponse.json({
          success: true,
          type: 'staff',
          staff: { staffId: staff.staffId, name: staff.name },
          restaurant: { id: restaurant._id, name: restaurant.name, location: restaurant.location },
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('POST /api/auth/login:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
