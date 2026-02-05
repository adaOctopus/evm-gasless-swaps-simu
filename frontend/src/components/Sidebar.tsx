'use client';

import React from 'react';
import Link from 'next/link';

const navItems: Array<{ label: string; href: string; icon: (p: { className?: string }) => React.ReactElement; active?: boolean }> = [
  { label: 'Home', href: '/', icon: HomeIcon },
  { label: 'Tokens', href: '/', icon: TokenIcon, active: true },
  { label: 'Apps', href: '/', icon: AppsIcon },
  { label: 'Rewards', href: '/', icon: RewardsIcon },
];

/** Linea-style sidebar: logo + nav (Home, Tokens, Apps, Rewards) with icons, active state = accent bg */
export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-56 flex-col border-r border-gray-200/80 bg-app-sidebar font-display">
      <div className="flex h-14 items-center gap-2 border-b border-gray-200/60 px-4">
        <span className="text-lg font-bold tracking-tight text-accent">⚡ Gasless Swap</span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map(({ label, href, icon: Icon, active = false }) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
              active
                ? 'bg-accent text-white'
                : 'text-text-muted-app hover:bg-app-card hover:text-text-app'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function TokenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AppsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function RewardsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  );
}
