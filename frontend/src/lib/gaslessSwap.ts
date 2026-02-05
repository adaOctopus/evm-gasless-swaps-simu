/**
 * Gasless swap flow: build UserOp with DEX calldata, get paymaster from backend,
 * sign with EOA, send to backend (Alchemy bundler), record swap.
 */
import { buildUserOperation, deepHexlify } from '@alchemy/aa-core';
import type { SmartAccountClient } from './smartAccount';
import {
  encodeSwapExactTokensForTokens,
  getDefaultTokenAddresses,
  getRouterAddress,
} from './dex';
import { rpcApi, swapsApi } from './api';

export interface GaslessSwapParams {
  chainId: number;
  /** Amount in smallest unit (e.g. 1e6 for 1 USDC) */
  amountInWei: bigint;
  /** Min amount out in smallest unit */
  amountOutMinWei: bigint;
  smartAccountAddress: string;
}

export interface GaslessSwapResult {
  userOpHash: string;
  success: boolean;
  error?: string;
}

/**
 * Run the full gasless swap: build UO → paymaster from backend → sign → send → record.
 */
export async function runGaslessSwap(
  client: SmartAccountClient,
  params: GaslessSwapParams
): Promise<GaslessSwapResult> {
  const { chainId, amountInWei, amountOutMinWei, smartAccountAddress } = params;
  const { tokenIn, tokenOut } = getDefaultTokenAddresses(chainId);
  const router = getRouterAddress(chainId);

  const swapCalldata = encodeSwapExactTokensForTokens({
    chainId,
    amountIn: amountInWei,
    amountOutMin: amountOutMinWei,
    tokenIn,
    tokenOut,
    to: smartAccountAddress as `0x${string}`,
  });

  const call = {
    target: router as `0x${string}`,
    data: swapCalldata,
    value: BigInt(0),
  };

  // 1. Build userOp with empty paymaster (backend will provide)
  const uoStruct = await buildUserOperation(client, {
    uo: call,
    overrides: {
      paymasterAndData: '0x' as `0x${string}`,
    },
  });

  // 2. Serialize and get paymaster from backend
  const userOpJson = deepHexlify(uoStruct) as Record<string, unknown>;
  const { paymasterAndData } = await rpcApi.paymasterData({
    userOp: userOpJson,
    chainId,
  });

  if (!paymasterAndData || paymasterAndData === '0x') {
    return {
      userOpHash: '',
      success: false,
      error: 'Paymaster not available (check Gas Manager policy)',
    };
  }

  // 3. Merge paymaster into struct and sign (client has signUserOperation
  // from decorator)
  const mergedUo = {
    ...uoStruct,
    paymasterAndData: paymasterAndData as `0x${string}`,
  };
  const signedRequest = await client.signUserOperation({
    uoStruct: mergedUo,
    account: client.account,
  });

  // 4. Send to backend (Alchemy bundler)
  const signedJson = deepHexlify(signedRequest) as Record<string, unknown>;
  const { userOpHash } = await rpcApi.sendUserOp({
    userOp: signedJson,
    chainId,
  });

  // 4337

  // 7702

  // 5. Record swap in backend
  try {
    await swapsApi.create({
      walletAddress: smartAccountAddress,
      chainId,
      tokenIn,
      tokenOut,
      amountIn: amountInWei.toString(),
      amountOut: amountOutMinWei.toString(),
      userOpHash,
    });
  } catch {
    // non-fatal
  }

  return { userOpHash, success: true };
}
