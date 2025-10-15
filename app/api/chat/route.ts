import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Initialize Anthropic client inside the function to ensure env vars are loaded
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      console.error('CLAUDE_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const { messages, userMessage } = await req.json();

    // System prompt to help Claude understand the task
    const systemPrompt = `You are a helpful "How To" assistant. When users ask how to do something, provide clear, step-by-step instructions.

IMPORTANT: After your response, you MUST analyze if visual aids would help the user understand better.

Respond in this exact JSON format:
{
  "response": "Your helpful step-by-step response here",
  "needsImages": true/false,
  "imageCount": 0-4,
  "imagePrompts": ["description of image 1", "description of image 2", ...]
}

Guidelines:
- Set needsImages to true if visual instructions would significantly help
- Suggest 1-4 images maximum
- Each imagePrompt should be a clear, detailed description for generating an instructional image
- Focus on key steps that benefit from visual representation
- Make image prompts specific and actionable`;

    // Call Claude API - using Claude 3.5 Haiku (fastest model)
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        ...messages,
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Try to parse JSON response from Claude
    let parsedResponse;
    try {
      // Clean up the response text
      let jsonText = responseText.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.includes('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').trim();
      }
      
      // Try to find and parse JSON
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // Sanitize the JSON string to fix common issues
        let jsonString = jsonMatch[0];
        
        // Fix unescaped newlines in string values (common issue with Claude's JSON output)
        // This is a more robust approach - we'll use JSON5 parsing approach
        try {
          const parsed = JSON.parse(jsonString);
          
          // Ensure we have the required fields
          if (parsed.response && typeof parsed.response === 'string') {
            parsedResponse = {
              response: parsed.response,
              needsImages: parsed.needsImages === true,
              imageCount: parsed.imageCount || 0,
              imagePrompts: Array.isArray(parsed.imagePrompts) ? parsed.imagePrompts : [],
            };
            console.log('Successfully parsed JSON response, response length:', parsed.response.length);
          } else {
            throw new Error('No valid response field');
          }
        } catch (firstParseError) {
          // If standard parsing fails, try to fix common JSON issues
          console.log('First parse failed, attempting to fix JSON formatting');
          
          // Replace literal newlines within string values with \n
          // This regex finds strings and replaces actual newlines with escaped ones
          jsonString = jsonString.replace(/"([^"]*?)"/gs, (match) => {
            return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
          });
          
          const parsed = JSON.parse(jsonString);
          
          if (parsed.response && typeof parsed.response === 'string') {
            parsedResponse = {
              response: parsed.response,
              needsImages: parsed.needsImages === true,
              imageCount: parsed.imageCount || 0,
              imagePrompts: Array.isArray(parsed.imagePrompts) ? parsed.imagePrompts : [],
            };
            console.log('Successfully parsed JSON response after fixing, response length:', parsed.response.length);
          } else {
            throw new Error('No valid response field after fix');
          }
        }
      } else {
        // No JSON found, use raw response
        console.log('No JSON pattern found in response');
        parsedResponse = {
          response: responseText,
          needsImages: false,
          imageCount: 0,
          imagePrompts: [],
        };
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      // Fallback on parsing error - use the raw text
      parsedResponse = {
        response: responseText,
        needsImages: false,
        imageCount: 0,
        imagePrompts: [],
      };
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return NextResponse.json(
      { error: 'Failed to get response from Claude' },
      { status: 500 }
    );
  }
}

