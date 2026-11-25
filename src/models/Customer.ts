import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    address: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

CustomerSchema.index({ name: 'text', phone: 'text' });

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

