-- Add RLS policies for notification_logs table
CREATE POLICY "Service role can insert notification logs"
ON public.notification_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own notification logs"
ON public.notification_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;