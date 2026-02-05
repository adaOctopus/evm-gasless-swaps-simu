'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type PremiumModalContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const PremiumModalContext = createContext<PremiumModalContextValue | null>(null);

export function usePremiumModal() {
  const ctx = useContext(PremiumModalContext);
  return ctx ?? { open: () => {}, close: () => {}, isOpen: false };
}

/** Go Premium modal: FREE / PRO / MASTER comparison, upgrade CTAs */
export function PremiumModal({ children }: { children?: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <PremiumModalContext.Provider value={{ open, close, isOpen }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-label="Go Premium"
          onClick={close}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-white">Go Premium</h2>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-border p-4">
                <p className="font-semibold text-white">FREE</p>
                <p className="mt-1 text-xs text-muted">Limited gas</p>
              </div>
              <div className="rounded-xl border-2 border-primary p-4">
                <p className="font-semibold text-white">PRO</p>
                <p className="mt-1 text-xs text-muted">Higher limits</p>
                <button
                  type="button"
                  className="mt-2 w-full rounded-xl bg-primary py-1.5 text-sm font-semibold text-white hover:bg-primary-hover"
                  onClick={close}
                >
                  Upgrade
                </button>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-semibold text-white">MASTER</p>
                <p className="mt-1 text-xs text-muted">AI agent, lower fees</p>
                <button
                  type="button"
                  className="mt-2 w-full rounded-xl bg-card-elevated py-1.5 text-sm font-semibold text-white hover:bg-input"
                  onClick={close}
                >
                  Upgrade
                </button>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-xl border border-border py-2 text-sm font-medium text-muted hover:text-white"
              onClick={close}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </PremiumModalContext.Provider>
  );
}
