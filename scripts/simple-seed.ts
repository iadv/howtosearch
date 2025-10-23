import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';
import seedData from './seed-data.json';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const LOCATIONS = [
  'San Francisco, US',
  'New York, US',
  'London, UK',
  'Tokyo, JP',
  'Berlin, DE',
  'Paris, FR',
  'Sydney, AU',
  'Toronto, CA',
  'Singapore, SG',
  'Dubai, AE',
  'Mumbai, IN',
  'Seoul, KR',
  'Barcelona, ES',
  'Amsterdam, NL',
  'Stockholm, SE',
];

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  return neon(databaseUrl);
}

async function generatePlaceholderImage(prompt: string, index: number): Promise<string> {
  // Generate a stable seed from the prompt
  const seed = Math.abs(prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index);
  return `https://picsum.photos/seed/${seed}/800/600`;
}

async function simpleSeed() {
  console.log('🌱 Starting simple session seeding...\n');

  const sql = getDb();

  // Clear existing sessions
  console.log('🗑️  Clearing existing sessions...');
  await sql`DELETE FROM sessions`;
  console.log('✅ Cleared\n');

  let successCount = 0;

  for (let i = 0; i < seedData.length; i++) {
    const item = seedData[i];
    console.log(`\n[${i + 1}/${seedData.length}] Processing: "${item.question}"`);

    try {
      // Generate placeholder images
      const images = [];
      if (item.images && item.images.length > 0) {
        console.log(`  🖼️  Generating ${item.images.length} placeholder images...`);
        for (let j = 0; j < item.images.length; j++) {
          const prompt = item.images[j];
          const imageUrl = await generatePlaceholderImage(prompt, j);
          images.push({
            prompt,
            imageUrl,
            success: true,
          });
        }
      }

      // Random metadata for diversity
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const [city, country] = location.split(', ');
      const daysAgo = Math.floor(Math.random() * 7); // 0-7 days ago
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));

      // Insert into database
      console.log('  💾 Saving to database...');
      await sql`
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
          ${item.question},
          ${item.response},
          ${JSON.stringify(images)},
          ${images.length > 0},
          ${images.length},
          ${Math.floor(Math.random() * 30000) + 5000},
          ${1},
          ${'192.168.1.' + Math.floor(Math.random() * 255)},
          ${country},
          ${city},
          ${createdAt.toISOString()}
        )
      `;

      console.log(`  ✅ Saved successfully with ${images.length} images`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Error processing question:`, error);
    }
  }

  console.log('\n\n🎉 Seeding complete!');
  console.log(`✅ Success: ${successCount}`);
  console.log(`📊 Total: ${seedData.length}`);
  console.log(`\n💡 To add more seeds, edit scripts/seed-data.json and run this script again!`);
}

// Run the seeding
simpleSeed().catch(console.error);

