-- Create function to get reminders that need notifications
CREATE OR REPLACE FUNCTION public.get_reminders_to_notify()
RETURNS TABLE (
  user_id uuid,
  user_email text,
  reminder_id uuid,
  reminder_title text,
  reminder_description text,
  customer_name text,
  due_date date,
  days_until integer,
  notification_type text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.user_id,
    p.email as user_email,
    r.id as reminder_id,
    r.title as reminder_title,
    r.description as reminder_description,
    c.company_name as customer_name,
    r.due_date::date,
    (r.due_date::date - CURRENT_DATE)::integer as days_until,
    CASE 
      WHEN r.due_date::date = CURRENT_DATE + INTERVAL '7 days' THEN '7_days'
      WHEN r.due_date::date = CURRENT_DATE + INTERVAL '1 day' THEN '1_day'
      WHEN r.due_date::date = CURRENT_DATE THEN 'today'
      WHEN r.due_date::date < CURRENT_DATE THEN 'overdue'
    END as notification_type
  FROM reminders r
  JOIN profiles p ON r.user_id = p.id
  LEFT JOIN customers c ON r.customer_id = c.id
  WHERE r.completed = false
    AND r.due_date::date >= CURRENT_DATE - INTERVAL '7 days'
    AND r.due_date::date <= CURRENT_DATE + INTERVAL '7 days'
    AND (
      r.due_date::date = CURRENT_DATE + INTERVAL '7 days'
      OR r.due_date::date = CURRENT_DATE + INTERVAL '1 day'
      OR r.due_date::date = CURRENT_DATE
      OR r.due_date::date < CURRENT_DATE
    )
    -- Exclude reminders that have already been notified for this type today
    AND NOT EXISTS (
      SELECT 1 FROM notification_logs nl
      WHERE nl.reminder_id = r.id
        AND nl.notification_type = CASE 
          WHEN r.due_date::date = CURRENT_DATE + INTERVAL '7 days' THEN '7_days'
          WHEN r.due_date::date = CURRENT_DATE + INTERVAL '1 day' THEN '1_day'
          WHEN r.due_date::date = CURRENT_DATE THEN 'today'
          WHEN r.due_date::date < CURRENT_DATE THEN 'overdue'
        END
        AND nl.sent_at::date = CURRENT_DATE
    );
END;
$$;