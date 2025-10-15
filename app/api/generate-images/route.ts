import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { prompts } = await req.json();

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json(
        { error: 'Invalid prompts array' },
        { status: 400 }
      );
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    console.log(`🎨 Generating ${prompts.length} images with Gemini 2.5 Flash Image...`);

    // Initialize Google GenAI with API key
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Generate images using gemini-2.5-flash-image
    const imagePromises = prompts.map(async (prompt: string, index: number) => {
      try {
        console.log(`📸 Generating image ${index + 1}/${prompts.length}: "${prompt}"`);
        
        // Enhanced prompt for better instructional images
        const enhancedPrompt = `Create a clear, high-quality instructional photograph: ${prompt}. Professional style, well-lit, educational, easy to understand, step-by-step visual guide.`;
        
        // Generate content using gemini-2.5-flash-image
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: enhancedPrompt,
        });

        // Extract image from response
        if (response.candidates && response.candidates[0]) {
          const candidate = response.candidates[0];
          
          if (!candidate.content || !candidate.content.parts) {
            console.log(`⚠️ No content or parts in response for image ${index + 1}`);
            return {
              prompt,
              imageUrl: null,
              success: false,
              error: 'No content in response',
            };
          }
          
          const parts = candidate.content.parts;
          
          // Debug: Log response structure
          console.log(`🔍 Image ${index + 1} response structure:`, {
            hasCandidates: !!response.candidates,
            candidateCount: response.candidates?.length,
            finishReason: candidate.finishReason,
            safetyRatings: candidate.safetyRatings?.map(r => ({ category: r.category, probability: r.probability })),
            partsCount: parts?.length,
            partTypes: parts?.map(p => ({
              hasText: !!p.text,
              hasInlineData: !!p.inlineData,
              inlineDataType: p.inlineData?.mimeType
            }))
          });
          
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              // Image found! Convert to data URL
              const imageData = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || 'image/png';
              const imageUrl = `data:${mimeType};base64,${imageData}`;
              
              console.log(`✅ Image ${index + 1} generated successfully (${imageData.length} bytes)`);
              
              return {
                prompt,
                imageUrl,
                success: true,
              };
            } else if (part.text) {
              console.log(`📝 Image ${index + 1} returned text instead:`, part.text.substring(0, 200));
            }
          }
        }

        console.log(`⚠️ No image data in response for image ${index + 1}`);
        console.log(`Full response:`, JSON.stringify(response, null, 2).substring(0, 1000));
        
        return {
          prompt,
          imageUrl: null,
          success: false,
          error: 'No image data in response',
        };
        
      } catch (error) {
        console.error(`❌ Error generating image ${index + 1} for "${prompt}":`, error);
        return {
          prompt,
          imageUrl: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const images = await Promise.all(imagePromises);
    
    // Log results
    const successCount = images.filter(img => img.success).length;
    console.log(`🎉 Image generation complete: ${successCount}/${images.length} successful`);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('❌ Error in image generation endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    );
  }
}

