import { NextRequest, NextResponse } from 'next/server';
import { logImageGeneration } from '@/lib/db';
import { getRequestMetadata, formatMetadataForDb } from '@/lib/request-logger';

// Fallback using placeholder images
// Using Picsum Photos API which is more reliable than Unsplash Source

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  // Capture request metadata for legal compliance
  const requestMetadata = await getRequestMetadata(req);
  const metadataForDb = formatMetadataForDb(requestMetadata);
  try {
    const { prompts } = await req.json();

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json(
        { error: 'Invalid prompts array' },
        { status: 400 }
      );
    }

    // Generate placeholder images using Lorem Picsum (more reliable)
    const images = prompts.map((prompt: string, index: number) => {
      // Use Lorem Picsum with random seed based on prompt and index
      const seed = Math.abs(prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index);
      const imageUrl = `https://picsum.photos/seed/${seed}/800/600`;
      
      return {
        prompt,
        imageUrl,
        success: true,
      };
    });

    // Add a small delay to simulate generation
    await new Promise(resolve => setTimeout(resolve, 800));

    // Log to database (non-blocking)
    try {
      const totalTime = Date.now() - startTime;
      await logImageGeneration({
        prompts,
        results: images.map(img => ({
          prompt: img.prompt,
          success: img.success,
          imageSize: img.imageUrl?.length,
        })),
        totalTime,
        successCount: images.length,
        failureCount: 0,
        ...metadataForDb,
      });
    } catch (logError) {
      console.error('Failed to log fallback images (non-critical):', logError);
    }

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error generating placeholder images:', error);
    
    // Log error to database (non-blocking)
    try {
      const totalTime = Date.now() - startTime;
      await logImageGeneration({
        prompts: [],
        results: [],
        totalTime,
        successCount: 0,
        failureCount: 0,
        ...metadataForDb,
      });
    } catch (logError) {
      console.error('Failed to log error (non-critical):', logError);
    }
    
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    );
  }
}

