import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  customerId: mongoose.Types.ObjectId;
  schemeCardId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'Cash' | 'UPI' | 'Other';
  notes?: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    schemeCardId: { type: Schema.Types.ObjectId, ref: 'SchemeCard', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    paymentDate: { type: Date, required: true, default: Date.now },
    paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Other'], default: 'Cash', index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

