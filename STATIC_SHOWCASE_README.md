# Static Showcase Feature - "See What Others Are Searching"

## Overview

The history sidebar shows **STATIC, CURATED EXAMPLES ONLY** - not real user sessions. This is a showcase feature to demonstrate what kinds of questions Expixi can answer, providing inspiration for new users.

## Important: No User Session Tracking

✅ **What it does:**
- Displays 50 curated example questions from seed data
- Shows pre-written answers and placeholder images
- Provides inspiration for users on what to ask

❌ **What it does NOT do:**
- Track real user conversations
- Save user searches to database
- Update dynamically based on user activity
- Store any user chat history

## How It Works

1. **Seed Data**: Edit `scripts/seed-data.json` with your curated Q&A examples
2. **Populate**: Run `npm run db:seed-simple` to load into database
3. **Display**: Sidebar fetches these static examples from the sessions table
4. **Refresh**: Re-run the seed script anytime to update the showcase

## Adding Your 50 Questions

Currently 5 examples are seeded. To add the remaining 45:

### Step 1: Edit seed-data.json

Add entries following this format:

```json
{
  "question": "Your question here?",
  "response": "Clear, engaging 2-4 sentence explanation",
  "images": [
    "Description for visual 1",
    "Description for visual 2",  
    "Description for visual 3"
  ]
}
```

### Step 2: Write Good Responses

- **Be concise**: 2-4 sentences max
- **Be engaging**: Use analogies and relatable language
- **Be accurate**: Provide correct information
- **Be visual**: Write responses that benefit from images

### Step 3: Describe Visuals

For each image description:
- Be specific about what should be shown
- Include details like "diagram showing X", "illustration of Y"
- Think about what would help understanding
- 3-5 images per question works well

### Step 4: Run the Seeder

```bash
npm run db:seed-simple
```

This will:
- Clear existing showcase examples
- Load all entries from seed-data.json
- Generate placeholder images
- Randomize timestamps/locations for variety

## Database Table

The `sessions` table stores these static examples with:
- `user_query`: The question
- `assistant_response`: The answer
- `images`: Array of image objects
- `created_at`: Randomized timestamp (0-7 days ago)
- `location`: Randomized location for diversity

## Maintaining the Showcase

### To Update Examples:
1. Edit `scripts/seed-data.json`
2. Run `npm run db:seed-simple`
3. Refresh the app

### To Add More:
- Just add more JSON objects to the array
- No limit (but 50 is a good showcase size)

### To Replace Placeholder Images:
When you're ready for real images:
1. Generate images using Gemini
2. Upload to CDN
3. Update the `imageUrl` field in database
4. Or modify the seed script to generate real images

## Current Status

✅ 5 example questions seeded  
✅ Sidebar working and displaying examples  
✅ No user session tracking (as requested)  
⏳ Add remaining 45 questions to seed-data.json  
⏳ Optional: Generate real images with Gemini  

## Quick Reference

### Commands
- `npm run db:sessions` - Create sessions table
- `npm run db:seed-simple` - Populate with seed data
- `npm run dev` - Run the app (currently on port 3001)

### Files
- `scripts/seed-data.json` - Edit this to add questions
- `scripts/simple-seed.ts` - The seeding script
- `app/api/sessions/recent/route.ts` - API to fetch examples
- `components/SessionsSidebar.tsx` - Displays the showcase

---

**This is perfect for your MVP**: Easy to manage, no complex user tracking, full control over showcase content!

