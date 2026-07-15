'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '@/src/app/context/LoadingContext';

export default function RouteChangeListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    // Start loading when route changes
    startLoading('Loading page...');

    // Stop loading after a short delay (page should be rendered by then)
    const timer = setTimeout(() => {
      stopLoading();
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams, startLoading, stopLoading]);

  return null;
}
