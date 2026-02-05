import { config } from '../config/env';

const BUNDLER_PATH = '/v2/';
const getBundlerUrl = () =>
  config.alchemy.bundlerUrl || `https://eth-sepolia.g.alchemy.com${BUNDLER_PATH}${config.alchemy.apiKey}`;

export interface SendUserOpParams {
  userOp: Record<string, unknown>;
  chainId?: number;
}

export async function sendUserOperation(params: SendUserOpParams): Promise<{ userOpHash: string }> {
  const url = getBundlerUrl();
  if (!config.alchemy.apiKey) {
    throw new Error('ALCHEMY_API_KEY not set');
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_sendUserOperation',
      params: [params.userOp, getEntryPointForChain(params.chainId ?? 11155111)],
    }),
  });
  const data = (await res.json()) as { result?: string; error?: { message: string } };
  if (data.error) throw new Error(data.error.message || 'Bundler error');
  if (!data.result) throw new Error('No userOpHash returned');
  return { userOpHash: data.result };
}

function getEntryPointForChain(chainId: number): string {
  const ENTRY_POINT_V06 = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
  return ENTRY_POINT_V06;
}
