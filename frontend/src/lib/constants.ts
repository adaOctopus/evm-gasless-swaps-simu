/**
 * Chain and DEX constants for gasless swap.
 * EntryPoint v0.6 is used by Alchemy bundler.
 */

export const ENTRY_POINT_V06 = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as const;

/** Uniswap V2 Router – mainnet; on Sepolia use a test router if available */
export const UNISWAP_V2_ROUTER = {
  1: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' as const,
  11155111: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' as const, // Sepolia: same for interface; may need real Sepolia address
};

/** USDC and WETH on mainnet; Sepolia test tokens if needed */
export const TOKENS = {
  1: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const,
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as const,
  },
  11155111: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as const, // Sepolia USDC
    WETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14' as const, // Sepolia WETH
  },
};

export const WALLET_SIGNIN_MESSAGE_PREFIX = 'Sign in to One-Click Gasless Swap\n\n';

/** EIP-7702: delegator contract address per chain (contract that runs approve + swap when EOA delegates to it) */
export const DELEGATOR_CONTRACT_ADDRESS: Record<number, `0x${string}`> = {
  1: '0x0000000000000000000000000000000000000000' as `0x${string}`, // placeholder mainnet
  11155111: '0x0000000000000000000000000000000000000000' as `0x${string}`, // placeholder Sepolia
};
