import { notFound } from 'next/navigation';
import ReceiptView from '@/components/ReceiptView';
import { connectDB } from '@/lib/mongodb';
import { ReceiptModel } from '@/lib/models/Receipt';
import { RECEIPT_DATA } from '@/lib/dummyData';
import type { ApiReceipt } from '@/components/ReceiptView';

export async function generateMetadata({ params }: { params: { id: string } }) {
  // Use dummy shop name for the known dummy ID, otherwise generic title
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

  // Serve the built-in dummy receipt without hitting the DB
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
        shopAddress:   doc.shopAddress,
        shopPhone:     doc.shopPhone,
        cashier:       doc.cashier,
        items:         doc.items,
        subtotal:      doc.subtotal,
        discount:      doc.discount,
        tax:           doc.tax,
        total:         doc.total,
        paymentMethod: doc.paymentMethod,
        createdAt:     doc.createdAt.toISOString(),
      };
    }
  } catch {
    // DB unreachable — fall through to 404 rather than broken UI
  }

  if (!receiptData) notFound();

  return <ReceiptPageShell id={id} receiptData={receiptData} />;
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
