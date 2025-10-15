# Database Logging System

This application includes comprehensive database logging for all chat interactions and image generation requests using NeonDB (PostgreSQL).

## Features

✅ **Automatic Logging**
- All chat interactions with Claude are logged
- All image generation requests with Gemini are tracked
- Response times and success/failure metrics
- Full request/response data preservation

✅ **Analytics Dashboard**
- Real-time statistics
- Recent chat history
- Performance metrics
- Success rates

## Database Schema

### chat_logs Table
Stores all chat interactions with Claude AI.

```sql
CREATE TABLE chat_logs (
  id SERIAL PRIMARY KEY,
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  needs_images BOOLEAN DEFAULT FALSE,
  image_count INTEGER DEFAULT 0,
  image_prompts JSONB,
  model VARCHAR(100),
  response_time_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### image_logs Table
Stores all image generation requests.

```sql
CREATE TABLE image_logs (
  id SERIAL PRIMARY KEY,
  prompts JSONB NOT NULL,
  results JSONB NOT NULL,
  total_time_ms INTEGER,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setup

### 1. Environment Variable
Add your NeonDB connection string to `.env.local`:

```bash
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

### 2. Initialize Database
Run the initialization script to create tables and indexes:

```bash
npm run db:init
```

This will:
- Create the `chat_logs` and `image_logs` tables
- Add indexes for better query performance
- Verify the connection

### 3. Verify in Vercel
When deploying to Vercel, add the `DATABASE_URL` environment variable in your project settings.

## Usage

### View Analytics Dashboard
Navigate to `/analytics` in your browser to see:
- Total chats and success rates
- Image generation statistics
- Average response times
- Recent chat history

### API Endpoints

#### Get Statistics
```bash
GET /api/analytics?type=stats
```

Returns aggregated statistics for the last 7 days.

#### Get Recent Chats
```bash
GET /api/analytics?type=recent&limit=50
```

Returns the most recent chat logs (default: 50).

## Querying Logs

### Direct SQL Queries
You can query logs directly from your NeonDB console or using any PostgreSQL client:

```sql
-- Get chat statistics
SELECT 
  COUNT(*) as total_chats,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) FILTER (WHERE success = true) as successful_chats
FROM chat_logs
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Get most common "how to" questions
SELECT 
  user_message,
  COUNT(*) as frequency
FROM chat_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_message
ORDER BY frequency DESC
LIMIT 10;

-- Get image generation success rate
SELECT 
  success_count,
  failure_count,
  (success_count::float / (success_count + failure_count) * 100) as success_rate
FROM image_logs
WHERE created_at > NOW() - INTERVAL '7 days';
```

## Data Retention

Currently, all logs are kept indefinitely. To implement data retention:

```sql
-- Delete logs older than 30 days
DELETE FROM chat_logs WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM image_logs WHERE created_at < NOW() - INTERVAL '30 days';
```

Consider setting up a cron job or scheduled function to run this periodically.

## Performance

- Indexes are created on `created_at` and `success` fields for fast queries
- JSONB columns allow flexible storage of prompts and results
- NeonDB's serverless architecture scales automatically

## Privacy & Compliance

⚠️ **Important**: This system logs user messages and AI responses. Ensure you:
- Comply with GDPR, CCPA, and other privacy regulations
- Inform users that conversations are logged
- Implement data retention policies
- Provide mechanisms for users to request data deletion

## Troubleshooting

### Connection Issues
```bash
# Test your DATABASE_URL
psql $DATABASE_URL -c "SELECT version();"
```

### Missing Tables
```bash
# Re-run initialization
npm run db:init
```

### Slow Queries
Check the query execution plan:
```sql
EXPLAIN ANALYZE SELECT * FROM chat_logs WHERE created_at > NOW() - INTERVAL '7 days';
```

## Cost Optimization

NeonDB offers:
- **Free tier**: 0.5 GB storage, 0.5 compute hours/month
- **Autoscaling**: Scales down during inactivity
- **Branching**: Create dev/staging databases from main

For production, monitor your usage in the NeonDB console.

