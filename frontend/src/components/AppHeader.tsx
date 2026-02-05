'use client';

import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMounted } from '@/hooks/useMounted';

const OPEN_CONNECT_EVENT = 'open-connect-modal';

/** Linea-style top bar: Explore, Build, Resources, About + Connect (rounded, accent) */
export function AppHeader() {
  const { connectors, connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const mounted = useMounted();
  const [showConnect, setShowConnect] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    const open = () => setShowConnect(true);
    window.addEventListener(OPEN_CONNECT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONNECT_EVENT, open);
  }, []);

  const showWalletConnected = mounted && isConnected && address;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200/80 bg-app/95 px-6 backdrop-blur font-display">
      <nav className="flex items-center gap-1">
        {['Explore', 'Build', 'Resources', 'About'].map((label) => (
          <button
            key={label}
            type="button"
            className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted-app hover:bg-app-card hover:text-text-app"
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowPremium(true)}
          className="hidden text-sm font-medium text-text-muted-app hover:text-text-app sm:block"
        >
          Go Premium
        </button>
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-text-app">
          <div className="h-4 w-4 rounded-full bg-accent/20" />
          Ethereum
          <svg className="h-4 w-4 text-text-muted-app" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {showWalletConnected ? (
          <>
            <span className="max-w-[120px] truncate rounded-full bg-app-card px-3 py-2 text-xs font-semibold text-text-app sm:max-w-[160px]">
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
            <button
              type="button"
              onClick={() => disconnect()}
              className="text-sm font-medium text-text-muted-app hover:text-text-app"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowConnect(true)}
            className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-hover"
          >
            Connect
          </button>
        )}
      </div>

      {showConnect &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex min-h-screen min-w-full items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Connect wallet"
            onClick={() => setShowConnect(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
            <h2 className="font-display text-lg font-bold text-text-app">Connect wallet</h2>
            <ul className="mt-4 space-y-2">
              {connectors.map((c) => (
                <li key={c.uid}>
                  <button
                    type="button"
                    onClick={() => {
                      connect({ connector: c });
                      setShowConnect(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-app-card py-3 px-4 text-left font-semibold text-text-app hover:bg-app-card-hover"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-4 w-full rounded-2xl border border-gray-200 py-2.5 text-sm font-medium text-text-muted-app hover:text-text-app"
              onClick={() => setShowConnect(false)}
            >
              Cancel
            </button>
          </div>
        </div>,
          document.body
        )}

      {showPremium &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex min-h-screen min-w-full items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Premium"
            onClick={() => setShowPremium(false)}
          >
            <div
              className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl font-display"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-text-app">Choose your plan</h2>
                  <p className="mt-1 text-sm text-text-muted-app">Gasless swaps with tiered limits and features.</p>
                </div>
                <button
                  type="button"
                  className="rounded-xl p-2 text-text-muted-app hover:bg-app-card hover:text-text-app"
                  onClick={() => setShowPremium(false)}
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col rounded-2xl border border-gray-200 bg-app-card/50 p-5">
                  <p className="text-sm font-bold uppercase tracking-wider text-text-muted-app">Free</p>
                  <p className="mt-2 text-2xl font-bold text-text-app">$0</p>
                  <p className="mt-2 text-sm text-text-muted-app">Limited gas per day. Perfect to try gasless swaps.</p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-text-muted-app">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-text-muted-app" />
                      Up to 2 swaps/day
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-text-muted-app" />
                      Basic support
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="mt-4 w-full rounded-2xl border border-gray-200 py-2.5 text-sm font-bold text-text-app hover:bg-app-card"
                    onClick={() => setShowPremium(false)}
                  >
                    Current plan
                  </button>
                </div>
                <div className="relative flex flex-col rounded-2xl border-2 border-accent bg-white p-5 shadow-md">
                  <span className="absolute -top-2.5 left-4 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-white">
                    Recommended
                  </span>
                  <p className="mt-1 text-sm font-bold uppercase tracking-wider text-accent">Pro</p>
                  <p className="mt-2 text-2xl font-bold text-text-app">$9<span className="text-sm font-medium text-text-muted-app">/mo</span></p>
                  <p className="mt-2 text-sm text-text-muted-app">Higher gas limits and priority. For regular swappers.</p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-text-muted-app">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Up to 20 swaps/day
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Batch swaps
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="mt-4 w-full rounded-2xl bg-accent py-2.5 text-sm font-bold text-white hover:bg-accent-hover"
                    onClick={() => setShowPremium(false)}
                  >
                    Upgrade to Pro
                  </button>
                </div>
                <div className="flex flex-col rounded-2xl border border-gray-200 bg-app-card/50 p-5">
                  <p className="text-sm font-bold uppercase tracking-wider text-accent">Master</p>
                  <p className="mt-2 text-2xl font-bold text-text-app">$29<span className="text-sm font-medium text-text-muted-app">/mo</span></p>
                  <p className="mt-2 text-sm text-text-muted-app">AI agent, lowest fees, unlimited gas. For power users.</p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-text-muted-app">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Unlimited swaps
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      AI swap suggestions
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Lowest fees
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Dedicated support
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="mt-4 w-full rounded-2xl bg-accent py-2.5 text-sm font-bold text-white hover:bg-accent-hover"
                    onClick={() => setShowPremium(false)}
                  >
                    Upgrade to Master
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
