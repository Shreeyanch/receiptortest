import mongoose, { Schema } from 'mongoose';

export interface ISession {
  token: string;
  userId: string;
  userType: 'user' | 'staff';
  userData: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    token:    { type: String, required: true, unique: true, index: true },
    userId:   { type: String, required: true, index: true },
    userType: { type: String, enum: ['user', 'staff'], required: true },
    userData: { type: Schema.Types.Mixed, required: true },
    expiresAt:{ type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

export const SessionModel =
  (mongoose.models.Session as mongoose.Model<ISession>) ||
  mongoose.model<ISession>('Session', SessionSchema);
