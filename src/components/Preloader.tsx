
'use client';

import { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Preloader() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (sessionStorage.getItem('preloaderShown')) {
      setIsLoaded(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoaded(true);
      sessionStorage.setItem('preloaderShown', 'true');
    }, 2500); // Preloader duration

    return () => clearTimeout(timer);
  }, [isMounted]);

  if (!isMounted || (isMounted && isLoaded && sessionStorage.getItem('preloaderShown'))) {
    return null;
  }
  
  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-1000',
        isLoaded && 'opacity-0 pointer-events-none'
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="animate-rocket-fly">
          <Rocket className="h-16 w-16 -rotate-45 text-primary" />
        </div>
        <h1 className="ml-4 text-5xl font-bold font-headline tracking-tighter text-foreground animate-fade-in-text">
          FlowZone
        </h1>
      </div>
    </div>
  );
}
