export interface TrendPoint {
  date: string;
  label: string;
  amount: number;
}

export interface CategoryAnalytics {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

export interface RecentTransaction {
  id: string;
  shop: string;
  amount: number;
  category: string;
  categoryColor: string;
  time: string;
  receiptRef: string;
}

function generateTrendDays(): TrendPoint[] {
  const baseValues = [
    980, 1120, 850, 1340, 980, 1520, 1430,
    1210, 1050, 1680, 1420, 1120, 980, 1350,
    1580, 1420, 1180, 1920, 1750, 1380, 1520,
    1220, 1450, 1680, 1340, 1150, 1580, 1820,
    1460, 1200,
  ];

  return baseValues.map((val, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const day = d.getDate();
    const month = d.toLocaleString('en', { month: 'short' });
    return {
      date: month + ' ' + day,
      label: '',
      amount: val,
    };
  });
}

export const TREND_DAYS = generateTrendDays();

export const MONTHLY_TOTAL = 41820;

export const CATEGORY_BREAKDOWN: CategoryAnalytics[] = [
  { name: 'Food & Drink',  amount: 12400, color: '#F59E0B', percentage: 29.6 },
  { name: 'Groceries',     amount: 9800,  color: '#10B981', percentage: 23.4 },
  { name: 'Shopping',      amount: 8500,  color: '#3B82F6', percentage: 20.3 },
  { name: 'Transport',     amount: 4200,  color: '#6366F1', percentage: 10.0 },
  { name: 'Utilities',     amount: 3600,  color: '#EAB308', percentage: 8.6 },
  { name: 'Entertainment', amount: 2400,  color: '#EC4899', percentage: 5.7 },
  { name: 'Health',        amount: 1100,  color: '#14B8A6', percentage: 2.6 },
];

export const RECENT_TRANSACTIONS: RecentTransaction[] = [
  { id: '1', shop: 'Himalayan Coffee House',     amount: 937.90,  category: 'Food & Drink',  categoryColor: '#F59E0B', time: 'Today 2:34 pm',  receiptRef: 'abc123' },
  { id: '2', shop: 'Bhat Bhateni Supermarket',   amount: 2340.00, category: 'Groceries',     categoryColor: '#10B981', time: 'Today 11:20 am', receiptRef: 'def456' },
  { id: '3', shop: 'Sastodeal',                  amount: 4500.00, category: 'Shopping',      categoryColor: '#3B82F6', time: 'Yesterday',      receiptRef: 'ghi789' },
  { id: '4', shop: 'KFC Nepal',                  amount: 1200.00, category: 'Restaurants',   categoryColor: '#F97316', time: 'Yesterday',      receiptRef: 'jkl012' },
  { id: '5', shop: 'Pathao Ride',                amount: 350.00,  category: 'Transport',     categoryColor: '#6366F1', time: 'Yesterday',      receiptRef: 'mno345' },
];

export const PREV_MONTH_TOTAL = 37200;
