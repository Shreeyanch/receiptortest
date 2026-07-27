import { NextRequest, NextResponse } from 'next/server';

/**
 * WhatsApp Cloud API Webhook
 *
 * GET  — Verification: Meta sends a GET with hub.challenge to verify your webhook.
 * POST — Incoming messages: Meta forwards user messages here.
 *
 * For now this returns a placeholder. When you integrate the actual WhatsApp
 * Business API, you'll need to:
 * 1. Verify the webhook with Meta
 * 2. Parse incoming messages
 * 3. Look up the session token
 * 4. Fetch linked receipts from MongoDB
 * 5. Send back a reply with receipt links
 */

// Meta sends a verification request when setting up the webhook
// See: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
const VERIFY_TOKEN =
  process.env.WHATSAPP_VERIFY_TOKEN || 'samparka_verify_2025';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
    console.log('✅ WhatsApp webhook verified!');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { error: 'Verification failed' },
    { status: 403 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📩 WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // TODO: Parse the incoming message and handle it
    // 1. Extract the sender's phone number from body.entry[].changes[].value.messages[].from
    // 2. Extract the message text from body.entry[].changes[].value.messages[].text.body
    // 3. Look up the WhatsAppSession by the session token in the message
    // 4. Update the session with the phone number and mark as verified
    // 5. Fetch the linked receipts from the ReceiptModel
    // 6. Send a reply via WhatsApp Cloud API with receipt links

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    );
  }
}
