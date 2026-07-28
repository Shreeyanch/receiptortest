'use client';

import { useEffect, useState } from 'react';
import ReceiptView from '@/components/ReceiptView';
import BottomNav from '@/components/BottomNav';
import type { ApiReceipt } from '@/components/ReceiptView';

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [receiptData, setReceiptData] = useState<ApiReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('samparka_auth');
      if (raw) {
        const auth = JSON.parse(raw);
        setIsLoggedIn(true);
        fetch(`/api/receipts/${id}`, { method: 'POST' });
      }
    } catch {}
  }, [id]);

  useEffect(() => {
    fetch(`/api/receipts/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.receipt) {
          const r = json.receipt;
          setReceiptData({
            receiptId: r.receiptId,
            shopName: r.shopName,
            shopAddress: r.shopAddress ?? '',
            shopPhone: r.shopPhone ?? '',
            cashier: r.cashier ?? '',
            items: r.items ?? [],
            subtotal: r.subtotal ?? 0,
            discount: r.discount ?? 0,
            tax: r.tax ?? 0,
            total: r.total,
            paymentMethod: r.paymentMethod ?? 'Cash',
            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : new Date().toISOString(),
          });
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pine border-t-transparent mb-4" />
        <p className="text-sm text-ash">Loading receipt...</p>
      </main>
    );
  }

  if (notFound || !receiptData) {
    return (
      <main className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 bg-white rounded-3xl border border-ash/10 flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">🧾</span>
          </div>
          <h1 className="text-xl font-bold text-ink mb-2">Receipt Not Found</h1>
          <p className="text-sm text-ash leading-relaxed mb-8">
            This receipt doesn&apos;t exist or may have expired. Check the link and try again.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-pine text-white px-6 py-3 rounded-2xl text-sm font-semibold btn-press"
          >
            ← Go Home
          </a>
        </div>
        <p className="mt-8 text-[11px] text-ash/40">
          Powered by{' '}
          <a href="https://samparka.com" className="text-pine font-semibold" target="_blank" rel="noreferrer">
            Samparka
          </a>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper pb-28">
      <div className="max-w-sm mx-auto pb-10">
        <ReceiptView id={id} receiptData={receiptData} />
        <div className="text-center pb-4 px-4">
          <p className="text-[11px] text-ash">
            Powered by{' '}
            <a
              href="https://samparka.com"
              className="text-pine font-semibold"
              target="_blank"
              rel="noreferrer"
            >
              Samparka
            </a>
          </p>
          <p className="text-[11px] text-ash/40 mt-0.5">
            Paperless receipts for Nepal 🇳🇵
          </p>
        </div>
      </div>
      {isLoggedIn && <BottomNav />}
    </main>
  );
}
