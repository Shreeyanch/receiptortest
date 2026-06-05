'use client';

import { useState, useMemo } from 'react';

const TAX_RATE = 0.13;
const LINE_W = 32;

interface Item {
  name: string;
  qty: number;
  unitPrice: number;
}

type PayMethod = 'Cash' | 'Card' | 'QR';
type Status = 'idle' | 'sending' | 'success' | 'error';

/* ── ESC/POS helpers ───────────────────────────────────────────── */
function padLine(left: string, right: string, w = LINE_W): string {
  const gap = w - left.length - right.length;
  return gap > 0 ? left + ' '.repeat(gap) + right : left.slice(0, w - right.length - 1) + ' ' + right;
}
function center(text: string, w = LINE_W): string {
  const pad = Math.max(0, Math.floor((w - text.length) / 2));
  return ' '.repeat(pad) + text;
}
function divider(ch = '-', w = LINE_W): string {
  return ch.repeat(w);
}

function buildEscPos(data: {
  shopName: string;
  shopAddress: string;
  items: Item[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  receiptId: string;
}): Uint8Array {
  const ESC = 0x1b;
  const GS  = 0x1d;
  const LF  = 0x0a;
  const buf: number[] = [];

  const s   = (str: string) => { for (const c of str) buf.push(c.charCodeAt(0) & 0xff); };
  const b   = (...bytes: number[]) => buf.push(...bytes);
  const ln  = (str: string) => { s(str); buf.push(LF); };
  const lf  = () => buf.push(LF);

  b(ESC, 0x40);                    // init
  b(ESC, 0x61, 0x01);              // center
  b(ESC, 0x45, 0x01);              // bold
  b(GS,  0x21, 0x10);              // double height
  ln(data.shopName.slice(0, 20).toUpperCase());
  b(GS,  0x21, 0x00);              // normal size
  b(ESC, 0x45, 0x00);              // bold off
  if (data.shopAddress) ln(data.shopAddress.slice(0, LINE_W));
  ln(new Date().toLocaleString('en-US', { hour12: true }));

  b(ESC, 0x61, 0x00);              // left
  ln(divider('='));
  b(ESC, 0x61, 0x01);              // center
  ln('RECEIPT #' + (data.receiptId || 'N/A'));
  b(ESC, 0x61, 0x00);              // left
  ln(divider('='));
  lf();

  ln(padLine('ITEM', 'QTY  AMOUNT'));
  ln(divider('-'));

  for (const item of data.items) {
    const lineTotal = item.unitPrice * item.qty;
    const name   = item.name.slice(0, 16).padEnd(16);
    const qty    = ('x' + item.qty).padStart(4);
    const amount = ('Rs ' + lineTotal.toFixed(0)).padStart(12);
    ln(name + qty + amount);
  }

  ln(divider('-'));
  ln(padLine('Subtotal:', `Rs ${data.subtotal.toFixed(2)}`));
  ln(padLine('Tax (13%):', `Rs ${data.tax.toFixed(2)}`));
  ln(divider('='));

  b(ESC, 0x45, 0x01);
  ln(padLine('TOTAL:', `Rs ${data.total.toFixed(2)}`));
  b(ESC, 0x45, 0x00);

  ln(divider('='));
  ln(padLine('Payment:', data.paymentMethod));
  lf();

  b(ESC, 0x61, 0x01);
  ln('Thank you for your visit!');
  ln('Please come again!');
  lf();
  ln('Powered by Samparka · samparka.com');
  lf(); lf(); lf();

  b(ESC, 0x69);                    // full cut

  return new Uint8Array(buf);
}

/* ── Icons ─────────────────────────────────────────────────────── */
const ITrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const ISpin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
    <path d="M21 12a9 9 0 11-6.219-8.56"/>
  </svg>
);

