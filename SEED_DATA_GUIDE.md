# Seed Data Guide for Expixi

## How to Add/Edit History Sessions

The "See what others are searching" sidebar is populated from the `sessions` database table. For your MVP, you can manually manage this data using a simple JSON file.

### Quick Start

1. **Edit the seed data**: Open `scripts/seed-data.json`
2. **Add your questions and responses**: Follow the format below
3. **Run the seed script**: `npm run db:seed-simple`
4. **Refresh your app**: The history sidebar will show the new data

### Seed Data Format

Each entry in `scripts/seed-data.json` should follow this structure:

```json
{
  "question": "Your question here",
  "response": "The detailed explanation/answer",
  "images": [
    "Description for visual 1 (will generate placeholder image)",
    "Description for visual 2",
    "Description for visual 3"
  ]
}
```

### Example Entry

```json
{
  "question": "How does a car engine work?",
  "response": "A car engine works through internal combustion...",
  "images": [
    "Diagram of 4-stroke engine cycle: intake, compression, power, exhaust",
    "Cross-section view of engine showing pistons, cylinders, and crankshaft",
    "Animation sequence of fuel injection and spark plug ignition"
  ]
}
```

### Adding All 50 Questions

The script currently has 5 sample entries. To add all 50 questions you provided:

1. Open `scripts/seed-data.json`
2. Add more entries following the same format
3. Keep responses concise but informative (2-4 sentences)
4. Include 3-5 image descriptions per question
5. Run `npm run db:seed-simple` to update the database

### Image Placeholders

Currently using Lorem Picsum for placeholder images. Each image description generates a stable placeholder based on the text content. 

**For Production**: Replace these with real generated images by:
- Using Gemini to generate actual images
- Uploading images to a CDN
- Updating the `imageUrl` field in the database

### Database Structure

Sessions are stored in the `sessions` table with:
- `user_query`: The question
- `assistant_response`: The answer/explanation
- `images`: JSON array of image objects with `prompt` and `imageUrl`
- `needs_images`: Boolean indicating if images are present
- `image_count`: Number of images
- `created_at`: Timestamp (randomized for seed data)
- `location`: City, Country (randomized for diversity)

### FIFO Management

The system automatically maintains only the 50 most recent sessions. Older sessions are automatically deleted when new ones are added.

### Tips for Writing Good Seed Data

1. **Questions**: Make them natural and conversational
2. **Responses**: Clear, engaging, 2-4 sentences
3. **Images**: Describe specific visuals that would help understanding
4. **Variety**: Mix "how to", "why", and "what" questions
5. **Relevance**: Focus on topics where visuals add value

### Updating Data Later

To refresh the seed data:
```bash
npm run db:seed-simple
```

This will:
- Clear all existing sessions
- Insert new data from `seed-data.json`
- Randomize timestamps for variety
- Assign random locations for diversity

### Next Steps for Production

1. **Generate Real Images**: Integrate Gemini image generation
2. **CDN Storage**: Upload generated images to a CDN
3. **Admin Panel**: Build a UI to manage seed data (optional)
4. **Real Sessions**: Let actual users populate the history
5. **Moderation**: Add content filtering for user-generated sessions

---

**Current Status**: ✅ Working with 5 sample sessions
**Ready to Scale**: Add remaining 45 questions to seed-data.json

