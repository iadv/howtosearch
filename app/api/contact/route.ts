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
    const { name, email, message } = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const sql = getDb();
    if (!sql) {
      console.error('🚨 CONTACT LOGGING SKIPPED: Database not configured');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Create contact_messages table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Insert the contact message
    await sql`
      INSERT INTO contact_messages (name, email, message)
      VALUES (${name.trim()}, ${email.trim()}, ${message.trim()})
    `;

    console.log('✅ Contact message saved to database');

    return NextResponse.json({ 
      success: true,
      message: 'Contact message received successfully'
    });
  } catch (error) {
    console.error('❌ Error saving contact message:', error);
    return NextResponse.json(
      { error: 'Failed to save contact message' },
      { status: 500 }
    );
  }
}
