import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { WhatsAppSessionModel } from '@/lib/models/WhatsAppSession';

/**
 * GET /api/whatsapp/session?token=XYZ
 *
 * Validates a session token and returns the session data.
 * Used by the /login page to verify magic links.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const session = await WhatsAppSessionModel.findOne({
      sessionToken: token,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        sessionToken: session.sessionToken,
        phoneNumber: session.phoneNumber || null,
        linkedReceiptIds: session.linkedReceiptIds,
        isVerified: session.isVerified,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    console.error('GET /api/whatsapp/session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate session' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/whatsapp/session
 *
 * Allows linking a phone number to an existing session.
 * Body: { token: string, phoneNumber: string }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { token, phoneNumber } = await req.json();

    if (!token || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Token and phoneNumber are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const session = await WhatsAppSessionModel.findOneAndUpdate(
      {
        sessionToken: token,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: { phoneNumber, isVerified: true },
      },
      { new: true }
    ).lean();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/whatsapp/session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to link phone number' },
      { status: 500 }
    );
  }
}
