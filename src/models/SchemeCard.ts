import mongoose, { Schema, Document } from 'mongoose';

export interface ISchemeCard extends Document {
  customerId: mongoose.Types.ObjectId;
  schemeName: string;
  cardNumber: string;
  monthlyInstallment: number;
  totalInstallments: number;
  totalAmount: number;
  startDate: Date;
  status: 'Active' | 'Completed' | 'Inactive';
  createdAt: Date;
}

const SchemeCardSchema = new Schema<ISchemeCard>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    schemeName: { type: String, required: true, default: '20-Month Scheme' },
    cardNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    monthlyInstallment: { type: Number, required: true, default: 500 },
    totalInstallments: { type: Number, required: true, default: 20 },
    totalAmount: { type: Number, required: true, default: 10000 },
    startDate: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['Active', 'Completed', 'Inactive'], default: 'Active', index: true },
  },
  { timestamps: true }
);

export default mongoose.models.SchemeCard || mongoose.model<ISchemeCard>('SchemeCard', SchemeCardSchema);

