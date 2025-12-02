-- COMPLETE DATABASE SETUP FOR KUNDKOLLEN
-- Run this in Supabase Dashboard → SQL Editor
-- This script combines all migrations into one setup

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  company_name TEXT,
  sales_goal NUMERIC,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Quotes table
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Reminders table
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Beta signups table
CREATE TABLE public.beta_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notification logs table
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID NOT NULL REFERENCES public.reminders(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL
);

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CREATE RLS POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Customers policies
CREATE POLICY "Users can view own customers"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON public.customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON public.customers FOR DELETE
  USING (auth.uid() = user_id);

-- Quotes policies
CREATE POLICY "Users can view own quotes"
  ON public.quotes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes"
  ON public.quotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes"
  ON public.quotes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes"
  ON public.quotes FOR DELETE
  USING (auth.uid() = user_id);

-- Reminders policies
CREATE POLICY "Users can view own reminders"
  ON public.reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON public.reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON public.reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON public.reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Beta signups policies
CREATE POLICY "Anyone can sign up for beta"
  ON public.beta_signups FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view beta signups"
  ON public.beta_signups FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- 4. CREATE FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get reminders that need notifications
CREATE OR REPLACE FUNCTION public.get_reminders_to_notify()
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  reminder_id UUID,
  reminder_title TEXT,
  reminder_description TEXT,
  customer_name TEXT,
  due_date TIMESTAMPTZ,
  days_until INTEGER,
  notification_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH reminder_data AS (
    SELECT 
      r.user_id,
      p.email as user_email,
      r.id as reminder_id,
      r.title as reminder_title,
      r.description as reminder_description,
      c.company_name as customer_name,
      r.due_date,
      EXTRACT(DAY FROM (r.due_date::date - CURRENT_DATE))::INTEGER as days_until
    FROM public.reminders r
    JOIN public.profiles p ON r.user_id = p.id
    LEFT JOIN public.customers c ON r.customer_id = c.id
    WHERE r.completed = false
  )
  SELECT 
    rd.user_id,
    rd.user_email,
    rd.reminder_id,
    rd.reminder_title,
    rd.reminder_description,
    rd.customer_name,
    rd.due_date,
    rd.days_until,
    CASE 
      WHEN rd.days_until < 0 THEN 'overdue'
      WHEN rd.days_until = 0 THEN 'today'
      WHEN rd.days_until = 1 THEN '1_day'
      WHEN rd.days_until = 7 THEN '7_days'
      ELSE NULL
    END as notification_type
  FROM reminder_data rd
  WHERE (
    rd.days_until < 0 OR 
    rd.days_until = 0 OR 
    rd.days_until = 1 OR 
    rd.days_until = 7
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.notification_logs nl
    WHERE nl.reminder_id = rd.reminder_id
    AND nl.notification_type = CASE 
      WHEN rd.days_until < 0 THEN 'overdue'
      WHEN rd.days_until = 0 THEN 'today'
      WHEN rd.days_until = 1 THEN '1_day'
      WHEN rd.days_until = 7 THEN '7_days'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. CREATE TRIGGERS
-- ============================================

-- Triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. CREATE INDEXES
-- ============================================

CREATE INDEX idx_beta_signups_email ON public.beta_signups(email);
CREATE INDEX idx_beta_signups_created_at ON public.beta_signups(created_at DESC);

-- ============================================
-- DONE! Your database is ready to use.
-- ============================================
