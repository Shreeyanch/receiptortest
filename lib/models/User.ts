import mongoose, { Schema } from 'mongoose';

export interface IUser {
  name: string;
  phone: string;
  password: string;
  sessionToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true },
    phone:        { type: String, required: true, unique: true, index: true },
    password:     { type: String, required: true },
    sessionToken: { type: String },
  },
  { timestamps: true }
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema);
