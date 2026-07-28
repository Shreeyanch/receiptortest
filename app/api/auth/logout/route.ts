import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { SessionModel } from '@/lib/models/Session';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('session')?.value;

    if (token) {
      await connectDB();
      await SessionModel.deleteOne({ token });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('session', '', { maxAge: 0, path: '/' });
    return response;
  } catch (error) {
    console.error('POST /api/auth/logout:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
