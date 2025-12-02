-- CRON JOB SETUP FOR EMAIL REMINDERS
-- Run this SQL in the Supabase Dashboard SQL Editor: https://supabase.com/dashboard/project/bztmchmfaprivbdxnhsz/sql/new

-- IMPORTANT: You need to get your SERVICE_ROLE_KEY first!
-- 1. Go to: https://supabase.com/dashboard/project/bztmchmfaprivbdxnhsz/settings/api
-- 2. Copy the "service_role" key (NOT the "anon" key)
-- 3. Replace [SERVICE_ROLE_KEY] below with that key

SELECT cron.schedule(
  'send-reminder-emails-daily',
  '0 8 * * *', -- Runs at 08:00 UTC every day (09:00 Swedish winter time, 10:00 summer time)
  $$
  SELECT net.http_post(
    url := 'https://bztmchmfaprivbdxnhsz.supabase.co/functions/v1/send-reminder-emails',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dG1jaG1mYXByaXZiZHhuaHN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY3OTQ0MywiZXhwIjoyMDgwMjU1NDQzfQ.X8T5gfh2CYekWvC00JkqYfZuLSEbvBqKfeN4JUYb1mo]"}',
    body := '{}'::jsonb
  );
  $$
);

-- To check if it's scheduled:
-- SELECT * FROM cron.job;

-- To unschedule/delete:
-- SELECT cron.unschedule('send-reminder-emails-daily');
