'use client';

import { useEffect, useState } from 'react';
import { RECEIPT_DATA, type Receipt } from '@/lib/dummyData';

export interface ApiReceipt {
  receiptId: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
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
    id:            data.receiptId,
    shopName:      data.shopName,
    address:       data.shopAddress,
    phone:         data.shopPhone,
    website:       '',
    date:          d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    time:          d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    cashier:       data.cashier,
    receiptId:     data.receiptId,
    items:         data.items,
    subtotal:      data.subtotal,
    discount:      data.discount,
    vat:           data.tax,
    total:         data.total,
    paymentMethod: data.paymentMethod,
  };
}

/* ─── Icons ────────────────────────────────────────────────────── */
const ICamera  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IPDF     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>;
const IWallet  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><circle cx="12" cy="14" r="1"/></svg>;
const IShare   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IShield  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const ICopy    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
const ICheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IMap     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IPhone   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 8.1A16 16 0 0015.9 17.09l1.46-1.46a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>;
const IGlobe   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
const ISpin    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>;

/* ─── Barcode ───────────────────────────────────────────────────── */
function Barcode({ value }: { value: string }) {
  const bars: number[] = [];
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    bars.push((c & 3) + 1, ((c >> 2) & 3) + 1, ((c >> 4) & 3) + 1);
  }
  return (
    <div className="flex items-end justify-center gap-[1.5px] h-11 my-1">
      {bars.slice(0, 52).map((w, i) => (
        <div key={i} style={{ width: w * 1.6, height: `${68 + (i % 4) * 8}%` }}
          className="bg-gray-900 rounded-[1px]" />
      ))}
    </div>
  );
}

