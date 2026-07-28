'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!loginId.trim() || !password.trim()) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: loginId.trim(), password: password.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      /* Store session */
      localStorage.setItem('samparka_auth', JSON.stringify(data));

      if (data.type === 'staff') {
        router.push('/staff');
      } else {
        router.push('/receipts');
      }
    } catch {
      setError('Login failed. Try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Store className="size-7 text-primary" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Samparka</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Login card */}
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-[0_12px_40px_-28px_oklch(0.21_0.01_90_/_0.5)]">
          <div className="space-y-4">
            {/* Login ID */}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Phone or Staff ID
              </label>
              <input
                value={loginId}
                onChange={e => { setLoginId(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="+977-9812345678 or 1212"
                className="w-full rounded-2xl bg-muted px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/15"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter password"
                className="w-full rounded-2xl bg-muted px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/15"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground btn-press transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="size-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="size-4" strokeWidth={2.4} />
                </>
              )}
            </button>
          </div>

          {/* Hints */}
          <div className="mt-5 border-t border-border/50 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-2">Demo accounts</p>
            <div className="space-y-1.5 text-[11px] text-muted-foreground/60">
              <div className="flex items-center gap-2">
                <User className="size-3" />
                <span>User: <span className="font-mono">+977-9812345678</span> / <span className="font-mono">1234</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Store className="size-3" />
                <span>Staff: <span className="font-mono">1212</span> / <span className="font-mono">1234</span></span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-muted-foreground/40">
          Powered by <span className="font-semibold text-primary">Samparka</span>
        </p>
      </div>
    </div>
  );
}
