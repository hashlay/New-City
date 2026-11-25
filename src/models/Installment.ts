import mongoose, { Schema, Document } from 'mongoose';

export interface IInstallment extends Document {
  schemeCardId: mongoose.Types.ObjectId;
  installmentNumber: number;
  dueDate: Date;
  dueAmount: number;
  paidAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Advance' | 'Partially Paid';
  paidDate?: Date;
}

const InstallmentSchema = new Schema<IInstallment>(
  {
    schemeCardId: { type: Schema.Types.ObjectId, ref: 'SchemeCard', required: true, index: true },
    installmentNumber: { type: Number, required: true },
    dueDate: { type: Date, required: true, index: true },
    dueAmount: { type: Number, required: true, default: 500 },
    paidAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue', 'Advance', 'Partially Paid'],
      default: 'Pending',
      index: true,
    },
    paidDate: { type: Date },
  },
  { timestamps: true }
);

InstallmentSchema.index({ schemeCardId: 1, installmentNumber: 1 }, { unique: true });

export default mongoose.models.Installment || mongoose.model<IInstallment>('Installment', InstallmentSchema);

