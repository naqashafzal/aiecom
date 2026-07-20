"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Avoid tracking admin or API routes if desired, but we track everything for now
    // except API routes and static files.
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
      return;
    }

    const trackPageView = async () => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: window.location.href,
            pathname: pathname,
            referrer: document.referrer,
          }),
        });
      } catch (error) {
        // Silently fail to not disrupt user experience
        console.error('Failed to track analytics');
      }
    };

    // Use setTimeout to ensure the page has fully loaded before tracking
    const timeoutId = setTimeout(trackPageView, 1000);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null; // This component doesn't render anything
}
