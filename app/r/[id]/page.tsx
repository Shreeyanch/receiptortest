import ReceiptView from '@/components/ReceiptView';
import { connectDB } from '@/lib/mongodb';
import { ReceiptModel } from '@/lib/models/Receipt';
import { RECEIPT_DATA } from '@/lib/dummyData';
import type { ApiReceipt } from '@/components/ReceiptView';

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (params.id === RECEIPT_DATA.id) {
    return { title: `Your Receipt — ${RECEIPT_DATA.shopName}` };
  }
  try {
    await connectDB();
    const receipt = await ReceiptModel.findOne(
      { receiptId: params.id },
      { shopName: 1 }
    ).lean();
    if (receipt) return { title: `Your Receipt — ${receipt.shopName}` };
  } catch {
    // ignore
  }
  return { title: 'Your Receipt — Samparka' };
}

export default async function ReceiptPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  if (id === RECEIPT_DATA.id) {
    return <ReceiptPageShell id={id} receiptData={null} />;
  }

  let receiptData: ApiReceipt | null = null;
  try {
    await connectDB();
    const doc = await ReceiptModel.findOne({ receiptId: id }).lean();
    if (doc) {
      receiptData = {
        receiptId:     doc.receiptId,
        shopName:      doc.shopName,
        shopAddress:   doc.shopAddress  ?? '',
        shopPhone:     doc.shopPhone    ?? '',
        cashier:       doc.cashier      ?? '',
        items:         doc.items        ?? [],
        subtotal:      doc.subtotal     ?? 0,
        discount:      doc.discount     ?? 0,
        tax:           doc.tax          ?? 0,
        total:         doc.total        ?? 0,
        paymentMethod: doc.paymentMethod ?? 'Cash',
        createdAt:     doc.createdAt instanceof Date
          ? doc.createdAt.toISOString()
          : new Date().toISOString(),
      };
    }
  } catch {
    // DB unreachable — show not-found rather than crashing
  }

  if (!receiptData) {
    return <ReceiptNotFound />;
  }

  return <ReceiptPageShell id={id} receiptData={receiptData} />;
}

function ReceiptNotFound() {
  return (
    <main className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-xs">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">🧾</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Receipt Not Found</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          This receipt doesn&apos;t exist or may have expired. Check the link and try again.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-samparka text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-[0_4px_14px_rgba(29,158,117,0.35)] btn-press"
        >
          ← Go Home
        </a>
      </div>
      <p className="mt-8 text-[11px] text-gray-300">
        Powered by{' '}
        <a href="https://samparka.com" className="text-samparka font-semibold" target="_blank" rel="noreferrer">
          Samparka
        </a>
      </p>
    </main>
  );
}

function ReceiptPageShell({
  id,
  receiptData,
}: {
  id: string;
  receiptData: ApiReceipt | null;
}) {
  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-sm mx-auto pb-10">
        <ReceiptView id={id} receiptData={receiptData} />
        <div className="text-center pb-4 px-4">
          <p className="text-[11px] text-gray-400">
            Powered by{' '}
            <a
              href="https://samparka.com"
              className="text-samparka font-semibold"
              target="_blank"
              rel="noreferrer"
            >
              Samparka
            </a>
          </p>
          <p className="text-[11px] text-gray-300 mt-0.5">
            Paperless receipts for Nepal 🇳🇵
          </p>
        </div>
      </div>
    </main>
  );
}
