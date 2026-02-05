import { Sidebar } from '@/components/Sidebar';
import { AppHeader } from '@/components/AppHeader';
import { SwapForm } from '@/components/SwapForm';
import { ConnectModal } from '@/components/ConnectModal';
import { PremiumModal } from '@/components/PremiumModal';
import { SwapStatusModal } from '@/components/SwapStatusModal';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-app font-display">
      <Sidebar />
      <div className="min-h-screen bg-app pl-56">
        <AppHeader />
        <main className="px-6 py-8">
          <h1 className="mb-6 text-xl font-bold text-text-app">Swap</h1>
          <div className="flex flex-col items-start">
            <SwapForm />
          </div>
          <footer className="mt-12 text-center">
            <p className="text-sm font-medium text-text-muted-app">
              Need help?{' '}
              <Link href="#" className="font-semibold text-accent hover:underline">
                Check our FAQ
              </Link>
            </p>
          </footer>
        </main>
      </div>
      <ConnectModal />
      <PremiumModal />
      <SwapStatusModal />
    </div>
  );
}
