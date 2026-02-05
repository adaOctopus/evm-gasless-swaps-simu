import Link from 'next/link';

/**
 * Marketing landing one-pager: same beige + purple palette as app, CTA "Launch app" → /
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-app font-display">
      {/* Subtle grid / glow – purple to match app accent */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(44, 0, 124, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(44, 0, 124, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-accent/10" />
      <div className="absolute left-1/2 top-1/4 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-accent">
            ERC-4337 · EIP-7702
          </p>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-text-app sm:text-5xl md:text-6xl">
            One-Click
            <br />
            <span className="bg-gradient-to-r from-accent via-accent-hover to-accent/80 bg-clip-text text-transparent">
              Gasless Swap
            </span>
          </h1>
          <p className="mb-10 text-lg font-medium text-text-muted-app sm:text-xl">
            Swap tokens without holding ETH. Smart accounts, paymasters, and DEX routing in one flow.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-8 py-4 text-base font-bold uppercase tracking-wider text-white shadow-lg shadow-accent/25 transition hover:bg-accent-hover hover:shadow-accent/30"
          >
            Launch app
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
