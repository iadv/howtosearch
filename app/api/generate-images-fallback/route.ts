import { NextRequest, NextResponse } from 'next/server';

// Fallback using placeholder images
// Using Picsum Photos API which is more reliable than Unsplash Source

export async function POST(req: NextRequest) {
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

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error generating placeholder images:', error);
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    );
  }
}

