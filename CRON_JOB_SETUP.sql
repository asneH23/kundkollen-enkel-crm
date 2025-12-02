-- CRON JOB SETUP FOR EMAIL REMINDERS
-- Run this SQL in the Supabase Dashboard SQL Editor: https://supabase.com/dashboard/project/_/sql/new

-- 1. Replace [PROJECT_REF] with your Supabase project ID (found in URL: https://supabase.com/dashboard/project/xyz...)
-- 2. Replace [SERVICE_ROLE_KEY] with your Service Role Key (found in Project Settings -> API -> service_role secret)

SELECT cron.schedule(
  'send-reminder-emails-daily',
  '0 8 * * *', -- Runs at 08:00 UTC every day
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT_REF].supabase.co/functions/v1/send-reminder-emails',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [SERVICE_ROLE_KEY]"}',
    body := '{}'::jsonb
  );
  $$
);

-- To check if it's scheduled:
-- SELECT * FROM cron.job;

-- To unschedule/delete:
-- SELECT cron.unschedule('send-reminder-emails-daily');
