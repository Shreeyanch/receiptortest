'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function ReceiptIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#1D9E75' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="13" x2="15" y2="13"/>
      <line x1="9" y1="17" x2="12" y2="17"/>
    </svg>
  );
}

function CameraIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#1D9E75' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#1D9E75' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#1D9E75' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const [captureTooltip, setCaptureTooltip] = useState(false);
  const [settingsTooltip, setSettingsTooltip] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-lg mx-auto bg-white border-t border-gray-100 px-2 py-1 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around">

          {/* Receipts */}
          <Link href="/receipts" className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors">
            <ReceiptIcon active={pathname === '/receipts'} />
            <span className={`text-[10px] font-semibold ${pathname === '/receipts' ? 'text-samparka' : 'text-gray-400'}`}>Receipts</span>
          </Link>

          {/* Capture */}
          <div className="relative">
            <button
              onClick={() => { setCaptureTooltip(true); setTimeout(() => setCaptureTooltip(false), 2000); }}
              className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl"
            >
              <CameraIcon active={false} />
              <span className="text-[10px] font-semibold text-gray-400">Capture</span>
            </button>
            {captureTooltip && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg z-50">
                Coming soon
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
              </div>
            )}
          </div>

          {/* Analytics */}
          <Link href="/analytics" className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors">
            <ChartIcon active={pathname === '/analytics'} />
            <span className={`text-[10px] font-semibold ${pathname === '/analytics' ? 'text-samparka' : 'text-gray-400'}`}>Analytics</span>
          </Link>

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => { setSettingsTooltip(true); setTimeout(() => setSettingsTooltip(false), 2000); }}
              className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl"
            >
              <SettingsIcon active={false} />
              <span className="text-[10px] font-semibold text-gray-400">Settings</span>
            </button>
            {settingsTooltip && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg z-50">
                Coming soon
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
