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
  'Electronics':   '#3B82F6',
  'Telecom':       '#8B5CF6',
  'Entertainment': '#EC4899',
};

export const MY_RECEIPTS: ReceiptListItem[] = [
  { id: '1', shop: 'Himalayan Coffee House',   amount: 937.90,  category: 'Food & Drink',  categoryColor: '#F59E0B', time: 'Today 2:34 pm',   receiptRef: 'abc123' },
  { id: '2', shop: 'Bhat Bhateni Supermarket', amount: 2340.00, category: 'Groceries',     categoryColor: '#10B981', time: 'Today 11:20 am',  receiptRef: 'def456' },
  { id: '3', shop: 'Sastodeal',                amount: 4500.00, category: 'Electronics',   categoryColor: '#3B82F6', time: 'Yesterday',       receiptRef: 'ghi789' },
  { id: '4', shop: 'KFC Nepal',                amount: 1200.00, category: 'Food & Drink',  categoryColor: '#F59E0B', time: 'Yesterday',       receiptRef: 'jkl012' },
  { id: '5', shop: 'Ncell',                    amount: 500.00,  category: 'Telecom',       categoryColor: '#8B5CF6', time: '2 days ago',      receiptRef: 'mno345' },
  { id: '6', shop: 'Oliz Store',               amount: 890.00,  category: 'Electronics',   categoryColor: '#3B82F6', time: '3 days ago',      receiptRef: 'pqr678' },
  { id: '7', shop: 'Sherpa Cinema',            amount: 600.00,  category: 'Entertainment', categoryColor: '#EC4899', time: '4 days ago',      receiptRef: 'stu901' },
  { id: '8', shop: 'Himalayan Java',           amount: 480.00,  category: 'Food & Drink',  categoryColor: '#F59E0B', time: '5 days ago',      receiptRef: 'vwx234' },
];

export const ANALYTICS_DATA = {
  totalThisMonth: 12447.90,
  receiptCount: 8,
  categories: [
    { name: 'Electronics',   amount: 5390.00, color: '#3B82F6' },
    { name: 'Food & Drink',  amount: 2617.90, color: '#F59E0B' },
    { name: 'Groceries',     amount: 2340.00, color: '#10B981' },
    { name: 'Entertainment', amount:  600.00, color: '#EC4899' },
    { name: 'Telecom',       amount:  500.00, color: '#8B5CF6' },
  ],
  chartData: [
    { name: 'Electronics',   value: 5390 },
    { name: 'Food',          value: 2618 },
    { name: 'Groceries',     value: 2340 },
    { name: 'Entertainment', value: 600 },
    { name: 'Telecom',       value: 500 },
  ],
};
