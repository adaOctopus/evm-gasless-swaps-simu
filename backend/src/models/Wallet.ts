import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  address: string;
  type: 'eoa' | 'smart_account';
  chainId: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    address: { type: String, required: true, index: true },
    type: { type: String, enum: ['eoa', 'smart_account'], required: true },
    chainId: { type: Number, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
