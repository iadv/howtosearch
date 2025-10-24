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
    console.log('📥 Received session save request');
    const body = await req.json();
    console.log('📦 Request body:', {
      hasUserQuery: !!body.userQuery,
      hasAssistantResponse: !!body.assistantResponse,
      imageCount: body.imageCount || 0,
    });
    
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
      console.error('❌ Missing required fields:', { userQuery: !!userQuery, assistantResponse: !!assistantResponse });
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
    const sessionResult = await sql`
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

    console.log('✅ Session saved:', sessionResult[0]?.id);

    // Cleanup old sessions (keep only 50) - FIFO
    await sql`
      DELETE FROM sessions
      WHERE id NOT IN (
        SELECT id
        FROM sessions
        ORDER BY created_at DESC
        LIMIT 50
      )
    `;

    return NextResponse.json({
      success: true,
      sessionId: sessionResult[0]?.id,
      createdAt: sessionResult[0]?.created_at,
    });
  } catch (error) {
    console.error('❌ Error saving session:', error);
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    );
  }
}

