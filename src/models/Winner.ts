import mongoose, { Schema, Document } from 'mongoose';

export interface IWinner extends Document {
  drawId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  schemeCardId: mongoose.Types.ObjectId;
  prize: string;
  winnerInformation?: string;
  wonDate: Date;
}

const WinnerSchema = new Schema<IWinner>(
  {
    drawId: { type: Schema.Types.ObjectId, ref: 'Draw', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    schemeCardId: { type: Schema.Types.ObjectId, ref: 'SchemeCard', required: true },
    prize: { type: String, required: true, trim: true },
    winnerInformation: { type: String, trim: true },
    wonDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Winner || mongoose.model<IWinner>('Winner', WinnerSchema);

