/**
 * Uniswap V2 Router encoding for swapExactTokensForTokens.
 * Used to build the execute() calldata from the smart account to the DEX router.
 */
import { encodeFunctionData, type Address } from 'viem';
import { UNISWAP_V2_ROUTER, TOKENS } from './constants';

const UNISWAP_V2_ROUTER_ABI = [
  {
    name: 'swapExactTokensForTokens',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256', internalType: 'uint256' },
      { name: 'amountOutMin', type: 'uint256', internalType: 'uint256' },
      { name: 'path', type: 'address[]', internalType: 'address[]' },
      { name: 'to', type: 'address', internalType: 'address' },
      { name: 'deadline', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' }],
  },
] as const;

export interface SwapParams {
  chainId: number;
  amountIn: bigint;
  amountOutMin: bigint;
  tokenIn: Address;
  tokenOut: Address;
  to: Address;
  deadline?: bigint;
}

export function getRouterAddress(chainId: number): Address {
  const addr = UNISWAP_V2_ROUTER[chainId as keyof typeof UNISWAP_V2_ROUTER];
  return addr ?? UNISWAP_V2_ROUTER[1];
}

export function encodeSwapExactTokensForTokens(params: SwapParams): `0x${string}` {
  const deadline = params.deadline ?? BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 min
  return encodeFunctionData({
    abi: UNISWAP_V2_ROUTER_ABI,
    functionName: 'swapExactTokensForTokens',
    args: [params.amountIn, params.amountOutMin, [params.tokenIn, params.tokenOut], params.to, deadline],
  });
}

export function getDefaultTokenAddresses(chainId: number): { tokenIn: Address; tokenOut: Address } {
  const tokens = TOKENS[chainId as keyof typeof TOKENS] ?? TOKENS[11155111];
  return { tokenIn: tokens.USDC, tokenOut: tokens.WETH };
}