/* ── Component ─────────────────────────────────────────────────── */
export default function POSPage() {
  const [shopName,    setShopName]    = useState('Himalayan Coffee House');
  const [shopAddress, setShopAddress] = useState('Thamel, Kathmandu');
  const [items,       setItems]       = useState<Item[]>([]);
  const [form,        setForm]        = useState({ name: '', qty: '1', price: '' });
  const [payMethod,   setPayMethod]   = useState<PayMethod>('Cash');
  const [esp32IP,     setEsp32IP]     = useState('192.168.1.100');
  const [status,      setStatus]      = useState<Status>('idle');
  const [result,      setResult]      = useState<{ url: string; id: string } | null>(null);
  const [errMsg,      setErrMsg]      = useState('');

  const subtotal = useMemo(() => items.reduce((s, it) => s + it.unitPrice * it.qty, 0), [items]);
  const tax      = useMemo(() => Math.round(subtotal * TAX_RATE * 100) / 100, [subtotal]);
  const total    = useMemo(() => Math.round((subtotal + tax) * 100) / 100, [subtotal, tax]);

  function addItem() {
    const name      = form.name.trim();
    const qty       = Math.max(1, parseInt(form.qty)   || 1);
    const unitPrice = Math.max(0, parseFloat(form.price) || 0);
    if (!name || unitPrice <= 0) return;
    setItems(prev => [...prev, { name, qty, unitPrice }]);
    setForm({ name: '', qty: '1', price: '' });
  }

  function removeItem(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handlePrint() {
    if (items.length === 0) return;
    setStatus('sending');
    setResult(null);
    setErrMsg('');

    let receiptId  = '';
    let receiptUrl = '';

    /* 1 · POST to /api/receipts (primary) */
    try {
      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId:      'pos-virtual',
          shopName,
          shopAddress,
          shopPhone:     '',
          cashier:       'POS Terminal',
          items:         items.map(it => ({ name: it.name, qty: it.qty, price: it.unitPrice * it.qty })),
          subtotal,
          discount:      0,
          tax,
          total,
          paymentMethod: payMethod,
        }),
      });
      const json = await res.json();
      if (json.success) {
        receiptId  = json.receiptId;
        receiptUrl = json.url;
      }
    } catch (e) {
      console.error('API error:', e);
    }

    /* 2 · Try ESP32 (best-effort, fire-and-forget) */
    const escData = buildEscPos({ shopName, shopAddress, items, subtotal, tax, total, paymentMethod: payMethod, receiptId });
    fetch(`http://${esp32IP}/print`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body:    escData.buffer as ArrayBuffer,
      signal:  AbortSignal.timeout(3000),
    }).catch(() => {/* ESP32 unreachable – expected if not on local network */});

    if (receiptUrl) {
      setResult({ url: receiptUrl, id: receiptId });
      setStatus('success');
    } else {
      setErrMsg('Could not create receipt. Check your connection.');
      setStatus('error');
    }
  }

  /* Live receipt preview lines */
  const preview = useMemo(() => {
    const lines: string[] = [];
    lines.push(center(shopName.toUpperCase().slice(0, LINE_W)));
    if (shopAddress) lines.push(center(shopAddress.slice(0, LINE_W)));
    lines.push(center(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })));
    lines.push(divider('='));
    lines.push('');
    if (items.length === 0) {
      lines.push(center('No items yet'));
    } else {
      lines.push(padLine('ITEM', 'QTY  AMOUNT'));
      lines.push(divider('-'));
      for (const it of items) {
        const name   = it.name.slice(0, 16).padEnd(16);
        const qty    = ('x' + it.qty).padStart(4);
        const amount = ('Rs ' + (it.unitPrice * it.qty).toFixed(0)).padStart(12);
        lines.push(name + qty + amount);
      }
      lines.push(divider('-'));
      lines.push(padLine('Subtotal:', `Rs ${subtotal.toFixed(2)}`));
      lines.push(padLine('Tax 13%:', `Rs ${tax.toFixed(2)}`));
      lines.push(divider('='));
      lines.push(padLine('TOTAL:', `Rs ${total.toFixed(2)}`));
      lines.push(divider('='));
      lines.push(padLine('Payment:', payMethod));
      lines.push('');
      lines.push(center('Thank you!'));
      lines.push(center('Please come again!'));
    }
    lines.push('');
    lines.push(center('Powered by Samparka'));
    return lines;
  }, [shopName, shopAddress, items, subtotal, tax, total, payMethod]);

  const PAY_ICONS: Record<PayMethod, string> = { Cash: '💵', Card: '💳', QR: '📱' };

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-samparka text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-xl">🖨️</div>
        <div>
          <h1 className="font-bold text-[17px] leading-tight">Samparka Virtual POS</h1>
          <p className="text-[11px] text-white/70">ESC/POS Printer Simulator</p>
        </div>
        <a href="/" className="ml-auto text-white/70 hover:text-white text-xs border border-white/30 px-3 py-1.5 rounded-lg transition-colors">
          ← Home
        </a>
      </header>

      <div className="max-w-6xl mx-auto p-4 lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:items-start">

        {/* ── Left: Controls ── */}
        <div className="space-y-4">

          {/* Shop info */}
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Shop Info</h2>
            <input
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              placeholder="Shop name"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none focus:border-samparka focus:ring-1 focus:ring-samparka/20 transition-colors"
            />
            <input
              value={shopAddress}
              onChange={e => setShopAddress(e.target.value)}
              placeholder="Address"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-samparka focus:ring-1 focus:ring-samparka/20 transition-colors"
            />
          </section>

          {/* Add item */}
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Add Item</h2>
            <div className="grid grid-cols-[1fr_72px_100px] gap-2 mb-2">
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder="Item name"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-samparka focus:ring-1 focus:ring-samparka/20 transition-colors"
              />
              <input
                type="number"
                value={form.qty}
                onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
                min="1"
                placeholder="Qty"
                className="border border-gray-200 rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none focus:border-samparka focus:ring-1 focus:ring-samparka/20 transition-colors"
              />
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder="Unit price"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-samparka focus:ring-1 focus:ring-samparka/20 transition-colors"
              />
            </div>
            <button
              onClick={addItem}
              className="w-full bg-samparka-light text-samparka-dark py-2.5 rounded-xl text-sm font-bold btn-press hover:bg-samparka-mid transition-colors"
            >
              + Add Item
            </button>
          </section>

          {/* Items list */}
          {items.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Items ({items.length})</h2>
                <button
                  onClick={() => setItems([])}
                  className="text-[11px] text-red-400 font-semibold hover:text-red-600 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center px-4 py-3 gap-3">
                    <div className="w-7 h-7 bg-samparka-light rounded-lg flex items-center justify-center text-[10px] font-bold text-samparka-dark flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Rs {item.unitPrice.toFixed(2)} × {item.qty}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-800 tabular-nums">
                      Rs {(item.unitPrice * item.qty).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(i)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 transition-colors btn-press flex-shrink-0"
                    >
                      <ITrash />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Summary */}
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="tabular-nums">Rs {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax (13%)</span>
                <span className="tabular-nums">Rs {tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-base">
                <span className="text-gray-800">Total</span>
                <span className="text-samparka tabular-nums">Rs {total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Payment method */}
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Method</h2>
            <div className="grid grid-cols-3 gap-2">
              {(['Cash', 'Card', 'QR'] as PayMethod[]).map(m => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all btn-press ${
                    payMethod === m
                      ? 'bg-samparka text-white border-samparka shadow-[0_4px_12px_rgba(29,158,117,0.3)]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-samparka/40'
                  }`}
                >
                  <span className="block text-lg mb-0.5">{PAY_ICONS[m]}</span>
                  {m}
                </button>
              ))}
            </div>
          </section>

          {/* ESP32 IP */}
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ESP32 Printer IP</h2>
            <p className="text-[11px] text-gray-400 mb-2">
              Sends raw ESC/POS to <code className="bg-gray-100 px-1 rounded">http://[IP]/print</code>
              {' '}— requires HTTP access to local network
            </p>
            <input
              value={esp32IP}
              onChange={e => setEsp32IP(e.target.value)}
              placeholder="192.168.1.100"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-samparka focus:ring-1 focus:ring-samparka/20 transition-colors"
            />
          </section>

          {/* Print button */}
          <button
            onClick={handlePrint}
            disabled={items.length === 0 || status === 'sending'}
            className="w-full bg-samparka text-white py-5 rounded-2xl text-lg font-bold shadow-[0_4px_20px_rgba(29,158,117,0.4)] btn-press disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
          >
            {status === 'sending' ? <><ISpin /> Sending…</> : <>🖨️ Print Receipt</>}
          </button>

          {/* Success */}
          {status === 'success' && result && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 animate-slide-up">
              <p className="text-green-700 font-bold text-sm mb-1">✅ Receipt sent!</p>
              <p className="text-[11px] text-green-600 mb-2">URL:</p>
              <a
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="text-samparka text-[12px] break-all font-mono underline underline-offset-2"
              >
                {result.url}
              </a>
              <div className="mt-4 flex flex-col items-center gap-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Scan to view receipt</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=10&data=${encodeURIComponent(result.url)}`}
                  alt="Receipt QR Code"
                  className="rounded-xl shadow border border-gray-100"
                  width={180}
                  height={180}
                />
                <button
                  onClick={() => {
                    setStatus('idle');
                    setItems([]);
                    setResult(null);
                  }}
                  className="mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Start new receipt →
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-700 text-sm font-semibold">⚠️ {errMsg}</p>
            </div>
          )}
        </div>

        {/* ── Right: Receipt preview ── */}
        <div className="mt-4 lg:mt-0 lg:sticky lg:top-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Receipt Preview</p>

          {/* Paper receipt */}
          <div className="shadow-2xl rounded-sm overflow-visible">
            {/* Printer top */}
            <div className="bg-gray-700 rounded-t-lg h-4 flex items-center justify-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-samparka" />
              <div className="w-1 h-1 rounded-full bg-yellow-400" />
              <div className="w-1 h-1 rounded-full bg-red-400" />
            </div>
            <div className="bg-gray-600 h-2" />

            {/* Paper */}
            <div className="bg-white px-4 pt-4 pb-2">
              <pre className="font-receipt text-[10px] leading-[1.45] text-gray-800 overflow-x-auto whitespace-pre">
                {preview.join('\n')}
              </pre>
            </div>

            {/* Tear line */}
            <div className="bg-white px-4">
              <div className="border-t-2 border-dashed border-gray-200" />
            </div>

            {/* Printer mouth */}
            <div className="bg-gray-100 h-8 flex items-center justify-center gap-1.5 rounded-b-lg">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-gray-300" />
              ))}
            </div>
          </div>

          {/* ESC/POS info */}
          <div className="mt-4 bg-gray-800 rounded-xl p-3">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">ESC/POS Commands</p>
            <div className="space-y-1 font-mono text-[10px] text-gray-300">
              <div><span className="text-samparka">ESC @</span> — Initialize printer</div>
              <div><span className="text-samparka">ESC a 1</span> — Center align</div>
              <div><span className="text-samparka">ESC E 1</span> — Bold on</div>
              <div><span className="text-samparka">GS ! 10</span> — Double height</div>
              <div><span className="text-samparka">ESC i</span> — Full cut</div>
              <div className="pt-1 text-gray-500">→ Port 9100 / HTTP /print</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
