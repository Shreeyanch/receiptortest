'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type ReceiptListItem } from '@/lib/dummyData';

interface ReceiptsContextType {
  receipts: ReceiptListItem[];
  setReceipts: (r: ReceiptListItem[]) => void;
  getById: (id: string) => ReceiptListItem | undefined;
}

const ReceiptsContext = createContext<ReceiptsContextType | null>(null);

export function ReceiptsProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceiptsState] = useState<ReceiptListItem[]>([]);

  const setReceipts = useCallback((r: ReceiptListItem[]) => setReceiptsState(r), []);

  const getById = useCallback(
    (id: string) => receipts.find((r) => r.receiptRef === id),
    [receipts]
  );

  return (
    <ReceiptsContext.Provider value={{ receipts, setReceipts, getById }}>
      {children}
    </ReceiptsContext.Provider>
  );
}

export function useReceipts() {
  const ctx = useContext(ReceiptsContext);
  if (!ctx) throw new Error('useReceipts must be used within ReceiptsProvider');
  return ctx;
}
