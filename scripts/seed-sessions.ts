import { neon } from '@neondatabase/serverless';
import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const QUESTIONS = [
  'How does an airplane stay in the air?',
  'How does Wi-Fi actually work?',
  'Why is the sky blue?',
  'How do touchscreens sense my finger?',
  'How does a refrigerator keep things cold?',
  'How does solar power become electricity?',
  'How does a car engine work?',
  'How do noise-canceling headphones block sound?',
  'How do self-driving cars see the road?',
  'How does a washing machine clean clothes?',
  'How do magnets attract metal?',
  'Why do onions make us cry?',
  'Why do cats purr?',
  'How does a rainbow form?',
  'How do bridges stay standing?',
  'How do bees make honey?',
  'How does digestion work?',
  'How does lightning form?',
  'Why do volcanoes erupt?',
  'How do satellites stay in orbit?',
  'How do airplanes land safely?',
  'How do cameras capture color?',
  'How does facial recognition identify people?',
  'How does AI draw pictures from text?',
  'Why does my phone battery drain fast?',
  'How do vaccines protect you?',
  'How does human memory work?',
  'How does sound travel through air?',
  'Why do we dream?',
  'How does the heart pump blood?',
  'Why do we get goosebumps?',
  'How do credit cards process payments?',
  'How does your brain see colors?',
  'Why do we yawn when we\'re tired?',
  'How does your phone know your location?',
  'How do plants make oxygen?',
  'How do 3D printers create objects?',
  'How does coffee wake you up?',
  'How do mirrors flip left and right?',
  'Why does hair turn gray?',
  'How to remove coffee stains from clothes?',
  'How to clean white sneakers?',
  'How to fix a leaking faucet?',
  'How to remove rust from metal?',
  'How to unclog a drain naturally?',
  'How to get rid of fruit flies?',
  'How to descale a coffee maker?',
  'How to remove sticker residue?',
  'How to fold a fitted bedsheet neatly?',
  'How to tie a tie?',
];

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

async function generateResponse(question: string) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY is not set');
  }
  
  const anthropic = new Anthropic({
    apiKey,
  });

  const systemPrompt = `You are a helpful AI assistant that explains concepts visually. 
When answering, provide a clear, engaging explanation.
Then determine if visual aids would help (for most "how" and "why" questions, they will).

Respond in this JSON format:
{
  "response": "Your detailed explanation here",
  "needsImages": true/false,
  "imageCount": number (typically 3-5),
  "imagePrompts": ["prompt 1", "prompt 2", ...]
}

For image prompts, create clear, descriptive prompts that would work well with an AI image generator:
- Be specific about what to show
- Include visual elements, diagrams, or step-by-step illustrations
- Make them instructional and educational
- Each prompt should show a different aspect or step`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
      system: systemPrompt,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    // Sanitize JSON by removing unescaped control characters
    let jsonString = jsonMatch[0];
    jsonString = jsonString.replace(/[\x00-\x1F\x7F]/g, (char) => {
      const escapeMap: { [key: string]: string } = {
        '\n': '\\n',
        '\r': '\\r',
        '\t': '\\t',
      };
      return escapeMap[char] || '';
    });

    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error(`Error generating response for "${question}":`, error);
    return null;
  }
}

async function generatePlaceholderImage(prompt: string, index: number): Promise<string> {
  // Generate a stable seed from the prompt
  const seed = Math.abs(prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index);
  return `https://picsum.photos/seed/${seed}/800/600`;
}

async function seedSessions() {
  console.log('🌱 Starting session seeding...\n');

  const sql = getDb();

  // Clear existing sessions
  console.log('🗑️  Clearing existing sessions...');
  await sql`DELETE FROM sessions`;
  console.log('✅ Cleared\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < QUESTIONS.length; i++) {
    const question = QUESTIONS[i];
    console.log(`\n[${i + 1}/${QUESTIONS.length}] Processing: "${question}"`);

    try {
      // Generate response
      console.log('  📝 Generating response...');
      const aiResponse = await generateResponse(question);

      if (!aiResponse) {
        console.log('  ❌ Failed to generate response');
        failCount++;
        continue;
      }

      // Generate placeholder images
      const images = [];
      if (aiResponse.needsImages && aiResponse.imagePrompts) {
        console.log(`  🖼️  Generating ${aiResponse.imagePrompts.length} images...`);
        for (let j = 0; j < aiResponse.imagePrompts.length; j++) {
          const prompt = aiResponse.imagePrompts[j];
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
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

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
          ${question},
          ${aiResponse.response},
          ${JSON.stringify(images)},
          ${aiResponse.needsImages},
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

      // Rate limiting - wait 2 seconds between requests
      if (i < QUESTIONS.length - 1) {
        console.log('  ⏳ Waiting 2s before next request...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`  ❌ Error processing question:`, error);
      failCount++;
    }
  }

  console.log('\n\n🎉 Seeding complete!');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${QUESTIONS.length}`);
}

// Run the seeding
seedSessions().catch(console.error);

