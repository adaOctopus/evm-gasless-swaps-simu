'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const OPEN_SWAP_MODAL_EVENT = 'open-swap-modal';

export type SwapModalPhase = 'confirm' | 'processing' | 'complete';

export interface SwapModalPayload {
  phase?: SwapModalPhase;
  userOpHash?: string;
  /** EIP-7702: transaction hash when using Type 4 flow */
  txHash?: string;
  error?: string;
}

/**
 * Modal shown when user clicks Swap: dummy flow (confirm → ONE CLICK → complete)
 * or real flow (processing → complete with userOpHash/error).
 */
export function SwapStatusModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<SwapModalPhase>('confirm');
  const [userOpHash, setUserOpHash] = useState<string | undefined>();
  const [txHash, setTxHash] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const handler = (e: Event) => {
      const payload = (e as CustomEvent<SwapModalPayload>).detail ?? {};
      setPhase(payload.phase ?? 'confirm');
      setUserOpHash(payload.userOpHash);
      setTxHash(payload.txHash);
      setError(payload.error);
      setIsOpen(true);
    };
    window.addEventListener(OPEN_SWAP_MODAL_EVENT, handler);
    return () => window.removeEventListener(OPEN_SWAP_MODAL_EVENT, handler);
  }, []);

  const close = () => {
    setIsOpen(false);
    setUserOpHash(undefined);
    setTxHash(undefined);
    setError(undefined);
  };

  const hashDisplay = userOpHash ?? txHash;
  const hashLabel = userOpHash ? 'UserOp hash' : txHash ? 'Tx hash' : '—';

  const handleOneClickSwap = () => setPhase('complete');

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex min-h-screen min-w-full items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={phase === 'confirm' ? 'One-click swap ready' : 'Swap complete'}
      onClick={close}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl font-display"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-app">
            {phase === 'confirm' && 'One-Click Swap Ready'}
            {phase === 'processing' && 'Submitting…'}
            {phase === 'complete' && (error ? 'Swap failed' : 'Swap Complete')}
          </h2>
          <button
            type="button"
            className="rounded-xl p-2 text-text-muted-app hover:bg-app-card hover:text-text-app"
            onClick={close}
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {phase === 'processing' ? (
          <>
            <p className="mb-4 text-sm text-text-muted-app">
              Building and signing your gasless swap. No gas fees — paymaster sponsored.
            </p>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-[#E8E4E0] px-4 py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-text-app">Sending UserOperation…</p>
            </div>
          </>
        ) : phase === 'confirm' ? (
          <>
            <p className="mb-4 text-sm text-text-muted-app">
              Your swap is ready. One click — no gas, no extra steps.
            </p>
            <div className="rounded-2xl bg-[#E8E4E0] px-4 py-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between font-medium text-text-app">
                  <span>From</span>
                  <span>1.00 USDC</span>
                </div>
                <div className="flex justify-between font-medium text-text-app">
                  <span>To</span>
                  <span>~6.10 ONEX</span>
                </div>
                <div className="border-t border-gray-300/80 pt-3">
                  <div className="flex justify-between text-text-muted-app">
                    <span>Router</span>
                    <span className="font-semibold text-text-app">1inch (Ethereum)</span>
                  </div>
                </div>
                <div className="flex justify-between text-text-muted-app">
                  <span>Gas fees</span>
                  <span className="font-semibold text-success">$0.00 — Sponsored</span>
                </div>
                <div className="flex justify-between text-text-muted-app">
                  <span>Network</span>
                  <span className="font-semibold text-text-app">Ethereum Mainnet</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOneClickSwap}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-base font-bold text-white shadow-md hover:bg-accent-hover"
            >
              ONE CLICK SWAP
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-text-muted-app">
              {error
                ? error
                : 'Your tokens are on the way. Gas was sponsored by the paymaster.'}
            </p>
            <div className="rounded-2xl bg-[#E8E4E0] px-4 py-4">
              <div className="space-y-3 text-sm">
                {error ? (
                  <p className="font-medium text-warning">{error}</p>
                ) : (
                  <>
                    <div className="flex justify-between font-medium text-text-app">
                      <span>Gas paid by you</span>
                      <span className="font-semibold text-success">$0.00</span>
                    </div>
                    <div className="border-t border-gray-300/80 pt-3">
                      <div className="flex justify-between text-text-muted-app">
                        <span>{hashLabel}</span>
                        <span className="truncate font-mono text-xs text-accent pl-2">
                          {hashDisplay ? `${hashDisplay.slice(0, 10)}…${hashDisplay.slice(-8)}` : '—'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-base font-bold text-white shadow-md hover:bg-accent-hover"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export function openSwapStatusModal(payload?: SwapModalPayload) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_SWAP_MODAL_EVENT, { detail: payload ?? {} }));
  }
}
