import mongoose, { Schema } from 'mongoose';

export interface IReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface IReceipt {
  receiptId: string;
  deviceId: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  tableNumber?: number;
  customerName?: string;
  cashier: string;
  items: IReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  rawEscPos?: string;
  viewedBy: string[];
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    receiptId:     { type: String, required: true, unique: true, index: true },
    deviceId:      { type: String, required: true },
    shopName:      { type: String, required: true },
    shopAddress:   { type: String, default: '' },
    shopPhone:     { type: String, default: '' },
    tableNumber:   { type: Number },
    customerName:  { type: String, default: '' },
    cashier:       { type: String, default: '' },
    items:         [{ name: String, qty: Number, price: Number }],
    subtotal:      { type: Number, default: 0 },
    discount:      { type: Number, default: 0 },
    tax:           { type: Number, default: 0 },
    total:         { type: Number, required: true },
    paymentMethod: { type: String, default: 'Cash' },
    rawEscPos:     { type: String },
    viewedBy:      [{ type: String }],
    viewCount:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ReceiptModel =
  (mongoose.models.Receipt as mongoose.Model<IReceipt>) ||
  mongoose.model<IReceipt>('Receipt', ReceiptSchema);
