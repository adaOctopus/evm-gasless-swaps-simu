'use client';

export function Hero() {
  return (
    <section className="mx-4 mt-6 overflow-hidden rounded-t-2xl bg-surface px-6 py-10 text-white sm:mx-auto sm:max-w-4xl sm:px-10 sm:py-14">
      <h1 className="text-2xl font-bold uppercase tracking-wide sm:text-3xl md:text-4xl">
        One-Click Gasless Swap
      </h1>
      <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
        Swap tokens without holding ETH. ERC-4337 and EIP-7702 powered.
      </p>
      <div className="mt-6 h-12 w-32 rounded-lg bg-gradient-to-r from-accent to-accent-light" />
    </section>
  );
}
