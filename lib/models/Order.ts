import mongoose, { Schema } from 'mongoose';

export interface IOrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface IOrder {
  restaurantId: string;
  restaurantName: string;
  tableNumber: number;
  customerName?: string;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'open' | 'paid';
  staffId: string;
  staffName: string;
  receiptId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    restaurantId:   { type: String, required: true, index: true },
    restaurantName: { type: String, required: true },
    tableNumber:    { type: Number, required: true },
    customerName:   { type: String, default: '' },
    items:          [{ name: String, qty: Number, price: Number }],
    subtotal:       { type: Number, default: 0 },
    tax:            { type: Number, default: 0 },
    total:          { type: Number, default: 0 },
    status:         { type: String, enum: ['open', 'paid'], default: 'open', index: true },
    staffId:        { type: String, required: true },
    staffName:      { type: String, required: true },
    receiptId:      { type: String },
  },
  { timestamps: true }
);

export const OrderModel =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>('Order', OrderSchema);
