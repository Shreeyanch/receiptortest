import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { SessionModel } from '@/lib/models/Session';

export interface SessionUser {
  userId: string;
  userType: 'user' | 'staff';
  userData: Record<string, unknown>;
}

export async function verifySession(req: NextRequest): Promise<SessionUser | null> {
  try {
    const token = req.cookies.get('session')?.value;
    if (!token) return null;

    await connectDB();
    const session = await SessionModel.findOne({ token }).lean();
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      await SessionModel.deleteOne({ token });
      return null;
    }

    return {
      userId: session.userId,
      userType: session.userType,
      userData: session.userData,
    };
  } catch {
    return null;
  }
}