/* ─── Toast ─────────────────────────────────────────────────────── */
function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <div className={`fixed bottom-8 left-1/2 z-[200] flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-xl whitespace-nowrap transition-all duration-300
      ${show ? 'opacity-100 -translate-x-1/2 translate-y-0' : 'opacity-0 -translate-x-1/2 translate-y-6 pointer-events-none'}`}>
      <span className="text-green-400"><ICheck /></span>
      {msg}
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */
export default function ReceiptView({
  id,
  receiptData,
}: {
  id: string;
  receiptData?: ApiReceipt | null;
}) {
  const receipt: Receipt = receiptData ? mapApiToReceipt(receiptData) : RECEIPT_DATA;

  const [isDuplicate,  setIsDuplicate]  = useState(false);
  const [idCopied,     setIdCopied]     = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [pdfLoading,   setPdfLoading]   = useState(false);
  const [walletTip,    setWalletTip]    = useState(false);
  const [toast,        setToast]        = useState({ show: false, msg: '' });

  useEffect(() => {
    const key = `samparka_viewed_${id}`;
    if (localStorage.getItem(key)) setIsDuplicate(true);
    else                            localStorage.setItem(key, Date.now().toString());
  }, [id]);

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

  async function saveAsPhoto() {
    if (photoLoading) return;
    setPhotoLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const el = document.getElementById('receipt-card');
      if (!el) return;
      const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false });
      const a = document.createElement('a');
      a.download = `Samparka-Receipt-${receipt.receiptId}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      showToast('Receipt saved to photos!');
    } catch { showToast('Could not save image'); }
    finally   { setPhotoLoading(false); }
  }

  async function saveAsPDF() {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' });
      const W = doc.internal.pageSize.getWidth();
      const mg = 14;
      let y = mg;

      const teal      = [29, 158, 117]  as [number,number,number];
      const tealLight = [232, 247, 241] as [number,number,number];
      const gray9     = [33,  33,  33]  as [number,number,number];
      const gray6     = [117, 117, 117] as [number,number,number];
      const gray4     = [189, 189, 189] as [number,number,number];
      const green     = [21,  128, 61]  as [number,number,number];

      doc.setFillColor(...teal);
      doc.rect(0, 0, W, 20, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(255, 255, 255);
      doc.text('SAMPARKA', W / 2, 9, { align: 'center' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(200, 240, 225);
      doc.text('Digital Receipt', W / 2, 15, { align: 'center' });
      y = 28;

      doc.setDrawColor(...gray9); doc.setLineWidth(0.5);
      doc.rect(mg, y - 4, W - mg * 2, 8, 'S');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...gray9);
      doc.text('TAX INVOICE', W / 2, y + 0.5, { align: 'center' });
      y += 10;

      doc.setFont('courier', 'bold'); doc.setFontSize(13); doc.setTextColor(...gray9);
      doc.text(receipt.shopName.toUpperCase(), W / 2, y, { align: 'center' });
      y += 6;
      doc.setFont('courier', 'normal'); doc.setFontSize(8); doc.setTextColor(...gray6);
      [receipt.address, receipt.phone, receipt.website].forEach(l => { doc.text(l, W / 2, y, { align: 'center' }); y += 4.5; });

      y += 2; doc.setLineDashPattern([1,1], 0); doc.setDrawColor(...gray4);
      doc.line(mg, y, W - mg, y); y += 5;

      doc.setFont('courier', 'normal'); doc.setFontSize(8); doc.setTextColor(...gray6);
      doc.text(`Date: ${receipt.date}`, mg, y); doc.text(`Time: ${receipt.time}`, W - mg, y, { align: 'right' }); y += 5;
      doc.text(`Receipt: #${receipt.receiptId}`, mg, y); y += 5;
      doc.text(`Cashier: ${receipt.cashier}`, mg, y); y += 5;

      doc.setLineDashPattern([1,1], 0); doc.line(mg, y, W - mg, y); y += 6;

      doc.setFont('courier', 'bold'); doc.setFontSize(8); doc.setTextColor(...gray6);
      doc.text('ITEM', mg, y); doc.text('QTY', W / 2, y, { align: 'center' }); doc.text('PRICE', W - mg, y, { align: 'right' }); y += 3;
      doc.setLineDashPattern([1,1], 0); doc.line(mg, y, W - mg, y); y += 5;

      receipt.items.forEach(item => {
        doc.setFont('courier', 'normal'); doc.setFontSize(9); doc.setTextColor(...gray9);
        doc.text(item.name, mg, y);
        doc.setTextColor(...gray6); doc.text(`x${item.qty}`, W / 2, y, { align: 'center' });
        doc.setFont('courier', 'bold'); doc.setTextColor(...gray9);
        doc.text(`Rs ${item.price.toFixed(2)}`, W - mg, y, { align: 'right' });
        y += 6;
      });

      y += 1; doc.setLineDashPattern([1,1], 0); doc.line(mg, y, W - mg, y); y += 5;

      const totals: [string, string, [number,number,number]][] = [
        ['Subtotal', `Rs ${receipt.subtotal.toFixed(2)}`, gray6],
        ['Discount (Member)', `-Rs ${receipt.discount.toFixed(2)}`, green],
        ['VAT 13%', `Rs ${receipt.vat.toFixed(2)}`, gray6],
      ];
      doc.setFontSize(9);
      totals.forEach(([label, val, color]) => {
        doc.setFont('courier', 'normal'); doc.setTextColor(...gray6); doc.text(label, mg, y);
        doc.setFont('courier', 'bold'); doc.setTextColor(...color); doc.text(val, W - mg, y, { align: 'right' });
        y += 5.5;
      });

      y += 1; doc.setLineDashPattern([], 0); doc.setDrawColor(...gray9); doc.setLineWidth(0.6);
      doc.line(mg, y, W - mg, y); y += 1; doc.line(mg, y, W - mg, y); y += 6;

      const cw = W - mg * 2;
      doc.setFillColor(...tealLight); doc.roundedRect(mg, y - 5, cw, 12, 2, 2, 'F');
      doc.setFont('courier', 'bold'); doc.setFontSize(10); doc.setTextColor(...teal);
      doc.text('TOTAL', mg + 4, y + 3);
      doc.setFontSize(14); doc.text(`Rs ${receipt.total.toFixed(2)}`, W - mg - 4, y + 3, { align: 'right' });
      y += 16;

      doc.setLineDashPattern([1,1], 0); doc.setDrawColor(...gray4); doc.line(mg, y, W - mg, y); y += 5;
      doc.setFont('courier', 'normal'); doc.setFontSize(8); doc.setTextColor(...gray6);
      doc.text(`Payment Method: ${receipt.paymentMethod}`, mg, y); y += 5;
      doc.text(`Served by: ${receipt.cashier}`, mg, y); y += 7;
      doc.setFont('courier', 'bold'); doc.setFontSize(8); doc.setTextColor(...gray9);
      doc.text('Thank you for visiting! Please come again!', W / 2, y, { align: 'center' }); y += 6;

      doc.setLineDashPattern([1,1], 0); doc.setDrawColor(...gray4); doc.line(mg, y, W - mg, y); y += 5;
      doc.setFillColor(...tealLight); doc.roundedRect(mg, y - 3, cw, 7, 2, 2, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...teal);
      doc.text('✓ Cryptographically Verified  ·  Received via NFC Tap', W / 2, y + 1.5, { align: 'center' });

      const fY = doc.internal.pageSize.getHeight() - 10;
      doc.setLineDashPattern([], 0); doc.setDrawColor(...gray4); doc.line(mg, fY - 4, W - mg, fY - 4);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...gray4);
      doc.text('Powered by Samparka · samparka.com · Paperless receipts for Nepal', W / 2, fY, { align: 'center' });

      doc.save(`Samparka-Receipt-${receipt.receiptId}.pdf`);
      showToast('PDF downloaded!');
    } catch (e) { console.error(e); showToast('Could not generate PDF'); }
    finally      { setPdfLoading(false); }
  }

  return (
    <div className="font-sans">

      {/* ── NFC indicator ── */}
      <div className="text-center pt-6 pb-3">
        <p className="text-samparka font-bold text-[13px] uppercase tracking-widest">Samparka</p>
        <p className="text-gray-400 text-[11px] mt-0.5">Digital Receipt</p>
        <div className="flex flex-col items-center gap-1.5 mt-3 mb-1">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {[1,2,3].map(i => (
              <span key={i} className={`absolute inset-0 rounded-full border-2 border-samparka nfc-ring-${i}`} />
            ))}
            <span className="relative z-10 w-7 h-7 bg-samparka rounded-full flex items-center justify-center text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 14H9V8h3v8zm5 0h-3V8h3v8z" opacity=".4"/>
                <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zm-8-4h2v2h-2zm0-8h2v6h-2z"/>
              </svg>
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">Just now</p>
        </div>
      </div>

      {/* ── Receipt card — sharp corners like paper ── */}
      <div id="receipt-card" className="relative bg-white shadow-[0_2px_20px_rgba(0,0,0,0.10)]">

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

        <div className="p-5 font-receipt text-[13px] text-gray-800">

          {/* TAX INVOICE */}
          <div className="flex justify-center mb-3">
            <div className="border-2 border-gray-700 px-3 py-0.5 text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em]">
              TAX INVOICE
            </div>
          </div>

          {/* Shop info */}
          <div className="text-center mb-3">
            <p className="text-[15px] font-black uppercase tracking-wide leading-tight">{receipt.shopName}</p>
            <div className="mt-2 space-y-0.5 text-[11px] text-gray-500">
              <p className="flex items-center justify-center gap-1"><IMap />{receipt.address}</p>
              <p className="flex items-center justify-center gap-1"><IPhone />{receipt.phone}</p>
              <p className="flex items-center justify-center gap-1"><IGlobe />{receipt.website}</p>
            </div>
          </div>

          <div className="receipt-dash" />

          {/* Transaction meta */}
          <div className="flex justify-between text-[11px] text-gray-500 mb-1">
            <span>Date: {receipt.date}</span><span>Time: {receipt.time}</span>
          </div>
          <div className="text-[11px] text-gray-500 mb-1">Cashier: {receipt.cashier}</div>
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>Receipt: #{receipt.receiptId}</span>
            <button onClick={copyId}
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 border border-gray-300 text-gray-500 hover:bg-gray-50 btn-press">
              {idCopied ? <><ICheck />Copied</> : <><ICopy />Copy</>}
            </button>
          </div>

          <div className="receipt-dash" />

          {/* Items */}
          <div className="grid grid-cols-[1fr_32px_80px] text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>ITEM</span><span className="text-center">QTY</span><span className="text-right">PRICE</span>
          </div>
          <div className="receipt-dash mt-0 mb-1" />
          <div className="space-y-1.5">
            {receipt.items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_32px_80px] items-center text-[12.5px]">
                <span className="text-gray-800">{item.name}</span>
                <span className="text-center text-gray-500 text-[11px]">×{item.qty}</span>
                <span className="text-right font-bold tabular-nums">Rs {item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="receipt-dash" />

          {/* Subtotals */}
          <div className="space-y-1">
            <div className="flex justify-between text-[12px]">
              <span className="text-gray-500">Subtotal</span>
              <span className="tabular-nums text-gray-700">Rs {receipt.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-green-700 font-semibold">Discount (Member) 🎉</span>
              <span className="tabular-nums text-green-700 font-semibold">−Rs {receipt.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-gray-500">VAT 13%</span>
              <span className="tabular-nums text-gray-700">Rs {receipt.vat.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-2 mb-1 border-t-2 border-gray-800" />
          <div className="mb-2 border-t border-gray-400" />

          {/* TOTAL */}
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-black uppercase tracking-widest text-gray-900">TOTAL</span>
            <span className="text-[26px] font-black tabular-nums text-samparka tracking-tight">
              Rs {receipt.total.toFixed(2)}
            </span>
          </div>

          <div className="mt-1 mb-2 border-t border-gray-400" />
          <div className="mb-3 border-t-2 border-gray-800" />

          {/* Payment */}
          <div className="text-[11.5px] text-gray-500 space-y-0.5">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-semibold text-gray-700">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Served by:</span>
              <span className="font-semibold text-gray-700">{receipt.cashier}</span>
            </div>
          </div>

          <div className="receipt-dash" />

          <div className="text-center text-[11px] text-gray-500 space-y-0.5">
            <p>Thank you for visiting!</p><p>Please come again!</p>
          </div>

          <div className="receipt-dash" />

          {/* Barcode */}
          <Barcode value={receipt.receiptId} />
          <p className="text-center text-[10px] text-gray-500 mt-1 tracking-widest font-bold">{receipt.receiptId}</p>

          <div className="receipt-dash" />

          {/* Verification */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 bg-samparka-light text-samparka-dark text-[10px] font-semibold px-2.5 py-1 rounded-full">
              <IShield />Cryptographically Verified
            </span>
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2.5 py-1 rounded-full">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 14h-2V8h2v8zm4 0h-2V8h2v8z"/></svg>
              Received via NFC Tap
            </span>
          </div>

          {/* Watermark */}
          <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex items-center justify-center gap-1.5">
            <span className="text-[10px] text-gray-300">Powered by</span>
            <span className="text-[10px] text-samparka font-black uppercase tracking-widest">Samparka</span>
            <span className="text-[10px] text-gray-300">· samparka.com</span>
          </div>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="p-4 space-y-3">
        <p className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Save Receipt</p>

        <button onClick={saveAsPhoto} disabled={photoLoading}
          className="w-full bg-samparka text-white py-4 font-semibold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(29,158,117,0.35)] btn-press disabled:opacity-60">
          {photoLoading ? <ISpin /> : <ICamera />} Save as Photo
        </button>

        <button onClick={saveAsPDF} disabled={pdfLoading}
          className="w-full bg-white text-samparka border-[1.5px] border-samparka py-4 font-semibold flex items-center justify-center gap-2 shadow-sm btn-press disabled:opacity-60">
          {pdfLoading ? <ISpin /> : <IPDF />} Save as PDF
        </button>

        <div className="relative">
          <button onClick={() => { setWalletTip(true); setTimeout(() => setWalletTip(false), 2500); }}
            className="w-full bg-gray-200 text-gray-400 py-4 font-semibold flex items-center justify-center gap-2 cursor-default btn-press">
            <IWallet />Save to Wallet
            <span className="ml-auto bg-gray-400 text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide">Soon</span>
          </button>
          {walletTip && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap shadow-xl z-10">
              Coming Soon — Apple Wallet &amp; Google Pay
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-gray-900" />
            </div>
          )}
        </div>

        <div className="flex justify-center pt-1">
          <button onClick={shareReceipt}
            className="inline-flex items-center gap-2 text-gray-500 text-sm font-semibold border border-gray-300 px-5 py-2.5 rounded-full btn-press hover:bg-gray-100 transition-colors">
            <IShare />Share Receipt
          </button>
        </div>
      </div>

      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
