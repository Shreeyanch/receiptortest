# Samparka — Digital Receipts for Nepal

Tap NFC → See your receipt instantly. No app needed.

## Pages

| Route | Description |
|-------|-------------|
| `/r/[id]` | Receipt page — what customers see after NFC tap |
| `/receipts` | My Receipts dashboard |
| `/analytics` | Spending analytics |

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/receipts`.

Demo receipt: [http://localhost:3000/r/abc123](http://localhost:3000/r/abc123)

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

## Deploy to Vercel

```bash
npx vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) — zero config needed.

## Tech stack

- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript
- html2canvas — Save as Photo
- jsPDF — Save as PDF
- Recharts — Analytics charts

## How the real system works

1. Shop has an ESP32 device connected to WiFi
2. POS sends ESC/POS print commands to ESP32 on port 9100
3. ESP32 parses the receipt data and generates a unique ID
4. ESP32 writes `samparka.com/r/<id>` to the PN532 NFC module
5. Customer taps phone — receipt page opens instantly in browser
