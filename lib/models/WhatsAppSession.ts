import mongoose, { Schema } from 'mongoose';

export interface IWhatsAppSession {
  sessionToken: string;
  phoneNumber?: string;
  linkedReceiptIds: string[];
  isVerified: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppSessionSchema = new Schema<IWhatsAppSession>(
  {
    sessionToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      index: true,
    },
    linkedReceiptIds: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

export const WhatsAppSessionModel =
  (mongoose.models.WhatsAppSession as mongoose.Model<IWhatsAppSession>) ||
  mongoose.model<IWhatsAppSession>('WhatsAppSession', WhatsAppSessionSchema);
