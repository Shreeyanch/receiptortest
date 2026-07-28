import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { OrderModel } from '@/lib/models/Order';

const TAX_RATE = 0.13;

/* ── GET /api/orders?restaurantId=XYZ&status=open ── */
export async function GET(req: NextRequest) {
  try {
    const restaurantId = req.nextUrl.searchParams.get('restaurantId');
    const status = req.nextUrl.searchParams.get('status');

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'restaurantId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const query: Record<string, unknown> = { restaurantId };
    if (status) query.status = status;

    const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('GET /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/* ── POST /api/orders ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, restaurantName, tableNumber, customerName, items, staffId, staffName } = body;

    if (!restaurantId || !tableNumber || !items?.length || !staffId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    /* ── Check if table already has an open order ── */
    const existingOpen = await OrderModel.findOne({
      restaurantId,
      tableNumber,
      status: 'open',
    }).lean();

    if (existingOpen) {
      return NextResponse.json(
        { success: false, error: `Table ${tableNumber} already has an open order. Close it first.` },
        { status: 409 }
      );
    }

    const subtotal = items.reduce((sum: number, item: { price: number; qty: number }) => sum + item.price * item.qty, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const order = await OrderModel.create({
      restaurantId,
      restaurantName,
      tableNumber,
      customerName: customerName || '',
      items,
      subtotal,
      tax,
      total,
      status: 'open',
      staffId,
      staffName,
    });

    return NextResponse.json(
      { success: true, orderId: order._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
