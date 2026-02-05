const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token: optToken, ...rest } = options;
  const token = optToken ?? getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...rest, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
  return data as T;
}

export const authApi = {
  socialLogin: (body: { email: string; authProvider?: string }) =>
    api<{ token: string; user: { id: string; email: string; tier: string } }>('/api/auth/social', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  walletSignIn: (body: { address: string; signature: `0x${string}`; message: string }) =>
    api<{ token: string; user: { id: string; email: string; tier: string } }>('/api/auth/wallet-signin', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  linkWallet: (body: { address: string; type: 'eoa' | 'smart_account'; chainId: number }) =>
    api<{ wallet: unknown }>('/api/auth/link-wallet', { method: 'POST', body: JSON.stringify(body) }),
};

export const usersApi = {
  getMe: () =>
    api<{ user: { id: string; email: string; tier: string }; wallets: Array<{ address: string; type: string; chainId: number }> }>(
      '/api/users/me'
    ),
  updateTier: (tier: 'FREE' | 'PRO' | 'MASTER') =>
    api<{ user: { id: string; email: string; tier: string } }>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ tier }),
    }),
};

export const rpcApi = {
  paymasterData: (body: { userOp: Record<string, unknown>; chainId?: number }) =>
    api<{ paymasterAndData: string; paymaster?: string }>('/api/rpc/paymaster-data', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  sendUserOp: (body: { userOp: Record<string, unknown>; chainId?: number }) =>
    api<{ userOpHash: string }>('/api/rpc/send-userop', { method: 'POST', body: JSON.stringify(body) }),
};

export const swapsApi = {
  create: (body: {
    walletAddress: string;
    chainId: number;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    amountOut: string;
    txHash?: string;
    userOpHash?: string;
  }) => api<{ swap: { id: string; userOpHash?: string } }>('/api/swaps', { method: 'POST', body: JSON.stringify(body) }),
  list: (params?: { limit?: number }) => {
    const q = params?.limit != null ? `?limit=${params.limit}` : '';
    return api<{ swaps: unknown[] }>(`/api/swaps${q}`);
  },
};
