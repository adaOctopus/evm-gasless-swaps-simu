'use client';

import { useState, useEffect } from 'react';

/**
 * True only after the component has mounted. Use so server and first client render match
 * (e.g. wallet-dependent UI shows a single consistent state until after hydration).
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
