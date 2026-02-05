import { config } from '../config/env';
import { UserTier } from '../config/env';

// Alchemy Gas Manager endpoint; see Alchemy docs for your dashboard URL and method (e.g. alchemy_requestGasAndPaymasterAndData).
const GAS_MANAGER_PATH = '/v2/';
const getGasManagerUrl = () =>
  config.alchemy.apiKey
    ? `https://dashboard.alchemy.com/api/gas-manager${GAS_MANAGER_PATH}${config.alchemy.apiKey}`
    : '';

function getPolicyIdForTier(tier: UserTier): string {
  switch (tier) {
    case 'PRO':
      return config.gasManager.policyIdPro || config.gasManager.policyIdFree;
    case 'MASTER':
      return config.gasManager.policyIdMaster || config.gasManager.policyIdPro || config.gasManager.policyIdFree;
    default:
      return config.gasManager.policyIdFree;
  }
}

export interface PaymasterDataParams {
  userOp: Record<string, unknown>;
  tier: UserTier;
  chainId?: number;
}

export async function getPaymasterAndData(params: PaymasterDataParams): Promise<{
  paymasterAndData: string;
  paymaster?: string;
}> {
  const policyId = getPolicyIdForTier(params.tier);
  if (!policyId || !config.alchemy.apiKey) {
    return { paymasterAndData: '0x' };
  }
  const url = getGasManagerUrl();
  if (!url) return { paymasterAndData: '0x' };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'alchemy_requestGasAndPaymasterAndData',
      params: [
        {
          policyId,
          entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
          userOperation: params.userOp,
        },
      ],
    }),
  });
  const data = (await res.json()) as {
    result?: { paymasterAndData?: string; paymaster?: string };
    error?: { message: string };
  };
  if (data.error) throw new Error(data.error.message || 'Gas Manager error');
  const paymasterAndData = data.result?.paymasterAndData ?? '0x';
  return { paymasterAndData, paymaster: data.result?.paymaster };
}
