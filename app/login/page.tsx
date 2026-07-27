'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

/**
 * Magic Link Login Page
 *
 * Visited at /login?token=XYZ123
 * Validates the WhatsApp session token and logs the user in.
 * For now this simulates a login — in production you'd set a session cookie,
 * JWT, or similar.
 */

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'validating' | 'success' | 'error'>(
    'validating'
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    // Validate the session token via the API
    fetch(`/api/whatsapp/session?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.session) {
          setStatus('success');
          // Store the session in localStorage for now
          localStorage.setItem('samparka_session', token);
          if (data.session.phoneNumber) {
            setPhoneNumber(data.session.phoneNumber);
          } else {
            // No phone linked yet — offer to let them enter it
            setShowPhoneInput(true);
          }
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  }, [token]);

  async function linkPhone() {
    if (!phoneNumber.trim() || !token) return;

    try {
      const res = await fetch('/api/whatsapp/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, phoneNumber: phoneNumber.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPhoneInput(false);
        localStorage.setItem('samparka_phone', phoneNumber.trim());
      }
    } catch {
      // ignore
    }
  }

  if (status === 'validating') {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
        <div className="w-12 h-12 border-4 border-pine/30 border-t-pine rounded-full animate-spin mb-4" />
        <p className="text-ash text-sm font-medium">
          Validating your session...
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-xl font-bold text-ink mb-2">
            Invalid or Expired Link
          </h1>
          <p className="text-sm text-ash leading-relaxed mb-6">
            This magic link is invalid or has expired. Open WhatsApp and ask the
            Samparka bot for a new link.
          </p>
          <button
            onClick={() => router.push('/receipts')}
            className="bg-pine text-white px-6 py-3 rounded-2xl text-sm font-semibold btn-press"
          >
            ← Go to Receipts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-xs">
        <div className="w-16 h-16 bg-pine/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="text-xl font-bold text-ink mb-2">
          You&apos;re Logged In!
        </h1>
        {phoneNumber && (
          <p className="text-sm text-ash mb-1">
            Connected via <span className="font-semibold">{phoneNumber}</span>
          </p>
        )}
        <p className="text-sm text-ash leading-relaxed mb-6">
          Your receipts are now linked to your phone number.
        </p>

        {showPhoneInput && (
          <div className="mb-6 space-y-2">
            <p className="text-xs text-ash font-medium">
              Enter your phone number to link your receipts:
            </p>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="+977 98XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 text-sm border border-ash/10 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pine/30 focus:border-pine"
              />
              <button
                onClick={linkPhone}
                className="bg-pine text-white px-4 py-2.5 rounded-xl text-sm font-semibold btn-press"
              >
                Link
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push('/receipts')}
          className="bg-pine text-white px-8 py-3.5 rounded-2xl text-sm font-semibold btn-press hover:bg-pine-dark transition-colors"
        >
          View My Receipts →
        </button>
      </div>

      <p className="mt-8 text-[11px] text-ash/40">
        Powered by{' '}
        <span className="text-pine font-semibold">Samparka</span>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-pine/30 border-t-pine rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
