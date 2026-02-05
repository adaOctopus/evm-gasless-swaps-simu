import mongoose, { Document, Schema } from 'mongoose';

export interface ISwap extends Document {
  userId: mongoose.Types.ObjectId;
  walletAddress: string;
  chainId: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  txHash?: string;
  userOpHash?: string;
  createdAt: Date;
}

const SwapSchema = new Schema<ISwap>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    walletAddress: { type: String, required: true },
    chainId: { type: Number, required: true },
    tokenIn: { type: String, required: true },
    tokenOut: { type: String, required: true },
    amountIn: { type: String, required: true },
    amountOut: { type: String, required: true },
    txHash: { type: String },
    userOpHash: { type: String },
  },
  { timestamps: true }
);

SwapSchema.index({ userId: 1, createdAt: -1 });

export const Swap = mongoose.model<ISwap>('Swap', SwapSchema);
