import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models/User';
import { RestaurantModel } from '@/lib/models/Restaurant';
import { SessionModel } from '@/lib/models/Session';

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

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

    let sessionData: { userType: 'user' | 'staff'; userId: string; userData: Record<string, unknown> } | null = null;

    /* ── Try user login (by phone) ── */
    const user = await UserModel.findOne({ phone: { $in: phoneVariants }, password }).lean();
    if (user) {
      sessionData = {
        userType: 'user',
        userId: String(user._id),
        userData: { id: String(user._id), name: user.name, phone: user.phone },
      };
    }

    /* ── Try staff login (by staffId) ── */
    if (!sessionData) {
      const restaurant = await RestaurantModel.findOne({
        'staff.staffId': loginId,
      }).lean();

      if (restaurant) {
        const staff = restaurant.staff.find(s => s.staffId === loginId);
        if (staff && password === '1234') {
          sessionData = {
            userType: 'staff',
            userId: staff.staffId,
            userData: {
              staffId: staff.staffId,
              name: staff.name,
              restaurant: { id: String(restaurant._id), name: restaurant.name, location: restaurant.location },
            },
          };
        }
      }
    }

    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    /* ── Create server-side session ── */
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

    await SessionModel.create({
      token,
      userId: sessionData.userId,
      userType: sessionData.userType,
      userData: sessionData.userData,
      expiresAt,
    });

    /* ── Set HttpOnly cookie + return user data for UI ── */
    const response = NextResponse.json({
      success: true,
      type: sessionData.userType,
      ...(sessionData.userType === 'user'
        ? { user: sessionData.userData }
        : { staff: sessionData.userData, restaurant: (sessionData.userData as any).restaurant }),
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error('POST /api/auth/login:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
