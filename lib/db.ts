import { neon } from '@neondatabase/serverless';

// Initialize the database connection
let _cachedSql: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (_cachedSql) return _cachedSql;
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('🚨 CRITICAL: DATABASE_URL is not set - logging will FAIL');
    console.error('🚨 Check your .env.local file and restart the server');
    return null;
  }
  
  _cachedSql = neon(databaseUrl);
  console.log('✅ Database connection initialized');
  return _cachedSql;
}

// Log a chat interaction
export async function logChatInteraction(data: {
  userMessage: string;
  assistantResponse: string;
  needsImages: boolean;
  imageCount: number;
  imagePrompts?: string[];
  model: string;
  responseTime: number;
  success: boolean;
  error?: string;
  // Legal compliance metadata
  ip_address?: string;
  ip_hash?: string;
  user_agent?: string;
  country?: string;
  city?: string;
  region?: string;
  referrer?: string;
  request_id?: string;
}) {
  try {
    const sql = getDb();
    if (!sql) {
      console.error('🚨 LOGGING SKIPPED: Database not configured');
      return;
    }

    await sql`
      INSERT INTO chat_logs (
        user_message,
        assistant_response,
        needs_images,
        image_count,
        image_prompts,
        model,
        response_time_ms,
        success,
        error,
        ip_address,
        ip_hash,
        user_agent,
        country,
        city,
        region,
        referrer,
        request_id,
        created_at
      ) VALUES (
        ${data.userMessage},
        ${data.assistantResponse},
        ${data.needsImages},
        ${data.imageCount},
        ${JSON.stringify(data.imagePrompts || [])},
        ${data.model},
        ${data.responseTime},
        ${data.success},
        ${data.error || null},
        ${data.ip_address || null},
        ${data.ip_hash || null},
        ${data.user_agent || null},
        ${data.country || null},
        ${data.city || null},
        ${data.region || null},
        ${data.referrer || null},
        ${data.request_id || null},
        NOW()
      )
    `;
    
    console.log('✅ Chat interaction logged to database');
  } catch (error) {
    console.error('❌ Failed to log chat interaction:', error);
  }
}

// Log image generation
export async function logImageGeneration(data: {
  prompts: string[];
  results: Array<{
    prompt: string;
    success: boolean;
    imageSize?: number;
    error?: string;
  }>;
  totalTime: number;
  successCount: number;
  failureCount: number;
  // Legal compliance metadata
  ip_address?: string;
  ip_hash?: string;
  user_agent?: string;
  country?: string;
  city?: string;
  region?: string;
  referrer?: string;
  request_id?: string;
}) {
  try {
    const sql = getDb();
    if (!sql) {
      console.error('🚨 IMAGE LOGGING SKIPPED: Database not configured');
      return;
    }

    await sql`
      INSERT INTO image_logs (
        prompts,
        results,
        total_time_ms,
        success_count,
        failure_count,
        ip_address,
        ip_hash,
        user_agent,
        country,
        city,
        region,
        referrer,
        request_id,
        created_at
      ) VALUES (
        ${JSON.stringify(data.prompts)},
        ${JSON.stringify(data.results)},
        ${data.totalTime},
        ${data.successCount},
        ${data.failureCount},
        ${data.ip_address || null},
        ${data.ip_hash || null},
        ${data.user_agent || null},
        ${data.country || null},
        ${data.city || null},
        ${data.region || null},
        ${data.referrer || null},
        ${data.request_id || null},
        NOW()
      )
    `;
    
    console.log('✅ Image generation logged to database');
  } catch (error) {
    console.error('❌ Failed to log image generation:', error);
  }
}

// Get recent chat logs
export async function getRecentChats(limit: number = 50) {
  try {
    const sql = getDb();
    if (!sql) return [];

    const result = await sql`
      SELECT * FROM chat_logs
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    
    return result;
  } catch (error) {
    console.error('❌ Failed to fetch chat logs:', error);
    return [];
  }
}

// Get analytics
export async function getAnalytics() {
  try {
    const sql = getDb();
    if (!sql) return null;

    const statsResult = await sql`
      SELECT 
        COUNT(*) as total_chats,
        COUNT(*) FILTER (WHERE success = true) as successful_chats,
        COUNT(*) FILTER (WHERE needs_images = true) as chats_with_images,
        AVG(response_time_ms) as avg_response_time,
        AVG(image_count) as avg_image_count
      FROM chat_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
    `;
    
    const imageStatsResult = await sql`
      SELECT 
        COUNT(*) as total_generations,
        SUM(success_count) as total_images_generated,
        SUM(failure_count) as total_failures,
        AVG(total_time_ms) as avg_generation_time
      FROM image_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
    `;
    
    return {
      chat: Array.isArray(statsResult) ? statsResult[0] : statsResult,
      images: Array.isArray(imageStatsResult) ? imageStatsResult[0] : imageStatsResult,
    };
  } catch (error) {
    console.error('❌ Failed to fetch analytics:', error);
    return null;
  }
}

