import ReceiptView from '@/components/ReceiptView';

export function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Your Receipt — Himalayan Coffee House` };
}

export default function ReceiptPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-sm mx-auto pb-10">
        <ReceiptView id={params.id} />
        <div className="text-center pb-4 px-4">
          <p className="text-[11px] text-gray-400">
            Powered by{' '}
            <a href="https://samparka.com" className="text-samparka font-semibold" target="_blank" rel="noreferrer">
              Samparka
            </a>
          </p>
          <p className="text-[11px] text-gray-300 mt-0.5">Paperless receipts for Nepal 🇳🇵</p>
        </div>
      </div>
    </main>
  );
}
