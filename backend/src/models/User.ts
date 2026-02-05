import mongoose, { Document, Schema } from 'mongoose';
import { UserTier } from '../config/env';

export interface IUser extends Document {
  email: string;
  authProvider: string;
  tier: UserTier;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, index: true },
    authProvider: { type: String, required: true },
    tier: { type: String, enum: ['FREE', 'PRO', 'MASTER'], default: 'FREE' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
