import mongoose, { Schema } from 'mongoose';

export interface IStaff {
  staffId: string;
  name: string;
}

export interface IRestaurant {
  name: string;
  location: string;
  phone: string;
  staff: IStaff[];
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name:     { type: String, required: true },
    location: { type: String, default: '' },
    phone:    { type: String, default: '' },
    staff:    [{
      staffId: { type: String, required: true },
      name:    { type: String, required: true },
    }],
  },
  { timestamps: true }
);

export const RestaurantModel =
  (mongoose.models.Restaurant as mongoose.Model<IRestaurant>) ||
  mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
