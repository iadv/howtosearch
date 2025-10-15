import { NextRequest, NextResponse } from 'next/server';
import { getAnalytics, getRecentChats } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'stats';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (type === 'recent') {
      const chats = await getRecentChats(limit);
      return NextResponse.json({ chats });
    }

    if (type === 'stats') {
      const analytics = await getAnalytics();
      return NextResponse.json(analytics);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

