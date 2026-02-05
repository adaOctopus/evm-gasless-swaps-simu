import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config/env';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import rpcRoutes from './routes/rpc';
import swapRoutes from './routes/swaps';

const app = express();
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rpc', rpcRoutes);
app.use('/api/swaps', swapRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    app.listen(config.port, () => {
      console.log(`API listening on ${config.port}`);
    });
  } catch (e) {
    console.error('Failed to start:', e);
    process.exit(1);
  }
}

start();
