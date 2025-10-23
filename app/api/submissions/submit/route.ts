import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getRequestMetadata, formatMetadataForDb } from '@/lib/request-logger';

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
    const { userQuery, assistantResponse, images, userEmail } = await req.json();

    if (!userQuery || !assistantResponse || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userQuery, assistantResponse, userEmail' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
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

    // Get request metadata for compliance
    const requestMetadata = await getRequestMetadata(req);
    const metadataForDb = formatMetadataForDb(requestMetadata);

    // Save submission
    const result = await sql`
      INSERT INTO user_submissions (
        user_query,
        assistant_response,
        images,
        image_count,
        user_email,
        ip_address,
        ip_hash,
        user_agent,
        country,
        city,
        region,
        referrer,
        request_id,
        status,
        created_at
      ) VALUES (
        ${userQuery},
        ${assistantResponse},
        ${JSON.stringify(images || [])},
        ${images ? images.length : 0},
        ${userEmail.toLowerCase()},
        ${metadataForDb.ip_address || null},
        ${metadataForDb.ip_hash || null},
        ${metadataForDb.user_agent || null},
        ${metadataForDb.country || null},
        ${metadataForDb.city || null},
        ${metadataForDb.region || null},
        ${metadataForDb.referrer || null},
        ${metadataForDb.request_id || null},
        ${'pending'},
        NOW()
      )
      RETURNING id
    `;

    console.log('✅ User submission saved:', result[0].id);

    return NextResponse.json({
      success: true,
      submissionId: result[0].id,
      message: 'Thank you! Your search has been submitted for review.',
    });
  } catch (error) {
    console.error('❌ Error saving submission:', error);
    return NextResponse.json(
      { error: 'Failed to save submission' },
      { status: 500 }
    );
  }
}

