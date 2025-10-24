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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
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

    // Get the specific session
    const sessions = await sql`
      SELECT 
        id,
        user_query,
        assistant_response,
        images,
        needs_images,
        image_count,
        message_count,
        score,
        created_at,
        country,
        city
      FROM sessions
      WHERE id = ${sessionId}
    `;

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sessions[0];

    const response = NextResponse.json({
      session: {
        id: session.id,
        userQuery: session.user_query,
        assistantResponse: session.assistant_response,
        images: session.images,
        needsImages: session.needs_images,
        imageCount: session.image_count,
        messageCount: session.message_count,
        score: session.score || 250,
        createdAt: session.created_at,
        location: session.city && session.country ? `${session.city}, ${session.country}` : session.country || 'Unknown',
      },
    });

    // Prevent caching to always show latest data
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
