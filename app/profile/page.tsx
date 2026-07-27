'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  SquarePen,
  Eye,
  EyeOff,
  Coins,
  Languages,
  MessageCircle,
  Bell,
  Download,
  LifeBuoy,
  ShieldCheck,
  FileText,
  Info,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { MY_RECEIPTS } from '@/lib/dummyData';
import { usePreferences } from '@/lib/PreferencesContext';
import { formatCurrency, getCurrencySymbol, type CurrencyCode } from '@/lib/formatCurrency';

/* ── Constants ── */
const FULL_PHONE = '+977-9812345678';
const MASKED_PHONE = '+977-98XXXXXXXX';

const CURRENCY_OPTIONS = [
  { label: 'NPR (Rs)', value: 'NPR' },
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (\u20AC)', value: 'EUR' },
  { label: 'INR (\u20B9)', value: 'INR' },
];

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: '\u0928\u0947\u092A\u093E\u0932\u0940', value: 'ne' },
];

/* ── Components ── */
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="oklch(0.52 0.11 162)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PreferencePicker({
  title,
  options,
  current,
  onSelect,
  onClose,
}: {
  title: string;
  options: { label: string; value: string }[];
  current: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg animate-sheet-up rounded-t-3xl bg-card px-5 pb-8 pt-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-muted" />
        <h3 className="mb-4 text-lg font-bold text-foreground">{title}</h3>
        <div className="space-y-1">
          {options.map((opt) => {
            const isSelected = opt.value === current;
            return (
              <button
                key={opt.value}
                onClick={() => { onSelect(opt.value); onClose(); }}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 transition-all btn-press ${
                  isSelected
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'bg-muted text-foreground hover:bg-border/40'
                }`}
              >
                <span className="text-sm">{opt.label}</span>
                {isSelected && <CheckIcon />}
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="btn-press mt-3 w-full rounded-xl py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  prefix,
  delay,
}: {
  value: string;
  label: string;
  prefix?: string;
  delay: number;
}) {
  return (
    <div
      className="animate-receipt-rise flex flex-col items-center justify-center gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card px-2 py-5 text-center shadow-[0_10px_30px_-24px_oklch(0.21_0.01_90_/_0.5)]"
      style={{ animationDelay: `${delay}s` }}
    >
      {prefix ? (
        <span className="text-[10px] font-semibold text-muted-foreground/70">{prefix}</span>
      ) : null}
      <span className="w-full truncate font-mono text-[clamp(0.75rem,4vw,1.25rem)] font-bold tabular-nums text-foreground">
        {value}
      </span>
      <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function SettingsGroup({
  title,
  delay,
  children,
}: {
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="animate-receipt-rise overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_12px_40px_-28px_oklch(0.21_0.01_90_/_0.5)]"
      style={{ animationDelay: `${delay}s` }}
    >
      <h3 className="px-5 pb-1 pt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="divide-y divide-border/60">{children}</div>
    </section>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  badge,
  mono,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  badge?: string;
  mono?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-secondary/60"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background">
        <Icon className="size-4.5 text-gray-700" strokeWidth={2} />
      </span>
      <span className="flex-1 text-sm font-semibold text-foreground">{label}</span>
      {badge ? (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
          {badge}
        </span>
      ) : null}
      {value ? (
        <span className={`text-sm text-muted-foreground ${mono ? 'font-mono tabular-nums' : ''}`}>
          {value}
        </span>
      ) : null}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" strokeWidth={2.2} />
    </button>
  );
}

/* ── Page ── */
export default function ProfilePage() {
  const { currency, setCurrency, language, setLanguage } = usePreferences();
  const [showPhone, setShowPhone] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editingPreference, setEditingPreference] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = MY_RECEIPTS.reduce((sum, r) => sum + r.amount, 0);
    const usedCategories = new Set(MY_RECEIPTS.map((r) => r.category)).size;
    return { count: MY_RECEIPTS.length, total, categories: usedCategories };
  }, []);

  const preferenceSetters: Record<string, (v: string) => void> = {
    Currency: (v) => setCurrency(v as CurrencyCode),
    Language: (v) => setLanguage(v as 'en' | 'ne'),
  };

  const preferenceValues: Record<string, string> = {
    Currency: CURRENCY_OPTIONS.find((o) => o.value === currency)?.label ?? 'NPR (Rs)',
    Language: LANGUAGE_OPTIONS.find((o) => o.value === language)?.label ?? 'English',
  };

  const activeRows = editingPreference === 'Currency' ? CURRENCY_OPTIONS : LANGUAGE_OPTIONS;

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="mx-auto flex max-w-md flex-col">
        {/* Header */}
        <header className="animate-fade-slide-down flex items-center gap-3 px-5 pb-4 pt-7">
          <Link
            href="/receipts"
            aria-label="Go back"
            className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
          >
            <ChevronLeft className="size-6" strokeWidth={2.4} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
        </header>

        <div className="flex flex-col gap-5 px-5">
          {/* Profile card */}
          <section className="animate-receipt-rise rounded-3xl border border-border/70 bg-card p-6 shadow-[0_12px_40px_-24px_oklch(0.21_0.01_90_/_0.5)]">
            <div className="flex items-center gap-4">
              <span
                className="flex size-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-primary-foreground"
                style={{ background: 'oklch(0.52 0.11 162)' }}
                aria-hidden="true"
              >
                SS
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-xl font-bold tracking-tight text-foreground">
                    Shreeyanch Shrestha
                  </h2>
                  <button
                    type="button"
                    aria-label="Edit profile"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    <SquarePen className="size-4" strokeWidth={2.2} />
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-sm tabular-nums text-foreground/80">
                    {showPhone ? FULL_PHONE : MASKED_PHONE}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPhone((v) => !v)}
                    aria-label={showPhone ? 'Hide phone number' : 'Show phone number'}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPhone ? (
                      <Eye className="size-4" strokeWidth={2.2} />
                    ) : (
                      <EyeOff className="size-4" strokeWidth={2.2} />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs font-medium text-primary">Member since March 2025</p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-3 gap-3">
            <StatCard delay={0.05} value={String(stats.count)} label="Receipts" />
            <StatCard delay={0.15} prefix={getCurrencySymbol(currency)} value={stats.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} label="Total Spent" />
            <StatCard delay={0.25} value={String(stats.categories)} label="Categories" />
          </section>

          {/* Preferences */}
          <SettingsGroup title="Preferences" delay={0.3}>
            <SettingsRow
              icon={Coins}
              label="Currency"
              value={preferenceValues.Currency}
              onClick={() => setEditingPreference('Currency')}
            />
            <SettingsRow
              icon={Languages}
              label="Language"
              value={preferenceValues.Language}
              onClick={() => setEditingPreference('Language')}
            />
          </SettingsGroup>

          {/* Account */}
          <SettingsGroup title="Account" delay={0.4}>
            <SettingsRow
              icon={MessageCircle}
              label="Linked WhatsApp"
              badge="Connected"
              value={MASKED_PHONE}
              mono
            />
            <SettingsRow icon={Bell} label="Notifications" value="Push & Email" />
            <SettingsRow icon={Download} label="Export Data" value="CSV, PDF" />
          </SettingsGroup>

          {/* Support */}
          <SettingsGroup title="Support" delay={0.5}>
            <SettingsRow icon={LifeBuoy} label="Help Center" />
            <SettingsRow icon={ShieldCheck} label="Privacy Policy" />
            <SettingsRow icon={FileText} label="Terms of Service" />
            <SettingsRow icon={Info} label="App Version" value="1.0.0" />
          </SettingsGroup>

          {/* Log out */}
          {showLogoutConfirm ? (
            <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-[0_12px_40px_-28px_oklch(0.21_0.01_90_/_0.5)]">
              <p className="mb-3 text-center text-sm font-semibold text-foreground">
                Are you sure you want to log out?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="rounded-full bg-muted px-6 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-border/60 btn-press"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/';
                  }}
                  className="rounded-full bg-destructive px-6 py-2 text-xs font-semibold text-white transition-colors hover:opacity-90 btn-press"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="mt-1 flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              <LogOut className="size-4" strokeWidth={2.4} />
              Log Out
            </button>
          )}

          <p className="pb-2 pt-1 text-center text-xs text-muted-foreground">
            Powered by <span className="font-semibold text-primary">Samparka</span>
          </p>
        </div>
      </div>

      {/* Preference Picker Modal */}
      {editingPreference && (
        <PreferencePicker
          title={editingPreference}
          options={activeRows}
          current={editingPreference === 'Currency' ? currency : language}
          onSelect={(v) => {
            preferenceSetters[editingPreference](v);
            setEditingPreference(null);
          }}
          onClose={() => setEditingPreference(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
