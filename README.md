# Samparka — Digital Receipts

A digital receipt system for shops in Nepal. Customers scan a QR code (or tap NFC in the future) and their receipt opens instantly in the browser — no app download needed.

## What Exists Right Now

The app is a **Next.js 14** frontend with a **MongoDB** backend. It has four main pages:

### Home (`/`)
Redirects to `/receipts`. Landing page.

### My Receipts (`/receipts`)
The customer's receipt wallet. Shows a list of all receipts with:
- Monthly spending summary at the top
- Search bar to find receipts by shop name or category
- Filter tabs (All, Today, This Week, Processing, Refunded)
- Each receipt row shows shop name, time, category tag, and amount
- Tap any receipt to open it in a bottom-sheet modal

### Receipt View (`/r/[id]`)
The actual receipt — what the customer sees. A bottom-sheet modal that slides up with:
- The full receipt (shop info, items, subtotal, VAT, total, payment method)
- Barcode and verification badges
- Action buttons below the receipt:
  - **Share on WhatsApp** — sends the receipt link to a WhatsApp number
  - **Save to Wallet** — coming soon (Apple Wallet / Google Pay)
  - **Share Receipt** — native share or copy link
- **Rate Your Experience** section with 5 stars — tapping any star redirects to the shop's Google review page

### POS (`/pos`)
A virtual POS terminal for testing. You can:
- Enter shop name and address
- Add items with name, quantity, and price
- Pick a payment method (Cash, Card, QR)
- See a live receipt preview (styled like a thermal printer output)
- Hit "Print Receipt" — this creates the receipt in MongoDB and generates a QR code the customer can scan

### Analytics (`/analytics`)
Spending analytics dashboard with charts (Recharts). Currently uses dummy data.

---

## How It Will Work (Real System)

The full flow when a shop goes live:

```
Customer buys something at a shop
        |
        v
POS sends the bill to an ESP32 device (thermal printer)
        |
        v
ESP32 writes a unique receipt URL to an NFC tag
(e.g. samparka.com/r/abc123)
        |
        v
Customer taps their phone on the NFC tag
(or scans a QR code printed on the receipt)
        |
        v
Receipt opens in the browser — no app needed
        |
        v
Customer can share it on WhatsApp, save as photo/PDF,
rate the experience (redirects to Google review),
or add it to their wallet
```

The ESP32 device connects to the shop's WiFi and receives ESC/POS print commands from the POS over HTTP (port 9100). It also writes the receipt URL to a PN532 NFC module so customers can tap to access it.

---

## What I'm Working On Right Now

**UI/UX only.** The backend and ESP32 integration are secondary for now. Right now the focus is:

- Making the receipt view look polished and natural (not generic/AI-feeling)
- Improving button styling (WhatsApp share, star rating, wallet)
- Making the modal interaction feel smooth on mobile
- Getting the flow right: scan QR -> see receipt -> share/rate -> done

The data right now is mostly **dummy data** from `lib/dummyData.ts`. The MongoDB backend is connected and working (receipts can be created via the POS page), but the receipt list and analytics pages still pull from hardcoded data.

---

## What's Not Done Yet

- [ ] Customer-side flow: scan QR -> auto-load receipt in browser
- [ ] NFC tap integration (ESP32 + PN532)
- [ ] Real receipts in the receipt list (currently dummy data)
- [ ] Wallet pass generation (Apple Wallet / Google Pay)
- [ ] Analytics pulling real data from MongoDB
- [ ] Multi-shop support (each merchant gets their own Place ID, shop config)
- [ ] Receipt search/filter working with real data

---

## Setup

```bash
npm install
npm run dev
```

For phone access on the same WiFi:
```bash
npm run dev -- --hostname 0.0.0.0
```
Then open `http://<your-local-ip>:3000` on your phone.

### Environment Variables

`.env`:
```
MONGODB_URI=mongodb://localhost:27017/replicate
NEXT_PUBLIC_GOOGLE_PLACE_ID=<your-google-business-place-id>
NEXT_PUBLIC_WHATSAPP_BOT_NUMBER=<whatsapp-number-for-sharing>
```

## Test Credentials

### Customer (Normal User)
- **Phone:** `9812345678`
- **Password:** `1234`

### Staff (Cafe)
- **Staff ID:** `1212`
- **Password:** `1234`

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, MongoDB (Mongoose)
- **Charts:** Recharts
- **PDF:** jsPDF
- **Photo export:** html2canvas
