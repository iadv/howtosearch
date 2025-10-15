import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function initializeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    process.exit(1);
  }

  console.log('🚀 Initializing database schema...');
  
  const sql = neon(databaseUrl);

  try {
    // Create chat_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_logs (
        id SERIAL PRIMARY KEY,
        user_message TEXT NOT NULL,
        assistant_response TEXT NOT NULL,
        needs_images BOOLEAN DEFAULT FALSE,
        image_count INTEGER DEFAULT 0,
        image_prompts JSONB,
        model VARCHAR(100),
        response_time_ms INTEGER,
        success BOOLEAN DEFAULT TRUE,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Created chat_logs table');

    // Create image_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS image_logs (
        id SERIAL PRIMARY KEY,
        prompts JSONB NOT NULL,
        results JSONB NOT NULL,
        total_time_ms INTEGER,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Created image_logs table');

    // Create indexes for better query performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at 
      ON chat_logs(created_at DESC)
    `;
    console.log('✅ Created index on chat_logs.created_at');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_logs_success 
      ON chat_logs(success)
    `;
    console.log('✅ Created index on chat_logs.success');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_image_logs_created_at 
      ON image_logs(created_at DESC)
    `;
    console.log('✅ Created index on image_logs.created_at');

    console.log('\n🎉 Database schema initialized successfully!');
    console.log('\n📊 Tables created:');
    console.log('   - chat_logs: Stores all chat interactions');
    console.log('   - image_logs: Stores all image generation requests');
    console.log('\n🔍 You can now view your logs in the Neon console or query them directly.');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();

