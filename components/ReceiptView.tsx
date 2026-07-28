'use client';

import { useEffect, useState } from 'react';
import { RECEIPT_DATA, type Receipt } from '@/lib/dummyData';

export interface ApiReceipt {
  receiptId: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  tableNumber?: number;
  customerName?: string;
  cashier: string;
  items: Array<{ name: string; qty: number; price: number }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

function mapApiToReceipt(data: ApiReceipt): Receipt {
  const d = new Date(data.createdAt);
  return {
    id: data.receiptId,
    shopName: data.shopName,
    address: data.shopAddress,
    phone: data.shopPhone,
    website: '',
    date: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    cashier: data.cashier,
    receiptId: data.receiptId,
    items: data.items,
    subtotal: data.subtotal,
    discount: data.discount,
    vat: data.tax,
    total: data.total,
    paymentMethod: data.paymentMethod,
    tableNumber: data.tableNumber,
    customerName: data.customerName,
  };
}

// Google review link is used in two places (star tap + the CTA button), so it lives
// outside the component and takes the place id rather than reading env twice.
const GOOGLE_PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || 'ChIJplaceholder';
function openGoogleReview() {
  window.open(`https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`, '_blank');
}

// Icons — kept as plain inline SVG rather than pulling in an icon package for a
// handful of glyphs.
const IShare = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IShield = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const ICopy = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
const ICheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IMap = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IPhone = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 8.1A16 16 0 0015.9 17.09l1.46-1.46a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>;
const IGlobe = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
const ISpin = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>;

function Barcode({ value }: { value: string }) {
  const bars: number[] = [];
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    bars.push((c & 3) + 1, ((c >> 2) & 3) + 1, ((c >> 4) & 3) + 1);
  }
  return (
    <div className="flex items-end justify-center gap-[1.5px] h-11 my-1">
      {bars.slice(0, 52).map((w, i) => (
        <div
          key={i}
          style={{ width: w * 1.6, height: `${68 + (i % 4) * 8}%` }}
          className="bg-ink rounded-[1px]"
        />
      ))}
    </div>
  );
}

