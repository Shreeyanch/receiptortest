'use client';

import { useRouter } from 'next/navigation';
import ReceiptView from '@/components/ReceiptView';

export default function ReceiptModal({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={() => router.back()}
    >
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* Bottom sheet — stop propagation so clicks inside don't close */}
      <div
        className="relative w-full max-w-sm max-h-[92dvh] flex flex-col bg-[#F5F5F5] rounded-t-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'sheetUp 0.38s cubic-bezier(0.22,1,0.36,1) forwards' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle + close button */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 pt-3 pb-1">
          <div className="w-10" />
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors btn-press"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable receipt content */}
        <div className="overflow-y-auto overscroll-contain pb-8">
          <ReceiptView id={params.id} />
        </div>
      </div>
    </div>
  );
}
