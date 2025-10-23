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
    const body = await req.json();
    const {
      userQuery,
      assistantResponse,
      images,
      needsImages,
      imageCount,
      sessionDuration,
      messageCount,
    } = body;

    if (!userQuery || !assistantResponse) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Get user metadata
    const ipAddress = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const country = req.geo?.country || req.headers.get('x-vercel-ip-country') || null;
    const city = req.geo?.city || req.headers.get('x-vercel-ip-city') || null;

    // Insert session
    const [session] = await sql`
      INSERT INTO sessions (
        user_query,
        assistant_response,
        images,
        needs_images,
        image_count,
        session_duration_ms,
        message_count,
        ip_address,
        country,
        city,
        created_at
      ) VALUES (
        ${userQuery},
        ${assistantResponse},
        ${JSON.stringify(images || [])},
        ${needsImages || false},
        ${imageCount || 0},
        ${sessionDuration || 0},
        ${messageCount || 1},
        ${ipAddress},
        ${country},
        ${city},
        NOW()
      )
      RETURNING id, created_at
    `;

    // Cleanup old sessions (keep only 50)
    await sql`SELECT cleanup_old_sessions()`;

    console.log('✅ Session saved:', session.id);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      createdAt: session.created_at,
    });
  } catch (error) {
    console.error('❌ Error saving session:', error);
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    );
  }
}

