export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface Receipt {
  id: string;
  shopName: string;
  address: string;
  phone: string;
  website: string;
  date: string;
  time: string;
  cashier: string;
  receiptId: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paymentMethod: string;
}

export interface ReceiptListItem {
  id: string;
  shop: string;
  amount: number;
  category: string;
  categoryColor: string;
  time: string;
  receiptRef: string;
  createdAt: string;
  status: 'Cleared' | 'Processing' | 'Refunded';
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(Math.max(1, Math.floor(Math.random() * 28) + 1));
  d.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
  return d.toISOString();
}

export const RECEIPT_DATA: Receipt = {
  id: 'abc123',
  shopName: 'Himalayan Coffee House',
  address: 'New Road, Kathmandu, Nepal',
  phone: '+977-1-4XXXXXX',
  website: 'www.himalayancoffee.com',
  date: 'June 4, 2025',
  time: '2:34 PM',
  cashier: 'Raju',
  receiptId: 'SAM-2024-00142',
  items: [
    { name: 'Cappuccino',   qty: 2, price: 360 },
    { name: 'Croissant',    qty: 1, price: 180 },
    { name: 'Momo (8 pcs)', qty: 1, price: 220 },
    { name: 'Masala Tea',   qty: 1, price: 120 },
  ],
  subtotal: 880,
  discount: 50,
  vat: 107.90,
  total: 937.90,
  paymentMethod: 'Cash',
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Drink':  '#F59E0B',
  'Groceries':     '#10B981',
  'Shopping':      '#3B82F6',
  'Restaurants':   '#F97316',
  'Transport':     '#6366F1',
  'Utilities':     '#EAB308',
  'Entertainment': '#EC4899',
  'Health':        '#14B8A6',
  'Other':         '#8A8578',
};

export const CATEGORY_ICON_MAP: Record<string, string> = {
  'Food & Drink':  'Coffee',
  'Groceries':     'ShoppingCart',
  'Shopping':      'ShoppingBag',
  'Restaurants':   'Utensils',
  'Transport':     'Car',
  'Utilities':     'Zap',
  'Entertainment': 'Film',
  'Health':        'HeartPulse',
};

export const STATUS_COLORS: Record<string, string> = {
  Cleared:    '#10B981',
  Processing: '#EAB308',
  Refunded:   '#EF4444',
};

export const MY_RECEIPTS: ReceiptListItem[] = [
  { id: '1', shop: 'Himalayan Coffee House',     amount: 937.90,  category: 'Food & Drink',  categoryColor: '#F59E0B', time: 'Today 2:34 pm',  receiptRef: 'abc123', createdAt: monthsAgo(0), status: 'Cleared' },
  { id: '2', shop: 'Bhat Bhateni Supermarket',   amount: 2340.00, category: 'Groceries',     categoryColor: '#10B981', time: 'Today 11:20 am', receiptRef: 'def456', createdAt: monthsAgo(0), status: 'Cleared' },
  { id: '3', shop: 'Nepal Electricity Authority', amount: 1100.00, category: 'Utilities',     categoryColor: '#EAB308', time: 'Today 8:05 am',  receiptRef: 'uvw234', createdAt: monthsAgo(0), status: 'Cleared' },
  { id: '4', shop: 'Sastodeal',                  amount: 4500.00, category: 'Shopping',      categoryColor: '#3B82F6', time: 'Yesterday',      receiptRef: 'ghi789', createdAt: monthsAgo(1), status: 'Processing' },
  { id: '5', shop: 'KFC Nepal',                  amount: 1200.00, category: 'Restaurants',   categoryColor: '#F97316', time: 'Yesterday',      receiptRef: 'jkl012', createdAt: monthsAgo(1), status: 'Cleared' },
  { id: '6', shop: 'Pathao Ride',                amount: 350.00,  category: 'Transport',     categoryColor: '#6366F1', time: 'Yesterday',      receiptRef: 'mno345', createdAt: monthsAgo(1), status: 'Cleared' },
  { id: '7', shop: 'Mount Kailash Residency',    amount: 2800.00, category: 'Restaurants',   categoryColor: '#F97316', time: '3 days ago',     receiptRef: 'pqr678', createdAt: monthsAgo(3), status: 'Refunded' },
  { id: '8', shop: 'QFX Cinemas',                amount: 750.00,  category: 'Entertainment', categoryColor: '#EC4899', time: 'Today 6:30 pm', receiptRef: 'stu901', createdAt: monthsAgo(0), status: 'Processing' },
  { id: '9', shop: 'Medicity Pharmacy',          amount: 680.00,  category: 'Health',        categoryColor: '#14B8A6', time: '2 days ago',     receiptRef: 'vwx234', createdAt: monthsAgo(2), status: 'Cleared' },
  { id: '10', shop: 'Himalayan Java',            amount: 480.00,  category: 'Food & Drink',  categoryColor: '#F59E0B', time: '5 days ago',     receiptRef: 'yzx567', createdAt: monthsAgo(5), status: 'Cleared' },
];

export const ANALYTICS_DATA = {
  totalThisMonth: 12447.90,
  receiptCount: 10,
  categories: [
    { name: 'Shopping',      amount: 4500.00, color: '#3B82F6' },
    { name: 'Food & Drink',  amount: 1417.90, color: '#F59E0B' },
    { name: 'Restaurants',   amount: 4000.00, color: '#F97316' },
    { name: 'Groceries',     amount: 2340.00, color: '#10B981' },
    { name: 'Utilities',     amount: 1100.00, color: '#EAB308' },
    { name: 'Health',        amount: 680.00,  color: '#14B8A6' },
    { name: 'Entertainment', amount: 750.00,  color: '#EC4899' },
    { name: 'Transport',     amount: 350.00,  color: '#6366F1' },
  ],
  chartData: [
    { name: 'Shopping',      value: 4500 },
    { name: 'Restaurants',   value: 4000 },
    { name: 'Groceries',     value: 2340 },
    { name: 'Food & Drink',  value: 1418 },
    { name: 'Utilities',     value: 1100 },
    { name: 'Health',        value: 680 },
    { name: 'Entertainment', value: 750 },
    { name: 'Transport',     value: 350 },
  ],
};
