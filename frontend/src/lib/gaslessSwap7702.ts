/**
 * EIP-7702 gasless swap: user signs authorization (EOA → delegator contract),
 * frontend sends signed auth + delegator calldata to backend; relayer submits Type 4 tx.
 */
import type { WalletClient } from 'viem';
import { DELEGATOR_CONTRACT_ADDRESS } from './constants';
import {
  encodeDelegatorExecuteSwap,
  getDefaultTokenAddresses,
} from './dex';
import { rpcApi, swapsApi } from './api';

export interface GaslessSwap7702Params {
  chainId: number;
  amountInWei: bigint;
  amountOutMinWei: bigint;
  userAddress: `0x${string}`;
}

export interface GaslessSwap7702Result {
  txHash: string;
  success: boolean;
  error?: string;
}

/** Signed EIP-7702 authorization (from walletClient.signAuthorization). */
export interface SignedAuthorizationPayload {
  address: `0x${string}`;
  chainId: number;
  nonce: number;
  yParity: number;
  r: `0x${string}`;
  s: `0x${string}`;
}

/**
 * Run EIP-7702 gasless swap: prepare + sign authorization, encode delegator calldata,
 * send to backend; relayer submits Type 4 tx (to = user EOA, data = delegator calldata, authorizationList).
 */
export async function runGaslessSwap7702(
  walletClient: WalletClient,
  params: GaslessSwap7702Params
): Promise<GaslessSwap7702Result> {
  const { chainId, amountInWei, amountOutMinWei, userAddress } = params;
  const envDelegator = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DELEGATOR_CONTRACT_ADDRESS;
  const delegatorAddress = (envDelegator as `0x${string}` | undefined) ?? DELEGATOR_CONTRACT_ADDRESS[chainId];
  if (!delegatorAddress || delegatorAddress === '0x0000000000000000000000000000000000000000') {
    return {
      txHash: '',
      success: false,
      error: 'EIP-7702 delegator contract not configured for this chain.',
    };
  }

  const account = walletClient.account;
  if (!account) {
    return { txHash: '', success: false, error: 'No wallet account.' };
  }

  const { tokenIn, tokenOut } = getDefaultTokenAddresses(chainId);
  const path = [tokenIn, tokenOut] as [`0x${string}`, `0x${string}`];
  const delegatorCalldata = encodeDelegatorExecuteSwap({
    amountIn: amountInWei,
    amountOutMin: amountOutMinWei,
    path,
    to: userAddress,
  });

  // 1. Prepare and sign EIP-7702 authorization (EOA delegates to delegator contract)
  let signedAuth: SignedAuthorizationPayload;
  try {
    const signed = await walletClient.signAuthorization({
      account,
      contractAddress: delegatorAddress,
      chainId,
    });
    signedAuth = {
      address: signed.address,
      chainId: signed.chainId,
      nonce: signed.nonce,
      yParity: signed.yParity ?? 0,
      r: signed.r,
      s: signed.s,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to sign EIP-7702 authorization';
    return { txHash: '', success: false, error: msg };
  }

  // 2. Send to backend: relayer submits Type 4 tx
  let txHash: string;
  try {
    const result = await rpcApi.submit7702({
      signedAuthorization: signedAuth,
      userAddress,
      chainId,
      data: delegatorCalldata,
    });
    txHash = result.txHash;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Backend failed to submit EIP-7702 transaction';
    return { txHash: '', success: false, error: msg };
  }

  // 3. Record swap
  try {
    await swapsApi.create({
      walletAddress: userAddress,
      chainId,
      tokenIn,
      tokenOut,
      amountIn: amountInWei.toString(),
      amountOut: amountOutMinWei.toString(),
      txHash,
    });
  } catch {
    // non-fatal
  }

  return { txHash, success: true };
}
