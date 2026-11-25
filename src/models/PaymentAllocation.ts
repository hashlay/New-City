import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentAllocation extends Document {
  paymentId: mongoose.Types.ObjectId;
  schemeCardId: mongoose.Types.ObjectId;
  installmentId: mongoose.Types.ObjectId;
  installmentNumber: number;
  amount: number;
  allocatedDate: Date;
}

const PaymentAllocationSchema = new Schema<IPaymentAllocation>(
  {
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true, index: true },
    schemeCardId: { type: Schema.Types.ObjectId, ref: 'SchemeCard', required: true, index: true },
    installmentId: { type: Schema.Types.ObjectId, ref: 'Installment', required: true },
    installmentNumber: { type: Number, required: true },
    amount: { type: Number, required: true, min: 1 },
    allocatedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.PaymentAllocation ||
  mongoose.model<IPaymentAllocation>('PaymentAllocation', PaymentAllocationSchema);

