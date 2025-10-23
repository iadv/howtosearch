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

export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get the 50 most recent sessions
    const sessions = await sql`
      SELECT 
        id,
        user_query,
        assistant_response,
        images,
        needs_images,
        image_count,
        message_count,
        created_at,
        country,
        city
      FROM sessions
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const response = NextResponse.json({
      sessions: sessions.map(s => ({
        id: s.id,
        userQuery: s.user_query,
        assistantResponse: s.assistant_response,
        images: s.images,
        needsImages: s.needs_images,
        imageCount: s.image_count,
        messageCount: s.message_count,
        createdAt: s.created_at,
        location: s.city && s.country ? `${s.city}, ${s.country}` : s.country || 'Unknown',
      })),
    });

    // Prevent caching to always show latest data
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

