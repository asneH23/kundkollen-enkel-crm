CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID NOT NULL REFERENCES public.reminders(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;