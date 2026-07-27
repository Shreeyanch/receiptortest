import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/mongodb';
import { WhatsAppSessionModel } from '@/lib/models/WhatsAppSession';

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const WHATSAPP_BOT_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || '';

/**
 * POST /api/whatsapp/share
 *
 * Generates a WhatsApp session token and returns a wa.me deep link
 * so the user can message the bot with their session token.
 *
 * Body: { receiptId: string }
 * Response: { success: true, waLink: string, sessionToken: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { receiptId } = await req.json();

    if (!receiptId) {
      return NextResponse.json(
        { success: false, error: 'receiptId is required' },
        { status: 400 }
      );
    }

    if (!WHATSAPP_BOT_NUMBER) {
      return NextResponse.json(
        {
          success: false,
          error:
            'WhatsApp bot number is not configured. Set NEXT_PUBLIC_WHATSAPP_BOT_NUMBER in your environment.',
        },
        { status: 500 }
      );
    }

    await connectDB();

    // Generate a short, human-readable session token
    const sessionToken = nanoid(8).toUpperCase();

    // Session expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await WhatsAppSessionModel.create({
      sessionToken,
      linkedReceiptIds: [receiptId],
      isVerified: false,
      expiresAt,
    });

    // Build the WhatsApp deep link
    // The message includes the session token so the bot can identify the user
    const message = encodeURIComponent(
      `My Samparka session is ${sessionToken}`
    );
    const waLink = `https://wa.me/${WHATSAPP_BOT_NUMBER}?text=${message}`;

    return NextResponse.json(
      {
        success: true,
        waLink,
        sessionToken,
        loginLink: `${BASE_URL}/login?token=${sessionToken}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/whatsapp/share:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate WhatsApp link' },
      { status: 500 }
    );
  }
}
