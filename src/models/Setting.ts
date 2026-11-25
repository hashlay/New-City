import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  shopName: string;
  shopLogoUrl?: string;
  phone?: string;
  address?: string;
  currency: string;
  defaultSchemeName: string;
  defaultMonthlyInstallment: number;
  defaultTotalInstallments: number;
  defaultDurationMonths: number;
}

const SettingSchema = new Schema<ISetting>(
  {
    shopName: { type: String, required: true, default: 'New City Scheme' },
    shopLogoUrl: { type: String },
    phone: { type: String, default: '+91 98450 12345' },
    address: { type: String, default: 'New City Commercial Complex, Main Road' },
    currency: { type: String, default: '₹' },
    defaultSchemeName: { type: String, default: 'New City Scheme' },
    defaultMonthlyInstallment: { type: Number, default: 500 },
    defaultTotalInstallments: { type: Number, default: 20 },
    defaultDurationMonths: { type: Number, default: 20 },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);
