/**
 * Alchemy smart account client using WalletClientSigner (MetaMask).
 * Uses createModularAccountAlchemyClient for Sepolia; paymaster/send go through our backend.
 */
import { createModularAccountAlchemyClient } from '@alchemy/aa-alchemy';
import { WalletClientSigner } from '@alchemy/aa-core';
import type { WalletClient } from 'viem';
import { sepolia } from 'viem/chains';

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? '';

export type SmartAccountClient = Awaited<ReturnType<typeof createModularAccountAlchemyClient>>;

export function createSignerFromWalletClient(walletClient: WalletClient) {
  if (!walletClient.chain) throw new Error('Wallet client must have chain');
  // Cast: wagmi/viem WalletClient is compatible at runtime; aa-core may type from its own viem
  return new WalletClientSigner(walletClient as never, String(walletClient.chain.id));
}

export async function createSmartAccountClient(
  walletClient: WalletClient
): Promise<SmartAccountClient | null> {
  if (!ALCHEMY_API_KEY) return null;
  const chain = walletClient.chain ?? sepolia;
  const signer = createSignerFromWalletClient({ ...walletClient, chain });
  // Cast chain/signer: wagmi viems Chain may differ from aa-core's bundled viem at type level
  const client = await createModularAccountAlchemyClient({
    chain: chain as never,
    apiKey: ALCHEMY_API_KEY,
    signer: signer as never,
  });
  return client;
}
