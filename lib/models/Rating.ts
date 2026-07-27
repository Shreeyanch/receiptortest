import mongoose, { Schema } from 'mongoose';

export interface IRating {
  receiptId: string;
  shopName: string;
  stars: number;
  comment?: string;
  contact?: string;
  createdAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    receiptId: { type: String, required: true, index: true },
    shopName:  { type: String, required: true },
    stars:     { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, default: '' },
    contact:   { type: String, default: '' },
  },
  { timestamps: true }
);

export const RatingModel =
  (mongoose.models.Rating as mongoose.Model<IRating>) ||
  mongoose.model<IRating>('Rating', RatingSchema);
