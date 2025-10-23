import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function addVotingAndSubmissions() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(databaseUrl);

  try {
    console.log('🚀 Adding voting and submissions features...\n');

    // Add score column to sessions table with random values 100-500
    console.log('1️⃣ Adding score column to sessions...');
    await sql`
      ALTER TABLE sessions 
      ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 250
    `;
    
    // Initialize existing sessions with random scores between 100-500
    console.log('2️⃣ Initializing random scores for existing sessions...');
    await sql`
      UPDATE sessions 
      SET score = FLOOR(100 + RANDOM() * 400)::INTEGER
      WHERE score = 250
    `;
    
    console.log('✅ Voting system added\n');

    // Create user_submissions table
    console.log('3️⃣ Creating user_submissions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_query TEXT NOT NULL,
        assistant_response TEXT NOT NULL,
        images JSONB,
        image_count INTEGER,
        user_email TEXT NOT NULL,
        ip_address TEXT,
        ip_hash TEXT,
        user_agent TEXT,
        country TEXT,
        city TEXT,
        region TEXT,
        referrer TEXT,
        request_id TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_user_submissions_created_at ON user_submissions(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_submissions_status ON user_submissions(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_submissions_email ON user_submissions(user_email)`;
    
    console.log('✅ User submissions table created\n');

    console.log('🎉 All features added successfully!\n');
    console.log('📊 Features:');
    console.log('   - Sessions now have score field (100-500)');
    console.log('   - User submissions table created');
    console.log('   - Ready for voting and submission features');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

addVotingAndSubmissions();

