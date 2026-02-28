-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create practices table
CREATE TABLE practices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    nhs_registration_number TEXT,
    calling_hours_start TEXT DEFAULT '09:00' NOT NULL,
    calling_hours_end TEXT DEFAULT '18:00' NOT NULL,
    ai_script_template TEXT,
    booking_url TEXT,
    stripe_customer_id TEXT,
    subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'growth', 'scale')),
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
    monthly_call_limit INTEGER DEFAULT 500 NOT NULL,
    calls_used_this_month INTEGER DEFAULT 0 NOT NULL,
    UNIQUE(user_id)
);

-- Create patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    last_eye_test_date DATE,
    opted_out BOOLEAN DEFAULT false NOT NULL,
    opted_out_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(practice_id, phone_number)
);

-- Create call_logs table
CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    call_status TEXT DEFAULT 'scheduled' CHECK (call_status IN ('scheduled', 'calling', 'answered', 'no_answer', 'voicemail', 'busy', 'failed', 'opted_out', 'booked')),
    call_duration_seconds INTEGER,
    call_sid TEXT,
    call_recording_url TEXT,
    appointment_booked BOOLEAN DEFAULT false NOT NULL,
    appointment_booked_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0 NOT NULL,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_practices_user_id ON practices(user_id);
CREATE INDEX idx_patients_practice_id ON patients(practice_id);
CREATE INDEX idx_patients_opted_out ON patients(practice_id, opted_out);
CREATE INDEX idx_call_logs_practice_id ON call_logs(practice_id);
CREATE INDEX idx_call_logs_patient_id ON call_logs(patient_id);
CREATE INDEX idx_call_logs_status ON call_logs(practice_id, call_status);
CREATE INDEX idx_call_logs_next_retry ON call_logs(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for practices
CREATE POLICY "Users can view their own practice"
    ON practices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practice"
    ON practices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice"
    ON practices FOR UPDATE
    USING (auth.uid() = user_id);

-- Create RLS policies for patients
CREATE POLICY "Practices can view their own patients"
    ON patients FOR SELECT
    USING (
        practice_id IN (
            SELECT id FROM practices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Practices can insert their own patients"
    ON patients FOR INSERT
    WITH CHECK (
        practice_id IN (
            SELECT id FROM practices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Practices can update their own patients"
    ON patients FOR UPDATE
    USING (
        practice_id IN (
            SELECT id FROM practices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Practices can delete their own patients"
    ON patients FOR DELETE
    USING (
        practice_id IN (
            SELECT id FROM practices WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for call_logs
CREATE POLICY "Practices can view their own call logs"
    ON call_logs FOR SELECT
    USING (
        practice_id IN (
            SELECT id FROM practices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Practices can insert their own call logs"
    ON call_logs FOR INSERT
    WITH CHECK (
        practice_id IN (
            SELECT id FROM practices WHERE user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_practices_updated_at BEFORE UPDATE ON practices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
