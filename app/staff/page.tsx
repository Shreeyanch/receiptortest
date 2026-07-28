'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store, LogOut, Plus, X, Trash2, Check, ChevronDown, ChevronUp, TrendingUp,
  Pencil, AlertTriangle,
} from 'lucide-react';
import { usePreferences } from '@/lib/PreferencesContext';
import { formatCurrency } from '@/lib/formatCurrency';

const TAX_RATE = 0.13;

interface StaffSession {
  type: 'staff';
  staff: { staffId: string; name: string };
  restaurant: { id: string; name: string; location: string };
}

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  _id: string;
  tableNumber: number;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'open' | 'paid';
  staffId: string;
  staffName: string;
  receiptId?: string;
  createdAt: string;
}

type Tab = 'open' | 'paid';
type SalesRange = 'today' | 'yesterday' | 'week' | 'month';

function startOfDay(d: Date) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}

function isToday(d: Date) {
  const now = new Date();
  return startOfDay(d).getTime() === startOfDay(now).getTime();
}

function isYesterday(d: Date) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return startOfDay(d).getTime() === startOfDay(yesterday).getTime();
}

function isThisWeek(d: Date) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return d >= weekStart;
}

function isThisMonth(d: Date) {
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function StaffDashboard() {
  const { currency } = usePreferences();
  const router = useRouter();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<Tab>('open');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ── New order form state ── */
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemPrice, setItemPrice] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  /* ── Expanded order ── */
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  /* ── QR popup ── */
  const [qrOrder, setQrOrder] = useState<Order | null>(null);
  const [lanOrigin, setLanOrigin] = useState('');

  /* ── Fetch LAN origin for QR ── */
  useEffect(() => {
    fetch('/api/host').then(r => r.json()).then(d => {
      if (d.origin) setLanOrigin(d.origin);
    }).catch(() => {});
  }, []);

  /* ── Edit order ── */
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editTableNumber, setEditTableNumber] = useState('');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [editItemName, setEditItemName] = useState('');
  const [editItemQty, setEditItemQty] = useState('1');
  const [editItemPrice, setEditItemPrice] = useState('');

  /* ── Delete confirmation ── */
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

  /* ── Auth check ── */
  useEffect(() => {
    const raw = localStorage.getItem('samparka_auth');
    if (!raw) { router.push('/login'); return; }
    try {
      const data = JSON.parse(raw);
      if (data.type !== 'staff') { router.push('/receipts'); return; }
      setSession(data);
    } catch { router.push('/login'); }
  }, [router]);

  /* ── Fetch orders ── */
  const fetchOrders = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/orders?restaurantId=${session.restaurant.id}`);
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch { /* ignore */ }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (session) fetchOrders();
  }, [session, fetchOrders]);

  /* ── Sales summary ── */
  const sales = useMemo(() => {
    const paid = orders.filter(o => o.status === 'paid');
    const sum = (list: Order[]) => list.reduce((s, o) => s + o.total, 0);
    return {
      today: sum(paid.filter(o => isToday(new Date(o.createdAt)))),
      yesterday: sum(paid.filter(o => isYesterday(new Date(o.createdAt)))),
      week: sum(paid.filter(o => isThisWeek(new Date(o.createdAt)))),
      month: sum(paid.filter(o => isThisMonth(new Date(o.createdAt)))),
    };
  }, [orders]);

  /* ── Add item to form ── */
  function addItem() {
    const name = itemName.trim();
    const qty = Math.max(1, parseInt(itemQty) || 1);
    const price = Math.max(0, parseFloat(itemPrice) || 0);
    if (!name || price <= 0) return;
    setOrderItems(prev => [...prev, { name, qty, price }]);
    setItemName('');
    setItemQty('1');
    setItemPrice('');
  }

  function removeItem(i: number) {
    setOrderItems(prev => prev.filter((_, idx) => idx !== i));
  }

  /* ── Create order ── */
  async function createOrder() {
    if (!session || !tableNumber.trim() || orderItems.length === 0) return;
    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: session.restaurant.id,
          restaurantName: session.restaurant.name,
          tableNumber: parseInt(tableNumber) || 0,
          customerName: customerName.trim(),
          items: orderItems,
          staffId: session.staff.staffId,
          staffName: session.staff.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewOrder(false);
        setTableNumber('');
        setCustomerName('');
        setOrderItems([]);
        fetchOrders();
      } else {
        setCreateError(data.error || 'Failed to create order');
      }
    } catch { setCreateError('Failed to create order'); }
    setCreating(false);
  }

  /* ── Mark as paid ── */
  async function markAsPaid(orderId: string) {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });
      fetchOrders();
    } catch { /* ignore */ }
  }

  /* ── Delete order ── */
  async function deleteOrder(orderId: string) {
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      setDeletingOrder(null);
      setExpandedOrder(null);
      fetchOrders();
    } catch { /* ignore */ }
  }

  /* ── Open edit sheet ── */
  function openEditSheet(order: Order) {
    setEditingOrder(order);
    setEditTableNumber(String(order.tableNumber));
    setEditCustomerName(order.customerName);
    setEditItems([...order.items]);
    setEditItemName('');
    setEditItemQty('1');
    setEditItemPrice('');
  }

  function addEditItem() {
    const name = editItemName.trim();
    const qty = Math.max(1, parseInt(editItemQty) || 1);
    const price = Math.max(0, parseFloat(editItemPrice) || 0);
    if (!name || price <= 0) return;
    setEditItems(prev => [...prev, { name, qty, price }]);
    setEditItemName('');
    setEditItemQty('1');
    setEditItemPrice('');
  }

  function removeEditItem(i: number) {
    setEditItems(prev => prev.filter((_, idx) => idx !== i));
  }

  /* ── Save edit ── */
  async function saveEdit() {
    if (!editingOrder || !editTableNumber.trim() || editItems.length === 0) return;
    try {
      await fetch(`/api/orders/${editingOrder._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: parseInt(editTableNumber) || 0,
          customerName: editCustomerName.trim(),
          items: editItems,
        }),
      });
      setEditingOrder(null);
      setExpandedOrder(null);
      fetchOrders();
    } catch { /* ignore */ }
  }

  const filtered = orders.filter(o => o.status === tab);
  const openCount = orders.filter(o => o.status === 'open').length;

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-md flex flex-col">
        {/* Header */}
        <header className="animate-fade-slide-down flex items-center justify-between px-5 pb-4 pt-7">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Store className="size-5 text-primary" strokeWidth={2} />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{session.restaurant.name}</h1>
              <p className="text-xs text-muted-foreground">{session.staff.name}</p>
            </div>
          </div>
          <button
            onClick={() => { localStorage.removeItem('samparka_auth'); router.push('/login'); }}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
          >
            <LogOut className="size-5" strokeWidth={2} />
          </button>
        </header>

        <div className="flex flex-col gap-5 px-5">

          {/* ── Sales Summary ── */}
          <section className="animate-receipt-rise rounded-3xl border border-border/70 bg-card p-5 shadow-[0_12px_40px_-28px_oklch(0.21_0.01_90_/_0.5)]">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" strokeWidth={2} />
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sales</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: 'Today', value: sales.today },
                { label: 'Yesterday', value: sales.yesterday },
                { label: 'This Week', value: sales.week },
                { label: 'This Month', value: sales.month },
              ] as { label: string; value: number }[]).map(s => (
                <div key={s.label} className="rounded-2xl bg-muted px-3.5 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{s.label}</p>
                  <p className="mt-0.5 font-mono text-sm font-black tabular-nums text-foreground">{formatCurrency(s.value, currency)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* New Order Button */}
          {!showNewOrder && (
            <button
              onClick={() => setShowNewOrder(true)}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground btn-press transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Plus className="size-4" strokeWidth={2.4} />
              New Order
            </button>
          )}

          {/* New Order Form */}
          {showNewOrder && (
            <section className="animate-receipt-rise rounded-3xl border border-border/70 bg-card p-5 shadow-[0_12px_40px_-28px_oklch(0.21_0.01_90_/_0.5)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">New Order</h2>
                <button onClick={() => { setShowNewOrder(false); setOrderItems([]); }} className="text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Table #</label>
                    <input
                      type="number"
                      value={tableNumber}
                      onChange={e => { setTableNumber(e.target.value); setCreateError(''); }}
                      placeholder="1"
                      className="w-full rounded-2xl bg-muted px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Customer (optional)</label>
                    <input
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Name"
                      className="w-full rounded-2xl bg-muted px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/15"
                    />
                  </div>
                </div>

                {/* Add item row */}
                <div className="rounded-2xl bg-muted p-3 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Add Item</label>
                  <input
                    value={itemName}
                    onChange={e => setItemName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                    placeholder="Item name"
                    className="w-full rounded-xl bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/15"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={itemQty}
                      onChange={e => setItemQty(e.target.value)}
                      min="1"
                      placeholder="Qty"
                      className="rounded-xl bg-card px-3 py-2 text-sm text-center text-foreground outline-none focus:ring-2 focus:ring-ring/15"
                    />
                    <input
                      type="number"
                      value={itemPrice}
                      onChange={e => setItemPrice(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addItem()}
                      placeholder="Price"
                      className="rounded-xl bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/15"
                    />
                  </div>
                  <button
                    onClick={addItem}
                    className="w-full rounded-full bg-primary/10 py-2 text-xs font-bold text-primary btn-press hover:bg-primary/20 transition-colors"
                  >
                    + Add
                  </button>
                </div>

                {/* Items in order */}
                {orderItems.length > 0 && (
                  <div className="space-y-1.5">
                    {orderItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-card px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary">{item.qty}×</span>
                          <span className="text-sm text-foreground">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">{formatCurrency(item.price * item.qty, currency)}</span>
                          <button onClick={() => removeItem(i)} className="text-destructive/60 hover:text-destructive">
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1 text-sm">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="font-mono font-bold text-primary">
                        {formatCurrency(
                          orderItems.reduce((s, it) => s + it.price * it.qty, 0) * (1 + TAX_RATE),
                          currency
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {createError && (
                  <p className="text-sm font-medium text-destructive">{createError}</p>
                )}

                <button
                  onClick={createOrder}
                  disabled={!tableNumber.trim() || orderItems.length === 0 || creating}
                  className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground btn-press transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>Create Order</>
                  )}
                </button>
              </div>
            </section>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            {(['open', 'paid'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all btn-press ${
                  tab === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {t === 'open' ? `Open (${openCount})` : 'Paid'}
              </button>
            ))}
          </div>

          {/* Orders list */}
          {loading ? (
            <div className="py-10 text-center">
              <div className="mx-auto size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">No {tab} orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(order => {
                const isExpanded = expandedOrder === order._id;
                return (
                  <div key={order._id} className="animate-receipt-rise rounded-3xl border border-border/70 bg-card shadow-[0_12px_40px_-28px_oklch(0.21_0.01_90_/_0.5)] overflow-hidden">
                    {/* Order header */}
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-bold text-primary">
                          {order.tableNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">
                              Table {order.tableNumber}
                              {order.customerName && <span className="font-normal text-muted-foreground"> · {order.customerName}</span>}
                            </p>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                              order.status === 'open'
                                ? 'bg-warning/12 text-warning'
                                : 'bg-success/12 text-success'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {formatCurrency(order.total, currency)}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-border/50 px-4 pb-4 pt-3">
                        <div className="space-y-1.5">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-foreground">
                                <span className="font-bold text-primary">{item.qty}×</span> {item.name}
                              </span>
                              <span className="font-mono font-bold text-foreground">{formatCurrency(item.price * item.qty, currency)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 space-y-1 border-t border-border/50 pt-3 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span className="font-mono">{formatCurrency(order.subtotal, currency)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Tax (13%)</span>
                            <span className="font-mono">{formatCurrency(order.tax, currency)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-foreground">
                            <span>Total</span>
                            <span className="font-mono text-primary">{formatCurrency(order.total, currency)}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground/50">
                          <span>By {order.staffName}</span>
                          <span>{new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {order.status === 'open' && (
                          <button
                            onClick={() => markAsPaid(order._id)}
                            className="mt-3 w-full rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground btn-press transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                          >
                            <Check className="size-4" strokeWidth={2.4} />
                            Mark as Paid
                          </button>
                        )}
                        {order.status === 'open' && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => openEditSheet(order)}
                              className="flex-1 rounded-full bg-muted py-2.5 text-xs font-bold text-muted-foreground btn-press transition-all hover:bg-border/50 active:scale-[0.98] flex items-center justify-center gap-1.5"
                            >
                              <Pencil className="size-3.5" strokeWidth={2.4} />
                              Edit
                            </button>
                            <button
                              onClick={() => setDeletingOrder(order)}
                              className="flex-1 rounded-full bg-destructive/8 py-2.5 text-xs font-bold text-destructive btn-press transition-all hover:bg-destructive/15 active:scale-[0.98] flex items-center justify-center gap-1.5"
                            >
                              <Trash2 className="size-3.5" strokeWidth={2.4} />
                              Delete
                            </button>
                          </div>
                        )}
                        {order.status === 'paid' && order.receiptId && (
                          <button
                            onClick={() => setQrOrder(order)}
                            className="mt-3 w-full rounded-full bg-muted py-2.5 text-sm font-bold text-foreground btn-press transition-all hover:bg-border/50 active:scale-[0.98] flex items-center justify-center gap-2"
                          >
                            📱 Show QR
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <p className="pb-2 pt-1 text-center text-[10px] text-muted-foreground/40">
            <span className="sr-only">Powered by </span>Samparka
          </p>
        </div>
      </div>

      {/* ── QR Popup ── */}
      {qrOrder && qrOrder.receiptId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setQrOrder(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md animate-sheet-up rounded-t-3xl bg-card px-5 pb-8 pt-5 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted" />
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Scan to view bill</p>
              <p className="text-lg font-bold text-foreground">Table {qrOrder.tableNumber}{qrOrder.customerName ? ` · ${qrOrder.customerName}` : ''}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(`${lanOrigin || (typeof window !== 'undefined' ? window.location.origin : '')}/r/${qrOrder.receiptId}`)}`}
                alt="Bill QR Code"
                className="mx-auto mt-4 rounded-2xl border border-border/50"
                width={200}
                height={200}
              />
              <p className="mt-3 font-mono text-xs text-muted-foreground">{qrOrder.receiptId}</p>
              <p className="mt-1 font-mono text-sm font-bold text-primary">{formatCurrency(qrOrder.total, currency)}</p>
              <button
                onClick={() => setQrOrder(null)}
                className="mt-4 w-full rounded-full bg-muted py-2.5 text-sm font-semibold text-muted-foreground btn-press hover:bg-border/50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setDeletingOrder(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md animate-sheet-up rounded-t-3xl bg-card px-5 pb-8 pt-5 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted" />
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-6 text-destructive" />
              </div>
              <p className="text-base font-bold text-foreground">Delete Order?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Table {deletingOrder.tableNumber} · {deletingOrder.items.length} item{deletingOrder.items.length !== 1 ? 's' : ''} · {formatCurrency(deletingOrder.total, currency)}
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setDeletingOrder(null)}
                  className="flex-1 rounded-full bg-muted py-2.5 text-sm font-semibold text-muted-foreground btn-press hover:bg-border/50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteOrder(deletingOrder._id)}
                  className="flex-1 rounded-full bg-destructive py-2.5 text-sm font-bold text-white btn-press transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Order Sheet ── */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setEditingOrder(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md animate-sheet-up rounded-t-3xl bg-card px-5 pb-8 pt-5 shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Edit Order</h2>
              <button onClick={() => setEditingOrder(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Table #</label>
                  <input
                    type="number"
                    value={editTableNumber}
                    onChange={e => setEditTableNumber(e.target.value)}
                    placeholder="1"
                    className="w-full rounded-2xl bg-muted px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/15"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Customer</label>
                  <input
                    value={editCustomerName}
                    onChange={e => setEditCustomerName(e.target.value)}
                    placeholder="Name"
                    className="w-full rounded-2xl bg-muted px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/15"
                  />
                </div>
              </div>

              {/* Current items */}
              <div className="space-y-1.5">
                {editItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">{item.qty}×</span>
                      <span className="text-sm text-foreground">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">{formatCurrency(item.price * item.qty, currency)}</span>
                      <button onClick={() => removeEditItem(i)} className="text-destructive/60 hover:text-destructive">
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add item */}
              <div className="rounded-2xl bg-muted p-3 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Add Item</label>
                <input
                  value={editItemName}
                  onChange={e => setEditItemName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addEditItem()}
                  placeholder="Item name"
                  className="w-full rounded-xl bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/15"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={editItemQty}
                    onChange={e => setEditItemQty(e.target.value)}
                    min="1"
                    placeholder="Qty"
                    className="rounded-xl bg-card px-3 py-2 text-sm text-center text-foreground outline-none focus:ring-2 focus:ring-ring/15"
                  />
                  <input
                    type="number"
                    value={editItemPrice}
                    onChange={e => setEditItemPrice(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addEditItem()}
                    placeholder="Price"
                    className="rounded-xl bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/15"
                  />
                </div>
                <button
                  onClick={addEditItem}
                  className="w-full rounded-full bg-primary/10 py-2 text-xs font-bold text-primary btn-press hover:bg-primary/20 transition-colors"
                >
                  + Add
                </button>
              </div>

              {/* Totals */}
              {editItems.length > 0 && (
                <div className="pt-1 text-sm">
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Total</span>
                    <span className="font-mono text-primary">
                      {formatCurrency(editItems.reduce((s, it) => s + it.price * it.qty, 0) * (1 + TAX_RATE), currency)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={saveEdit}
                disabled={!editTableNumber.trim() || editItems.length === 0}
                className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground btn-press transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
