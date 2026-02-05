'use client';

import { useAccount, useSignMessage, useWalletClient } from 'wagmi';
import { useState } from 'react';
import { useMounted } from '@/hooks/useMounted';
import { openSwapStatusModal } from '@/components/SwapStatusModal';
import { authApi } from '@/lib/api';
import { WALLET_SIGNIN_MESSAGE_PREFIX } from '@/lib/constants';
import { createSmartAccountClient } from '@/lib/smartAccount';
import { runGaslessSwap } from '@/lib/gaslessSwap';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/** Linea-style swap: light lavender cards, Montserrat, circular icons, pill tags, clean CTA. Gasless flow via aa-sdk + backend. */
export function SwapForm() {
  const { isConnected, address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();
  const mounted = useMounted();
  const [fromAmount, setFromAmount] = useState('1');
  const [toAmount] = useState('6.1039');
  const [slippage] = useState('14.25');
  const [activeTab, setActiveTab] = useState<'Swap' | 'Limit' | 'TWAP'>('Swap');
  const [swapping, setSwapping] = useState(false);

  const showConnectCta = !mounted || !isConnected || !address;

  const onCtaClick = async () => {
    if (showConnectCta && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-connect-modal'));
      return;
    }
    if (!address || !chainId || !walletClient) {
      openSwapStatusModal({ phase: 'complete', error: 'Connect wallet and try again.' });
      return;
    }

    // Wallet sign-in (JWT) for backend RPC
    if (!getToken()) {
      try {
        const message = `${WALLET_SIGNIN_MESSAGE_PREFIX}Timestamp: ${Date.now()}`;
        const signature = await signMessageAsync({ message });
        const { token } = await authApi.walletSignIn({
          address,
          signature: signature as `0x${string}`,
          message,
        });
        localStorage.setItem('token', token);
      } catch (e) {
        openSwapStatusModal({
          phase: 'complete',
          error: e instanceof Error ? e.message : 'Sign-in failed. Sign the message in your wallet.',
        });
        return;
      }
    }

    setSwapping(true);
    openSwapStatusModal({ phase: 'processing' });

    try {
      const client = await createSmartAccountClient(walletClient);
      if (!client) {
        openSwapStatusModal({ phase: 'complete', error: 'Missing NEXT_PUBLIC_ALCHEMY_API_KEY.' });
        setSwapping(false);
        return;
      }
      const smartAccountAddress = await client.getAddress();
      const amountInWei = BigInt(Math.floor(parseFloat(fromAmount) * 1e6)); // USDC 6 decimals
      const amountOutMinWei = BigInt(Math.floor(parseFloat(toAmount) * 0.95 * 1e18)); // ~5% slippage, 18 decimals

      const result = await runGaslessSwap(client, {
        chainId,
        amountInWei,
        amountOutMinWei,
        smartAccountAddress,
      });

      openSwapStatusModal({
        phase: 'complete',
        userOpHash: result.userOpHash,
        error: result.error,
      });
    } catch (e) {
      openSwapStatusModal({
        phase: 'complete',
        error: e instanceof Error ? e.message : 'Swap failed.',
      });
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-3xl border border-gray-200/80 bg-white shadow-sm font-display">
      <div className="border-b border-gray-100 px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {(['Swap', 'Limit', 'TWAP'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                  activeTab === tab ? 'bg-accent text-white' : 'text-text-muted-app hover:bg-app-card hover:text-text-app'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <button type="button" className="rounded-xl p-2 text-text-muted-app hover:bg-app-card hover:text-text-app" aria-label="Refresh">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button type="button" className="rounded-xl p-2 text-text-muted-app hover:bg-app-card hover:text-text-app" aria-label="Settings">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* From */}
        <div className="rounded-2xl bg-app-card p-4">
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-2xl font-bold text-text-app outline-none placeholder:text-text-muted-app"
            />
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white">
                <span className="text-xs font-bold">$</span>
              </div>
              <span className="text-sm font-bold text-text-app">USDC</span>
              <svg className="h-4 w-4 text-text-muted-app" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-text-muted-app">≈ $1</p>
        </div>

        {/* Swap direction */}
        <div className="flex justify-center py-2">
          <button
            type="button"
            className="rounded-full border border-gray-200 bg-white p-2.5 text-accent shadow-sm hover:bg-app-card"
            aria-label="Reverse swap direction"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>

        {/* To */}
        <div className="rounded-2xl bg-app-card p-4">
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="min-w-0 flex-1 bg-transparent text-2xl font-bold text-text-app outline-none placeholder:text-text-muted-app"
            />
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/90 text-white">
                <span className="text-xs font-bold">X</span>
              </div>
              <span className="text-sm font-bold text-text-app">ONEX</span>
              <svg className="h-4 w-4 text-text-muted-app" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-text-muted-app">
            ≈ $1 <span className="font-semibold text-success">(0.41%)</span>
          </p>
        </div>

        {/* Info + pill tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-lavender px-3 py-1 text-xs font-bold text-accent">Gasless</span>
          <span className="rounded-full bg-lavender px-3 py-1 text-xs font-bold text-accent">No Fees</span>
        </div>
        <div className="mt-4 space-y-3 rounded-2xl bg-app-card/60 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-medium text-text-muted-app">
              Receive (incl. fees)
              <button type="button" className="rounded p-0.5 text-text-muted-app hover:text-text-app" aria-label="Info">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </span>
            <span className="font-bold text-text-app">4.4572</span>
          </div>
          <div className="flex items-center justify-between text-sm font-medium text-text-muted-app">
            <span>1 ONEX = 0.16383 USDC</span>
            <span>(≈ $0.16)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-medium text-text-muted-app">
              Slippage (dynamic)
              <button type="button" className="rounded p-0.5 text-text-muted-app hover:text-text-app" aria-label="Info">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </span>
            <span className="font-bold text-text-app">{slippage}%</span>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onCtaClick}
          disabled={swapping}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-base font-bold text-white shadow-md hover:bg-accent-hover disabled:opacity-60"
        >
          {showConnectCta ? 'Connect Wallet' : swapping ? 'Submitting…' : 'Swap'}
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
