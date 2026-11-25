import mongoose, { Schema, Document } from 'mongoose';

export interface IDraw extends Document {
  drawNumber: number;
  drawDate: Date;
  grandPrize: string;
  additionalPrizes: string[];
  status: 'Upcoming' | 'Completed';
  notes?: string;
  createdAt: Date;
}

const DrawSchema = new Schema<IDraw>(
  {
    drawNumber: { type: Number, required: true, unique: true },
    drawDate: { type: Date, required: true },
    grandPrize: { type: String, required: true, trim: true },
    additionalPrizes: [{ type: String, trim: true }],
    status: { type: String, enum: ['Upcoming', 'Completed'], default: 'Upcoming', index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Draw || mongoose.model<IDraw>('Draw', DrawSchema);

