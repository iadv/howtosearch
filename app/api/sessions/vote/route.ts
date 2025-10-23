import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    return null;
  }
  return neon(databaseUrl);
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, vote } = await req.json();

    if (!sessionId || !vote || !['up', 'down'].includes(vote)) {
      return NextResponse.json(
        { error: 'Invalid request. Provide sessionId and vote (up/down)' },
        { status: 400 }
      );
    }

    const sql = getDb();
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Update score: +1 for upvote, -1 for downvote
    const scoreChange = vote === 'up' ? 1 : -1;
    
    const result = await sql`
      UPDATE sessions
      SET score = score + ${scoreChange}
      WHERE id = ${sessionId}
      RETURNING score
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      newScore: result[0].score,
    });
  } catch (error) {
    console.error('❌ Error updating vote:', error);
    return NextResponse.json(
      { error: 'Failed to update vote' },
      { status: 500 }
    );
  }
}

