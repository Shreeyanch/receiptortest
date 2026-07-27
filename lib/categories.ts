export interface CategoryRule {
  name: string;
  color: string;
  keywords: string[];
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    name: 'Coffee & Tea',
    color: '#92400e',
    keywords: ['coffee', 'cappuccino', 'latte', 'espresso', 'mocha', 'americano', 'macchiato', 'flat white', 'filter coffee', 'tea', 'masala tea', 'green tea', 'black tea', 'chai', 'cold brew', 'affogato'],
  },
  {
    name: 'Food',
    color: '#F59E0B',
    keywords: ['momo', 'pizza', 'burger', 'chowmein', 'dal bhat', 'thukpa', 'sel roti', 'samosa', 'nuggets', 'fries', 'croissant', 'sandwich', 'pasta', 'noodles', 'rice', 'biryani', 'thali', 'roti', 'naan', 'dosa', 'paratha', 'spring roll', 'momos', 'buff', 'chicken', 'mutton', 'fish', 'paneer', 'dal', 'soup', 'salad', 'steak', 'shawarma', 'kebab', 'tikka', 'masala'],
  },
  {
    name: 'Drinks',
    color: '#3B82F6',
    keywords: ['coke', 'pepsi', 'fanta', 'sprite', 'water', 'mineral water', 'juice', 'smoothie', 'lassi', 'cold drink', 'soda', 'beer', 'raksi', 'tongba', 'jand', 'energy drink', 'red bull', 'mojito', 'mocktail', 'bottled water'],
  },
  {
    name: 'Snacks & Desserts',
    color: '#EC4899',
    keywords: ['chips', 'dry meat', 'sukuti', 'chatamari', 'jerky', 'popcorn', 'chocolate', 'cake', 'pastry', 'ice cream', 'donut', 'muffin', 'biscuit', 'cookie', 'sweet', 'mithai', 'laddu', 'barfi', 'gulab jamun'],
  },
  {
    name: 'Groceries',
    color: '#10B981',
    keywords: ['milk', 'bread', 'egg', 'eggs', 'butter', 'cheese', 'yogurt', 'rice', 'dal', 'sugar', 'salt', 'oil', 'flour', 'atta', 'masala', 'spice', 'turmeric', 'cumin', 'chilli', 'onion', 'potato', 'tomato', 'vegetable', 'fruit', 'meat', 'pasta', 'noodle', 'cereal', 'oats', 'honey', 'jam', 'ketchup', 'sauce', 'vinegar', 'baking', 'flour'],
  },
  {
    name: 'Transport',
    color: '#8B5CF6',
    keywords: ['taxi', 'uber', 'pathao', 'inDrive', 'bus', 'metro', 'parking', 'fuel', 'petrol', 'diesel', 'cng', 'fare', 'ride'],
  },
  {
    name: 'Telecom',
    color: '#6366F1',
    keywords: ['ncell', 'ntc', 'data pack', 'recharge', 'top up', 'internet', 'broadband', 'wifi'],
  },
  {
    name: 'Entertainment',
    color: '#F43F5E',
    keywords: ['cinema', 'movie', 'concert', 'ticket', 'netflix', 'spotify', 'game', 'gaming', 'bowling'],
  },
  {
    name: 'Health',
    color: '#14B8A6',
    keywords: ['medicine', 'pharmacy', 'doctor', 'hospital', 'clinic', 'vitamin', 'supplement', 'bandage', 'pill', 'tablet', 'syrup'],
  },
];

const CATEGORY_COLORS: Record<string, string> = {};
CATEGORY_RULES.forEach(r => { CATEGORY_COLORS[r.name] = r.color; });

export function getCategoryColor(name: string): string {
  return CATEGORY_COLORS[name] || '#6B7280';
}

export function categorizeItem(itemName: string): string {
  const lower = itemName.toLowerCase().trim();

  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        return rule.name;
      }
    }
  }

  return 'Other';
}

export function categorizeReceipt(items: Array<{ name: string; price: number }>): { category: string; color: string } {
  const counts: Record<string, number> = {};

  for (const item of items) {
    const cat = categorizeItem(item.name);
    counts[cat] = (counts[cat] || 0) + item.price;
  }

  let best = 'Other';
  let bestAmount = 0;
  for (const [cat, amount] of Object.entries(counts)) {
    if (amount > bestAmount) {
      best = cat;
      bestAmount = amount;
    }
  }

  return { category: best, color: getCategoryColor(best) };
}
