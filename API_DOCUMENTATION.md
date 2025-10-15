# API Documentation

## Overview

This document describes the API endpoints used in the How To Search application.

## Endpoints

### 1. Chat Endpoint

**Endpoint:** `POST /api/chat`

**Description:** Processes user questions and returns AI-generated responses with image generation metadata.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user" | "assistant",
      "content": "string"
    }
  ],
  "userMessage": "string"
}
```

**Response:**
```json
{
  "response": "string",
  "needsImages": boolean,
  "imageCount": number,
  "imagePrompts": ["string"]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [],
    "userMessage": "How to tie a tie"
  }'
```

**Response Example:**
```json
{
  "response": "Here's how to tie a tie:\n\n1. Drape the tie around your neck...",
  "needsImages": true,
  "imageCount": 3,
  "imagePrompts": [
    "Person draping a tie around neck",
    "Hands forming the knot",
    "Completed Windsor knot"
  ]
}
```

**Error Responses:**
- `500` - Claude API error
```json
{
  "error": "Failed to get response from Claude"
}
```

---

### 2. Image Generation Endpoint (Gemini)

**Endpoint:** `POST /api/generate-images`

**Description:** Generates images using Gemini's Imagen API with automatic fallback to placeholders.

**Request Body:**
```json
{
  "prompts": ["string"]
}
```

**Response:**
```json
{
  "images": [
    {
      "prompt": "string",
      "imageUrl": "string",
      "success": boolean,
      "fallback": boolean,
      "error": "string" (optional)
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/generate-images \
  -H "Content-Type: application/json" \
  -d '{
    "prompts": [
      "Person tying a necktie",
      "Completed Windsor knot"
    ]
  }'
```

**Response Example:**
```json
{
  "images": [
    {
      "prompt": "Person tying a necktie",
      "imageUrl": "https://source.unsplash.com/800x600/?necktie,tying",
      "success": true,
      "fallback": true
    }
  ]
}
```

**Error Responses:**
- `400` - Invalid request
```json
{
  "error": "Invalid prompts array"
}
```
- `500` - API error
```json
{
  "error": "Failed to generate images"
}
```

---

### 3. Image Generation Fallback Endpoint

**Endpoint:** `POST /api/generate-images-fallback`

**Description:** Generates placeholder images using Unsplash. Always works without additional API setup.

**Request Body:**
```json
{
  "prompts": ["string"]
}
```

**Response:**
```json
{
  "images": [
    {
      "prompt": "string",
      "imageUrl": "string",
      "success": boolean
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/generate-images-fallback \
  -H "Content-Type: application/json" \
  -d '{
    "prompts": ["Coffee brewing process"]
  }'
```

---

## Configuration

### Switching Image Generation Modes

Edit `lib/config.ts`:

```typescript
export const config = {
  // Change this to switch modes
  imageGenerationMode: 'fallback', // or 'gemini'
  // ...
};
```

**Modes:**
- `'fallback'` - Uses Unsplash placeholders (recommended for demo)
- `'gemini'` - Uses Gemini Imagen API (requires setup)

---

## Environment Variables

Required variables in `.env.local`:

```bash
# Required for chat functionality
CLAUDE_API_KEY=sk-ant-api03-...

# Required for Gemini image generation
GEMINI_API_KEY=AIzaSy...

# Optional - AWS Lambda endpoint
LAMBDA_API_ENDPOINT=https://...
```

---

## Rate Limits

### Claude API (Anthropic)
- **Default:** 50 requests/minute
- **Max tokens:** 2048 per request
- **Monitor:** https://console.anthropic.com

### Gemini API (Google)
- **Default:** 60 requests/minute (free tier)
- **Max images:** 100/day (free tier)
- **Monitor:** https://console.cloud.google.com

### Unsplash (Fallback)
- **Default:** 50 requests/hour (free)
- **No authentication** required for source API

---

## Error Handling

All endpoints implement try-catch error handling:

1. **Client errors** (400-499): Invalid input
2. **Server errors** (500-599): API failures
3. **Fallback behavior**: Graceful degradation

Example error handling in client:

```typescript
try {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const result = await response.json();
  // Handle success
} catch (error) {
  // Handle error with user-friendly message
  console.error('API Error:', error);
}
```

---

## Best Practices

### 1. Request Optimization
- Batch image requests when possible
- Cache responses on the client
- Implement request debouncing

### 2. Error Recovery
- Show user-friendly error messages
- Implement retry logic for transient errors
- Provide fallback content

### 3. Performance
- Use Edge runtime for faster response
- Implement request timeout
- Monitor API usage

### 4. Security
- Never expose API keys in client code
- Use environment variables
- Validate all input data
- Implement rate limiting

---

## Testing

### Test Chat Endpoint
```bash
# Test with sample question
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [], "userMessage": "How to make coffee"}'
```

### Test Image Generation
```bash
# Test fallback endpoint
curl -X POST http://localhost:3000/api/generate-images-fallback \
  -H "Content-Type: application/json" \
  -d '{"prompts": ["Coffee cup", "Pour over coffee"]}'
```

---

## API Response Times

Typical response times:

- **Chat API:** 1-3 seconds
- **Image Generation (Gemini):** 3-8 seconds per image
- **Image Fallback:** 500ms-1s per image

---

## Future Enhancements

- [ ] Implement streaming responses for chat
- [ ] Add response caching
- [ ] Support batch image generation
- [ ] Add webhook support
- [ ] Implement API versioning
- [ ] Add GraphQL support
- [ ] Rate limiting middleware

---

## Support

For API issues:
- **Claude:** https://support.anthropic.com
- **Gemini:** https://support.google.com
- **Project Issues:** Open a GitHub issue

---

Last updated: 2025-10-14

