const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkCount() {
  const sql = neon(process.env.DATABASE_URL);
  const result = await sql`SELECT COUNT(*) as count FROM sessions`;
  console.log('Total sessions in database:', result[0].count);
  
  const recent = await sql`SELECT user_query FROM sessions ORDER BY created_at DESC LIMIT 10`;
  console.log('\nMost recent 10 questions:');
  recent.forEach((s, i) => console.log(`${i+1}. ${s.user_query}`));
}

checkCount().catch(console.error);
