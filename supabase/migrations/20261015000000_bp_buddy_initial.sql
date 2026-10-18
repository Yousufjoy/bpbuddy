-- ==============================================================================
-- Supabase Migration: BP Buddy Initial Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. BLOOD PRESSURE READINGS TABLE
CREATE TABLE IF NOT EXISTS public.blood_pressure_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    systolic INTEGER NOT NULL CHECK (systolic > 30 AND systolic < 300),
    diastolic INTEGER NOT NULL CHECK (diastolic > 20 AND diastolic < 200),
    pulse INTEGER CHECK (pulse > 20 AND pulse < 300),
    measured_at TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bp_readings_user_measured 
    ON public.blood_pressure_readings (user_id, measured_at DESC);

ALTER TABLE public.blood_pressure_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blood pressure readings"
    ON public.blood_pressure_readings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blood pressure readings"
    ON public.blood_pressure_readings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blood pressure readings"
    ON public.blood_pressure_readings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blood pressure readings"
    ON public.blood_pressure_readings FOR DELETE
    USING (auth.uid() = user_id);

-- 3. MEDICINES TABLE
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dose TEXT NOT NULL,
    instructions TEXT,
    frequency TEXT NOT NULL DEFAULT 'daily',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_medicines_user_active 
    ON public.medicines (user_id, active);

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medicines"
    ON public.medicines FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medicines"
    ON public.medicines FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medicines"
    ON public.medicines FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medicines"
    ON public.medicines FOR DELETE
    USING (auth.uid() = user_id);

-- 4. MEDICINE SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.medicine_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheduled_time TEXT NOT NULL, -- "09:00" format
    time_of_day TEXT NOT NULL DEFAULT 'morning',
    days_of_week JSONB NOT NULL DEFAULT '[0,1,2,3,4,5,6]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_medicine_schedules_medicine 
    ON public.medicine_schedules (medicine_id);

ALTER TABLE public.medicine_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medicine schedules"
    ON public.medicine_schedules FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medicine schedules"
    ON public.medicine_schedules FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medicine schedules"
    ON public.medicine_schedules FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medicine schedules"
    ON public.medicine_schedules FOR DELETE
    USING (auth.uid() = user_id);

-- 5. MEDICINE DOSE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.medicine_dose_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.medicine_schedules(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'taken', 'skipped')),
    taken_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT unique_medicine_scheduled_instance UNIQUE (medicine_id, scheduled_for)
);

CREATE INDEX IF NOT EXISTS idx_dose_logs_user_scheduled 
    ON public.medicine_dose_logs (user_id, scheduled_for DESC);

ALTER TABLE public.medicine_dose_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dose logs"
    ON public.medicine_dose_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dose logs"
    ON public.medicine_dose_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dose logs"
    ON public.medicine_dose_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dose logs"
    ON public.medicine_dose_logs FOR DELETE
    USING (auth.uid() = user_id);

-- 6. AUTOMATIC PROFILE TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, email)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
