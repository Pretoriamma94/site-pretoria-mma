import { NextResponse } from 'next/server';
import { getActiveNewsPopup } from '@/lib/news-popup';

export const dynamic = 'force-dynamic';

export async function GET() {
  const post = await getActiveNewsPopup();
  return NextResponse.json(post, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
