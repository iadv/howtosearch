-- Check if database is accessible and has data
SELECT 
  'chat_logs' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN success = true THEN 1 END) as successful,
  COUNT(CASE WHEN success = false THEN 1 END) as failed,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM chat_logs
UNION ALL
SELECT 
  'image_logs' as table_name,
  COUNT(*) as total_count,
  COUNT(*) as successful,
  0 as failed,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM image_logs;
