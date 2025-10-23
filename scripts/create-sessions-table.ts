import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function createSessionsTable() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log('🚀 Creating sessions table...');

    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_query TEXT NOT NULL,
        assistant_response TEXT NOT NULL,
        images JSONB DEFAULT '[]'::jsonb,
        needs_images BOOLEAN DEFAULT false,
        image_count INTEGER DEFAULT 0,
        session_duration_ms INTEGER,
        message_count INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        country TEXT,
        city TEXT
      );
    `;
    console.log('✅ Created sessions table');

    // Create index for faster queries
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);`;
    console.log('✅ Created index on sessions.created_at');

    // Create a function to auto-delete old sessions (keep only 50)
    await sql`
      CREATE OR REPLACE FUNCTION cleanup_old_sessions() 
      RETURNS void AS $$
      BEGIN
        DELETE FROM sessions 
        WHERE id IN (
          SELECT id FROM sessions 
          ORDER BY created_at DESC 
          OFFSET 50
        );
      END;
      $$ LANGUAGE plpgsql;
    `;
    console.log('✅ Created cleanup function');

    console.log('\n🎉 Sessions table created successfully!');
    console.log('\n📊 Table structure:');
    console.log('   - id: Unique identifier');
    console.log('   - user_query: The question asked');
    console.log('   - assistant_response: The AI response');
    console.log('   - images: Array of generated images (base64 or URLs)');
    console.log('   - needs_images: Whether images were generated');
    console.log('   - image_count: Number of images');
    console.log('   - session_duration_ms: How long the session lasted');
    console.log('   - message_count: Number of messages in session');
    console.log('   - created_at: Timestamp');
    console.log('   - ip_address, country, city: User metadata');
    console.log('\n🔄 Auto-cleanup: Keeps most recent 50 sessions (FIFO)');

  } catch (error) {
    console.error('❌ Error creating sessions table:', error);
    process.exit(1);
  }
}

createSessionsTable();