function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 z-[200] flex items-center gap-2 bg-ink text-white text-sm font-semibold px-5 py-3 rounded-full shadow-xl whitespace-nowrap transition-all duration-300
      ${show ? 'opacity-100 -translate-x-1/2 translate-y-0' : 'opacity-0 -translate-x-1/2 translate-y-6 pointer-events-none'}`}
    >
      <span className="text-pine"><ICheck /></span>
      {msg}
    </div>
  );
}

export default function ReceiptView({
  id,
  receiptData,
  isDummy = false,
}: {
  id: string;
  receiptData?: ApiReceipt | null;
  isDummy?: boolean;
}) {
  const receipt: Receipt = receiptData ? mapApiToReceipt(receiptData) : RECEIPT_DATA;

  const [isDuplicate, setIsDuplicate] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const auth = localStorage.getItem('samparka_auth');
      setIsLoggedIn(!!auth);
    } catch {}
  }, []);
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [selectedStars, setSelectedStars] = useState(0);
  const [hoveredStars, setHoveredStars] = useState(0);

  useEffect(() => {
    if (!isDummy) {
      setIsDuplicate(false);
      return;
    }
    const key = `samparka_viewed_${id}`;
    if (localStorage.getItem(key)) setIsDuplicate(true);
    else localStorage.setItem(key, Date.now().toString());
  }, [id, isDummy]);

  function showToast(msg: string) {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg }), 2400);
  }

  function copyId() {
    navigator.clipboard.writeText(`#${receipt.receiptId}`).then(() => {
      setIdCopied(true);
      showToast('Receipt ID copied!');
      setTimeout(() => setIdCopied(false), 2000);
    });
  }

  function shareReceipt() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `Receipt — ${receipt.shopName}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard!'));
    }
  }

  function handleStarClick(stars: number) {
    setSelectedStars(stars);
    openGoogleReview();
  }

  async function shareOnWhatsApp() {
    if (whatsappLoading) return;
    setWhatsappLoading(true);
    try {
      const res = await fetch('/api/whatsapp/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptId: receipt.receiptId }),
      });
      const data = await res.json();
      if (data.success && data.waLink) {
        window.open(data.waLink, '_blank');
        showToast('Opening WhatsApp...');
      } else {
        showToast(data.error || 'Could not open WhatsApp');
      }
    } catch {
      showToast('Could not connect to WhatsApp');
    } finally {
      setWhatsappLoading(false);
    }
  }


  return (
    <div className="font-sans pt-6">
      {/* Receipt card */}
      <div id="receipt-card" className="relative bg-white border border-ash/10">
        {isDuplicate && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div
              className="border-[3px] border-red-500 text-red-500 font-receipt font-black text-3xl px-5 py-2 uppercase tracking-[0.2em] opacity-30"
              style={{ transform: 'rotate(-28deg)' }}
            >
              DUPLICATE
            </div>
          </div>
        )}

        <div className="p-5 font-receipt text-[13px] text-ink">
          <div className="flex justify-center mb-3">
            <div className="border-2 border-ink px-3 py-0.5 text-[10px] font-bold text-ink uppercase tracking-[0.2em]">
              TAX INVOICE
            </div>
          </div>

          <div className="text-center mb-3">
            <p className="text-[15px] font-black uppercase tracking-wide leading-tight">{receipt.shopName}</p>
            <div className="mt-2 space-y-0.5 text-[11px] text-ash">
              {receipt.address && (
                <p className="flex items-center justify-center gap-1"><IMap />{receipt.address}</p>
              )}
              {receipt.phone && (
                <p className="flex items-center justify-center gap-1"><IPhone />{receipt.phone}</p>
              )}
            </div>
          </div>

          <div className="receipt-dash" />

          <div className="flex justify-between text-[11px] text-ash mb-1">
            <span className="font-mono">Date: {receipt.date}</span>
            <span className="font-mono">Time: {receipt.time}</span>
          </div>
          {(receipt.tableNumber || receipt.customerName) && (
            <div className="flex justify-between text-[11px] text-ash mb-1">
              <span>Table: {receipt.tableNumber ?? '—'}</span>
              <span>Guest: {receipt.customerName || '—'}</span>
            </div>
          )}
          <div className="text-[11px] text-ash mb-1">Cashier: {receipt.cashier}</div>
          <div className="flex items-center justify-between text-[11px] text-ash">
            <span className="font-mono">Receipt: #{receipt.receiptId}</span>
            <button
              onClick={copyId}
              aria-label="Copy receipt ID"
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 border border-ash/20 text-ash hover:bg-paper btn-press"
            >
              {idCopied ? <><ICheck />Copied</> : <><ICopy />Copy</>}
            </button>
          </div>

          <div className="receipt-dash" />

          <div className="grid grid-cols-[1fr_32px_80px] text-[10px] font-bold text-ash uppercase tracking-wider mb-1">
            <span>ITEM</span><span className="text-center">QTY</span><span className="text-right">PRICE</span>
          </div>
          <div className="receipt-dash mt-0 mb-1" />
          <div className="space-y-1.5">
            {receipt.items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_32px_80px] items-center text-[12.5px]">
                <span className="text-ink">{item.name}</span>
                <span className="text-center text-ash text-[11px]">×{item.qty}</span>
                <span className="text-right font-bold tabular-nums font-mono">Rs {item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="receipt-dash" />

          <div className="space-y-1">
            <div className="flex justify-between text-[12px]">
              <span className="text-ash">Subtotal</span>
              <span className="tabular-nums text-ink font-mono">Rs {receipt.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-pine font-semibold">Discount (Member)</span>
              <span className="tabular-nums text-pine font-semibold font-mono">−Rs {receipt.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-ash">VAT 13%</span>
              <span className="tabular-nums text-ink font-mono">Rs {receipt.vat.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-2 mb-1 border-t-2 border-ink" />
          <div className="mb-2 border-t border-ash/30" />

          <div className="flex justify-between items-center">
            <span className="text-[13px] font-black uppercase tracking-widest text-ink">TOTAL</span>
            <span className="text-[26px] font-black tabular-nums text-pine tracking-tight font-mono">
              Rs {receipt.total.toFixed(2)}
            </span>
          </div>

          <div className="mt-1 mb-2 border-t border-ash/30" />
          <div className="mb-3 border-t-2 border-ink" />

          <div className="text-[11.5px] text-ash space-y-0.5">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-semibold text-ink">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Served by:</span>
              <span className="font-semibold text-ink">{receipt.cashier}</span>
            </div>
          </div>

          <div className="receipt-dash" />

          <div className="text-center text-[11px] text-ash space-y-0.5">
            <p>Thank you for visiting!</p><p>Please come again!</p>
          </div>

          <div className="receipt-dash" />

          <Barcode value={receipt.receiptId} />
          <p className="text-center text-[10px] text-ash mt-1 tracking-widest font-bold font-mono">{receipt.receiptId}</p>

          <div className="receipt-dash" />

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pine uppercase tracking-wide">
              <IShield />[ Verified ]
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-marigold uppercase tracking-wide">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 14h-2V8h2v8zm4 0h-2V8h2v8z"/></svg>
              [ NFC Tap ]
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-ash/20 flex items-center justify-center gap-1.5">
            <span className="text-[10px] text-ash/40">Powered by</span>
            <span className="text-[10px] text-pine font-black uppercase tracking-widest">Samparka</span>
            <span className="text-[10px] text-ash/40">· samparka.com</span>
          </div>
        </div>
      </div>

      {/* Tear line — the receipt card ends here, the rest is app chrome */}
      <div
        aria-hidden="true"
        className="h-3 bg-white"
        style={{
          WebkitMaskImage: 'radial-gradient(circle at 10px 0, transparent 6px, black 6.5px)',
          WebkitMaskSize: '20px 100%',
          WebkitMaskRepeat: 'repeat-x',
          maskImage: 'radial-gradient(circle at 10px 0, transparent 6px, black 6.5px)',
          maskSize: '20px 100%',
          maskRepeat: 'repeat-x',
        }}
      />

      {/* Actions */}
      <div className="p-4 space-y-3">
        {!isLoggedIn && (
          <>
            <p className="text-center text-[10px] font-semibold text-ash uppercase tracking-widest">Share Receipt</p>

            <button
              onClick={shareOnWhatsApp}
              disabled={whatsappLoading}
              className="w-full bg-pine text-white border-2 border-ink py-3.5 rounded-md font-semibold flex items-center justify-center gap-2 btn-press hover:bg-pine-dark transition-colors disabled:opacity-70 disabled:cursor-wait"
            >
              {whatsappLoading ? (
                <><ISpin /><span>Connecting...</span></>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Share on WhatsApp
                </>
              )}
            </button>
          </>
        )}

        <div className="flex justify-center pt-1">
          <button
            onClick={shareReceipt}
            className="inline-flex items-center gap-1.5 text-ash text-sm font-medium underline underline-offset-4 decoration-ash/40 hover:text-ink hover:decoration-ink transition-colors btn-press"
          >
            <IShare />Share Receipt
          </button>
        </div>
      </div>

      {/* Rating */}
      <div className="px-4 pb-4 space-y-3">
        <div className="bg-white rounded-md border-2 border-ink p-4 space-y-3">
          <p className="text-center text-[13px] font-bold text-ink">How was your experience?</p>

          <div className="flex items-center justify-center gap-2" onMouseLeave={() => setHoveredStars(0)}>
            {[1, 2, 3, 4, 5].map(star => {
              const active = (hoveredStars || selectedStars) >= star;
              return (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoveredStars(star)}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  className="btn-press"
                  style={{ transition: 'transform 180ms ease', transform: hoveredStars === star ? 'scale(1.2)' : 'scale(1)' }}
                >
                  <svg
                    width="36" height="36" viewBox="0 0 24 24"
                    style={{ transition: 'fill 180ms ease, stroke 180ms ease' }}
                    fill={active ? '#E0A331' : 'none'}
                    stroke={active ? '#E0A331' : '#d1d5db'}
                    strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={openGoogleReview}
          className="w-full bg-white text-ink border-2 border-ink py-3.5 rounded-md font-semibold flex items-center justify-center gap-2 btn-press hover:bg-ink hover:text-paper transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Leave us a review on Google
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}