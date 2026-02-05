'use client';

import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import { useMounted } from '@/hooks/useMounted';

const OPEN_CONNECT_EVENT = 'open-connect-modal';

export function Header() {
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
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2 font-semibold text-white">
            <span className="text-xl">⚡</span>
            Gasless Swap
          </span>
          <nav className="hidden items-center gap-1 sm:flex">
            {['Trade', 'Account', 'Learn', 'More'].map((label) => (
              <button
                key={label}
                type="button"
                className="flex items-center gap-0.5 rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/5 hover:text-white"
              >
                {label}
                <svg className="h-4 w-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPremium(true)}
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-white sm:block"
          >
            Go Premium
          </button>
          <div className="flex items-center gap-2 rounded-full border border-primary/50 bg-card-elevated/80 px-3 py-1.5">
            <div className="h-5 w-5 rounded-full bg-primary/20" />
            <span className="text-sm font-medium text-white">Ethereum</span>
            <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {showWalletConnected ? (
            <>
              <span className="max-w-[120px] truncate rounded-full bg-card-elevated px-3 py-2 text-xs font-medium text-white sm:max-w-[160px]">
                {address.slice(0, 6)}…{address.slice(-4)}
              </span>
              <button
                type="button"
                onClick={() => disconnect()}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-white"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowConnect(true)}
              className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Connect wallet
            </button>
          )}
          <button type="button" className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-white" aria-label="Settings">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
      {showConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-label="Connect wallet" onClick={() => setShowConnect(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white">Connect wallet</h2>
            <ul className="mt-4 space-y-2">
              {connectors.map((c) => (
                <li key={c.uid}>
                  <button
                    type="button"
                    onClick={() => { connect({ connector: c }); setShowConnect(false); }}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-input py-3 px-4 text-left text-white hover:bg-card-elevated"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="mt-4 w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted hover:text-white" onClick={() => setShowConnect(false)}>Cancel</button>
          </div>
        </div>
      )}
      {showPremium && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-label="Premium" onClick={() => setShowPremium(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white">Go Premium</h2>
            <p className="mt-2 text-sm text-muted">FREE: limited gas. PRO: higher limits. MASTER: AI agent, lower fees.</p>
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover" onClick={() => setShowPremium(false)}>Upgrade to PRO</button>
              <button type="button" className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted hover:text-white" onClick={() => setShowPremium(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
