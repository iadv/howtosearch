import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function addComplianceFields() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    process.exit(1);
  }

  console.log('🚀 Adding legal compliance fields to database...');
  
  const sql = neon(databaseUrl);

  try {
    // Add compliance fields to chat_logs table
    console.log('Adding fields to chat_logs...');
    
    await sql`
      ALTER TABLE chat_logs
      ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
      ADD COLUMN IF NOT EXISTS ip_hash VARCHAR(64),
      ADD COLUMN IF NOT EXISTS user_agent TEXT,
      ADD COLUMN IF NOT EXISTS country VARCHAR(2),
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS region VARCHAR(100),
      ADD COLUMN IF NOT EXISTS referrer TEXT,
      ADD COLUMN IF NOT EXISTS request_id VARCHAR(50)
    `;
    console.log('✅ Added compliance fields to chat_logs');

    // Add compliance fields to image_logs table
    console.log('Adding fields to image_logs...');
    
    await sql`
      ALTER TABLE image_logs
      ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
      ADD COLUMN IF NOT EXISTS ip_hash VARCHAR(64),
      ADD COLUMN IF NOT EXISTS user_agent TEXT,
      ADD COLUMN IF NOT EXISTS country VARCHAR(2),
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS region VARCHAR(100),
      ADD COLUMN IF NOT EXISTS referrer TEXT,
      ADD COLUMN IF NOT EXISTS request_id VARCHAR(50)
    `;
    console.log('✅ Added compliance fields to image_logs');

    // Create indexes for common queries
    console.log('Creating indexes...');
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_logs_ip_hash 
      ON chat_logs(ip_hash)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_logs_country 
      ON chat_logs(country)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_chat_logs_request_id 
      ON chat_logs(request_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_image_logs_ip_hash 
      ON image_logs(ip_hash)
    `;
    
    console.log('✅ Created indexes for compliance queries');

    // Create audit log table for legal requests
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        ip_hash VARCHAR(64),
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Created audit_logs table');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type 
      ON audit_logs(event_type)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_hash 
      ON audit_logs(ip_hash)
    `;

    console.log('\n🎉 Database schema updated successfully!');
    console.log('\n📊 New fields added:');
    console.log('   - ip_address: IPv4/IPv6 address');
    console.log('   - ip_hash: SHA-256 hash for privacy');
    console.log('   - user_agent: Browser/device info');
    console.log('   - country: ISO country code');
    console.log('   - city: City name');
    console.log('   - region: State/province');
    console.log('   - referrer: HTTP referrer');
    console.log('   - request_id: Unique request identifier');
    console.log('\n📋 New tables:');
    console.log('   - audit_logs: Track legal/compliance events');
    console.log('\n⚖️ Legal compliance: READY');
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  }
}

addComplianceFields();

