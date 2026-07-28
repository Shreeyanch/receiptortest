import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  const interfaces = os.networkInterfaces();
  let lanIp = 'localhost';
  let bestScore = -1;

  for (const [name, ifaces] of Object.entries(interfaces)) {
    for (const iface of ifaces || []) {
      if (iface.family !== 'IPv4' || iface.internal) continue;
      let score = 0;
      const lower = name.toLowerCase();
      if (lower.includes('wi-fi') || lower.includes('wlan') || lower.includes('wireless')) score += 10;
      if (iface.address.startsWith('192.168.')) score += 5;
      if (score > bestScore) {
        bestScore = score;
        lanIp = iface.address;
      }
    }
  }
  return NextResponse.json({ origin: `http://${lanIp}:3000` });
}
