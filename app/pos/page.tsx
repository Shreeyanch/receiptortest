'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Store, Package, Receipt, CreditCard, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { usePreferences } from '@/lib/PreferencesContext';
import { formatCurrency } from '@/lib/formatCurrency';

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
    const amount = (formatCurrency(lineTotal, 'NPR') + ' ').padStart(12);
    ln(name + qty + amount);
  }

  ln(divider('-'));
  ln(padLine('Subtotal:', formatCurrency(data.subtotal, 'NPR')));
  ln(padLine('Tax (13%):', formatCurrency(data.tax, 'NPR')));
  ln(divider('='));

  b(ESC, 0x45, 0x01);
  ln(padLine('TOTAL:', formatCurrency(data.total, 'NPR')));
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

/* ── Component ─────────────────────────────────────────────────── */
export default function POSPage() {
  const { currency, t } = usePreferences();
  const router = useRouter();
  const [shopName,    setShopName]    = useState('Himalayan Coffee House');
  const [shopAddress, setShopAddress] = useState('Thamel, Kathmandu');
  const [items,       setItems]       = useState<Item[]>([]);
  const [form,        setForm]        = useState({ name: '', qty: '1', price: '' });
  const [payMethod,   setPayMethod]   = useState<PayMethod>('Cash');
  const [esp32IP,     setEsp32IP]     = useState('192.168.1.100');
  const [status,      setStatus]      = useState<Status>('idle');
  const [errMsg,      setErrMsg]      = useState('');
  const [showEscPos,  setShowEscPos]  = useState(false);

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
    setErrMsg('');

    let receiptId  = '';

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

    if (receiptId) {
      router.push(`/r/${receiptId}`);
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
        const amount = (formatCurrency(it.unitPrice * it.qty, 'NPR') + ' ').padStart(12);
        lines.push(name + qty + amount);
      }
      lines.push(divider('-'));
      lines.push(padLine('Subtotal:', formatCurrency(subtotal, 'NPR')));
      lines.push(padLine('Tax 13%:', formatCurrency(tax, 'NPR')));
      lines.push(divider('='));
      lines.push(padLine('TOTAL:', formatCurrency(total, 'NPR')));
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
    <main className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-md flex flex-col">

        {/* ── Header ── */}
        <header className="animate-fade-slide-down flex items-center gap-3 px-5 pb-4 pt-7">
          <Link
            href="/receipts"
            aria-label="Go back"
            className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
          >
            <ChevronLeft className="size-6" strokeWidth={2.4} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Virtual POS</h1>
        </header>

        <div className="flex flex-col gap-5 px-5">

          {/* ── Shop Info ── */}
          <section className="animate-receipt-rise rounded-3xl border border-border/70 bg-card p-5 shadow-[0_12px_40px_-28px_oklch(0.21_0.01_90_/_0.5)]">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-background">
                <Store className="size-4.5 text-gray-700" strokeWidth={2} />
              </span>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Shop Info</h2>
            </div>
            <div className="space-y-2.5">
              <input
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                placeholder="Shop name"
                className="w-full rounded-2xl bg-muted px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/15"
              />
              <input
                value={shopAddress}
                onChange={e => setShopAddress(e.target.value)}
                placeholder="Address"
                className="w-full rounded-2xl bg-muted px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/15"
              />
            </div>
          </section>

          {/* ── Add Item ── */}
          <section className="animate-receipt-rise rounded-3xl border border-border/70 bg-card p-5 shadow-[0_12px_40px_-28px_oklch(0.21_0.01_90_/_0.5)]" style={{ animationDelay: '0.06s' }}>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-background">
                <Package className="size-4.5 text-gray-700" strokeWidth={2} />
              </span>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Add Item</h2>
            </div>
            <div className="space-y-2.5">
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder="Item name"
                className="w-full rounded-2xl bg-muted px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/15"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="number"
                  value={form.qty}
                  onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
                  min="1"
                  placeholder="Qty"
                  className="rounded-2xl bg-muted px-4 py-3 text-sm text-center text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/15"
                />
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addItem()}
                  placeholder="Unit price"
                  className="rounded-2xl bg-muted px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/15"
                />
              </div>
              <button
                onClick={addItem}
                className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground btn-press transition-all hover:opacity-90 active:scale-[0.98]"
              >
                + Add Item
              </button>
            </div>
          </section>

          {/* ── Items List ── */}
          {items.length > 0 && (
            <section className="animate-receipt-rise overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_12px_40px_-28px_oklch(0.21_0.01_90_/_0.5)]" style={{ animationDelay: '0.12s' }}>
              <div className="flex items-center justify-between px-5 pb-1 pt-4">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Items ({items.length})</h2>
                <button
                  onClick={() => setItems([])}
                  className="text-[11px] font-semibold text-destructive transition-colors hover:opacity-80"
                >
                  Clear all
                </button>
              </div>
              <div className="divide-y divide-border/60">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center px-5 py-3.5 gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="font-mono text-[11px] tabular-nums text-muted-foreground">{formatCurrency(item.unitPrice, 'NPR')} × {item.qty}</p>
                    </div>
                    <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                      {formatCurrency(item.unitPrice * item.qty, 'NPR')}
                    </span>
                    <button
                      onClick={() => removeItem(i)}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 btn-press"
                    >
                      <Trash2 className="size-3.5" strokeWidth={2.4} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Order Summary ── */}
          <section className="animate-receipt-rise rounded-3xl border border-border/70 bg-card p-5 shadow-[0_12px_40px_-28px_oklch(0.21_0.01_90_/_0.5)]" style={{ animationDelay: '0.18s' }}>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-background">
                <Receipt className="size-4.5 text-gray-700" strokeWidth={2} />
              </span>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Order Summary</h2>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">{formatCurrency(subtotal, 'NPR')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (13%)</span>
                <span className="font-mono tabular-nums">{formatCurrency(tax, 'NPR')}</span>
              </div>
              <div className="border-t border-border/60 pt-3 mt-1 flex justify-between">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="font-mono text-lg font-black tabular-nums text-primary">{formatCurrency(total, 'NPR')}</span>
              </div>
            </div>
          </section>

          {/* ── Payment Method ── */}
          <section className="animate-receipt-rise rounded-3xl border border-border/70 bg-card p-5 shadow-[0_12px_40px_-28px_oklch(0.21_0.01_90_/_0.5)]" style={{ animationDelay: '0.24s' }}>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-background">
                <CreditCard className="size-4.5 text-gray-700" strokeWidth={2} />
              </span>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Payment Method</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['Cash', 'Card', 'QR'] as PayMethod[]).map(m => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl text-sm font-semibold transition-all btn-press ${
                    payMethod === m
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-border/50'
                  }`}
                >
                  <span className="text-lg">{PAY_ICONS[m]}</span>
                  {m}
                </button>
              ))}
            </div>
          </section>

          {/* ── Print Receipt Button ── */}
          <button
            onClick={handlePrint}
            disabled={items.length === 0 || status === 'sending'}
            className="animate-receipt-rise w-full rounded-full bg-primary py-4 text-base font-bold text-primary-foreground btn-press disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ animationDelay: '0.3s' }}
          >
            {status === 'sending' ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Sending…
              </>
            ) : (
              <>🖨️ Print Receipt</>
            )}
          </button>

          {/* ── Error ── */}
          {status === 'error' && (
            <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-5 animate-slide-up">
              <p className="text-sm font-semibold text-destructive">⚠️ {errMsg}</p>
            </div>
          )}

          {/* ── Receipt Preview ── */}
          <section className="animate-receipt-rise" style={{ animationDelay: '0.36s' }}>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Receipt Preview</p>
            <div className="rounded-3xl border border-border/70 bg-card shadow-[0_12px_40px_-28px_oklch(0.21_0.01_90_/_0.5)] overflow-hidden">
              {/* Printer top */}
              <div className="h-4 flex items-center justify-center gap-1.5 rounded-t-3xl bg-foreground">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <div className="w-1 h-1 rounded-full bg-marigold" />
                <div className="w-1 h-1 rounded-full bg-red-400" />
              </div>
              <div className="h-2 bg-foreground/80" />

              {/* Paper */}
              <div className="bg-white px-4 pt-4 pb-2">
                <pre className="font-receipt whitespace-pre overflow-x-auto text-[10px] leading-[1.45] text-foreground">
                  {preview.join('\n')}
                </pre>
              </div>

              {/* Tear line */}
              <div className="bg-white px-4">
                <div className="border-t-2 border-dashed border-border/50" />
              </div>

              {/* Printer mouth */}
              <div className="flex items-center justify-center gap-1.5 rounded-b-3xl bg-muted h-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="h-1 w-1 rounded-full bg-border" />
                ))}
              </div>
            </div>
          </section>

          {/* ── ESP32 Printer IP ── */}
          <section className="animate-receipt-rise rounded-3xl border border-border/70 bg-card p-5 shadow-[0_12px_40px_-28px_oklch(0.21_0.01_90_/_0.5)]" style={{ animationDelay: '0.42s' }}>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-background">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                  <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
                </svg>
              </span>
              <div className="flex-1">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ESP32 Printer</h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground/60">Sends raw ESC/POS over HTTP</p>
              </div>
            </div>
            <input
              value={esp32IP}
              onChange={e => setEsp32IP(e.target.value)}
              placeholder="192.168.1.100"
              className="w-full rounded-2xl bg-muted px-4 py-3 text-sm font-mono text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/15"
            />
          </section>

          {/* ── ESC/POS Commands (collapsed, secondary) ── */}
          <section className="animate-receipt-rise rounded-3xl border border-border/40 bg-card/60 overflow-hidden" style={{ animationDelay: '0.48s' }}>
            <button
              onClick={() => setShowEscPos(v => !v)}
              className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-muted/40"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">ESC/POS Commands</span>
              {showEscPos ? (
                <ChevronUp className="size-4 text-muted-foreground/40" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground/40" />
              )}
            </button>
            {showEscPos && (
              <div className="border-t border-border/30 px-5 py-3.5 space-y-1 font-mono text-[10px] text-muted-foreground/50">
                <div><span className="text-primary/70">ESC @</span> — Initialize printer</div>
                <div><span className="text-primary/70">ESC a 1</span> — Center align</div>
                <div><span className="text-primary/70">ESC E 1</span> — Bold on</div>
                <div><span className="text-primary/70">GS ! 10</span> — Double height</div>
                <div><span className="text-primary/70">ESC i</span> — Full cut</div>
                <div className="pt-1 text-muted-foreground/30">→ Port 9100 / HTTP /print</div>
              </div>
            )}
          </section>

          <p className="pb-2 pt-1 text-center text-[10px] text-muted-foreground/40">
            <span className="sr-only">Powered by </span>Samparka
          </p>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
