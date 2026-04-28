
-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Demographics
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  phone TEXT NOT NULL,
  email TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  blood_group TEXT,
  marital_status TEXT,
  preferred_language TEXT DEFAULT 'English',
  
  -- Medical identifiers
  mrn TEXT NOT NULL,
  aadhar_number TEXT,
  abha_id TEXT,
  
  -- Insurance
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_group_number TEXT,
  insurance_validity DATE,
  tpa_name TEXT,
  
  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  
  -- Clinical
  allergies TEXT[] DEFAULT '{}',
  chronic_conditions TEXT[] DEFAULT '{}',
  specialty TEXT DEFAULT 'General Medicine',
  status TEXT DEFAULT 'Active',
  total_visits INTEGER DEFAULT 0,
  last_visit_at TIMESTAMPTZ,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique constraint on MRN per user
ALTER TABLE public.patients ADD CONSTRAINT patients_mrn_user_unique UNIQUE (user_id, mrn);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Users can only see their own patients
CREATE POLICY "Users can view own patients" ON public.patients
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patients" ON public.patients
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patients" ON public.patients
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own patients" ON public.patients
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
