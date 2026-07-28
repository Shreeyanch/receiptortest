import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/mongodb';
import { OrderModel } from '@/lib/models/Order';
import { ReceiptModel } from '@/lib/models/Receipt';
import { RestaurantModel } from '@/lib/models/Restaurant';

const TAX_RATE = 0.13;

/* ── PATCH /api/orders/[id] ── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    await connectDB();

    /* ── Update status ── */
    if (body.status) {
      const order = await OrderModel.findById(id).lean();
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      let receiptId = order.receiptId;

      /* ── When marking as paid, create a receipt ── */
      if (body.status === 'paid' && !receiptId) {
        receiptId = nanoid(6);

        const restaurant = await RestaurantModel.findOne({ name: order.restaurantName }).lean();

        await ReceiptModel.create({
          receiptId,
          deviceId: 'staff-pos',
          shopName: order.restaurantName,
          shopAddress: restaurant?.location ?? '',
          shopPhone: restaurant?.phone ?? '',
          tableNumber: order.tableNumber,
          customerName: order.customerName ?? '',
          cashier: order.staffName,
          items: order.items.map(it => ({ name: it.name, qty: it.qty, price: it.price * it.qty })),
          subtotal: order.subtotal,
          discount: 0,
          tax: order.tax,
          total: order.total,
          paymentMethod: 'Cash',
        });
      }

      const updated = await OrderModel.findByIdAndUpdate(
        id,
        { $set: { status: body.status, ...(receiptId ? { receiptId } : {}) } },
        { new: true }
      ).lean();

      return NextResponse.json({ success: true, order: updated });
    }

    /* ── Edit order (table, customer, items) ── */
    if (body.tableNumber !== undefined || body.customerName !== undefined || body.items) {
      const update: Record<string, unknown> = {};
      if (body.tableNumber !== undefined) update.tableNumber = body.tableNumber;
      if (body.customerName !== undefined) update.customerName = body.customerName;
      if (body.items) {
        update.items = body.items;
        const subtotal = body.items.reduce((sum: number, item: { price: number; qty: number }) => sum + item.price * item.qty, 0);
        const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
        update.subtotal = subtotal;
        update.tax = tax;
        update.total = Math.round((subtotal + tax) * 100) / 100;
      }

      const updated = await OrderModel.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
      ).lean();

      return NextResponse.json({ success: true, order: updated });
    }

    /* ── Add item to order ── */
    if (body.item) {
      const order = await OrderModel.findById(id).lean();
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      const items = [...order.items, body.item];
      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      const updated = await OrderModel.findByIdAndUpdate(
        id,
        { $set: { items, subtotal, tax, total } },
        { new: true }
      ).lean();

      return NextResponse.json({ success: true, order: updated });
    }

    /* ── Remove item from order ── */
    if (body.removeItemIndex !== undefined) {
      const order = await OrderModel.findById(id).lean();
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      const items = order.items.filter((_, i) => i !== body.removeItemIndex);
      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      const updated = await OrderModel.findByIdAndUpdate(
        id,
        { $set: { items, subtotal, tax, total } },
        { new: true }
      ).lean();

      return NextResponse.json({ success: true, order: updated });
    }

    return NextResponse.json(
      { success: false, error: 'No valid update provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PATCH /api/orders/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

/* ── DELETE /api/orders/[id] ── */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();
    await OrderModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/orders/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
