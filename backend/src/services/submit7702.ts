/**
 * EIP-7702: submit Type 4 transaction via relayer.
 * Relayer pays gas; tx to = user EOA, data = delegator calldata, authorizationList = user's signed auth.
 */
import { createWalletClient, http, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { config } from '../config/env';

export interface SignedAuthorizationPayload {
  address: `0x${string}`;
  chainId: number;
  nonce: number;
  yParity: number;
  r: `0x${string}`;
  s: `0x${string}`;
}

export interface Submit7702Params {
  signedAuthorization: SignedAuthorizationPayload;
  userAddress: `0x${string}`;
  chainId: number;
  data: `0x${string}`;
}

function getChain(chainId: number) {
  if (chainId === 11155111) return sepolia;
  throw new Error(`Chain ${chainId} not supported for EIP-7702`);
}

function getRpcUrl(chainId: number): string {
  if (chainId === 11155111) {
    return config.alchemy.apiKey
      ? `https://eth-sepolia.g.alchemy.com/v2/${config.alchemy.apiKey}`
      : 'https://rpc.sepolia.org';
  }
  throw new Error(`Chain ${chainId} not supported`);
}

export async function submit7702Transaction(params: Submit7702Params): Promise<{ txHash: string }> {
  if (!config.relayerPrivateKey) {
    throw new Error('RELAYER_PRIVATE_KEY not set');
  }
  const chain = getChain(params.chainId);
  const transport = http(getRpcUrl(params.chainId));
  const account = privateKeyToAccount(config.relayerPrivateKey as `0x${string}`);

  const walletClient = createWalletClient({
    account,
    chain,
    transport,
  }) as WalletClient;

  const hash = await walletClient.sendTransaction({
    account,
    to: params.userAddress,
    data: params.data,
    type: 'eip7702',
    authorizationList: [params.signedAuthorization],
    chain: chain,
  });

  if (!hash) throw new Error('No transaction hash returned');
  return { txHash: hash };
}
