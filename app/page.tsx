'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('samparka_auth');
      if (raw) {
        const auth = JSON.parse(raw);
        if (auth.type === 'staff') {
          router.replace('/staff');
        } else if (auth.type === 'user') {
          router.replace('/receipts');
        } else {
          router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
    } catch {
      router.replace('/login');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </main>
  );
}
