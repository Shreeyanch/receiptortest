'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, FilePlus, BarChart3, User, ScanQrCode, type LucideIcon } from 'lucide-react';

function handleScan() {
  if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.style.cssText =
          'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;object-fit:cover;background:#000';

        const overlay = document.createElement('div');
        overlay.style.cssText =
          'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none';

        const scanFrame = document.createElement('div');
        scanFrame.style.cssText =
          'width:240px;height:240px;border:3px solid oklch(0.52 0.11 162);border-radius:16px;box-shadow:0 0 0 9999px rgba(0,0,0,0.5)';

        const hint = document.createElement('p');
        hint.textContent = 'Point at a QR code';
        hint.style.cssText =
          'color:white;font-family:var(--font-geist-sans),sans-serif;font-size:14px;margin-top:24px;text-shadow:0 1px 4px rgba(0,0,0,0.6);pointer-events:none';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '\u2715';
        closeBtn.style.cssText =
          'position:absolute;top:48px;right:24px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.2);color:white;border:none;font-size:20px;cursor:pointer;pointer-events:auto;backdrop-filter:blur(8px)';

        const stopStream = () => {
          stream.getTracks().forEach((t) => t.stop());
          video.remove();
          overlay.remove();
          document.body.style.overflow = '';
        };

        closeBtn.onclick = stopStream;

        overlay.appendChild(scanFrame);
        overlay.appendChild(hint);
        overlay.appendChild(closeBtn);

        document.body.style.overflow = 'hidden';
        document.body.appendChild(video);
        document.body.appendChild(overlay);
      })
      .catch(() => {
        window.location.href = '/pos';
      });
  } else {
    window.location.href = '/pos';
  }
}

const items: { key: string; label: string; icon: LucideIcon; href: string }[] = [
  { key: 'home', label: 'Home', icon: Home, href: '/receipts' },
  { key: 'add', label: 'Add', icon: FilePlus, href: '/pos' },
  { key: 'stats', label: 'Insights', icon: BarChart3, href: '/analytics' },
  { key: 'profile', label: 'Profile', icon: User, href: '/profile' },
];

function pathToKey(pathname: string): string {
  if (pathname.startsWith('/receipts')) return 'home';
  if (pathname.startsWith('/pos')) return 'add';
  if (pathname.startsWith('/analytics')) return 'stats';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'home';
}

function NavButton({
  item,
  active,
  onSelect,
}: {
  item: (typeof items)[number];
  active: string;
  onSelect: (href: string) => void;
}) {
  const Icon = item.icon;
  const isActive = active === item.key;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.href)}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
      className={`relative flex h-11 flex-col items-center justify-center rounded-full px-4 transition-colors duration-300 ${
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon
        className={`size-5 transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`}
        strokeWidth={isActive ? 2.4 : 2}
      />
      <span
        className={`mt-0.5 text-[10px] font-semibold tracking-wide transition-all duration-300 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {item.label}
      </span>
    </button>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const active = pathToKey(pathname);

  const handleSelect = (href: string) => {
    router.push(href);
  };

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md justify-center pb-5"
      aria-label="Main navigation"
    >
      <div className="pointer-events-auto relative flex items-center gap-1 rounded-full border border-border/70 bg-card/85 px-2.5 py-2 shadow-[0_18px_45px_-18px_oklch(0.21_0.01_90_/_0.55)] backdrop-blur-xl">
        {items.slice(0, 2).map((item) => (
          <NavButton key={item.key} item={item} active={active} onSelect={handleSelect} />
        ))}

        {/* Center QR scan button */}
        <button
          type="button"
          onClick={handleScan}
          aria-label="Scan a receipt QR code"
          className="group relative mx-1 flex size-14 -translate-y-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_30px_-8px_oklch(0.52_0.11_162_/_0.7)] transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <span className="absolute inset-0 animate-pulse-ring rounded-full" />
          <ScanQrCode className="size-6 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.25} />
        </button>

        {items.slice(2).map((item) => (
          <NavButton key={item.key} item={item} active={active} onSelect={handleSelect} />
        ))}
      </div>
    </nav>
  );
}
