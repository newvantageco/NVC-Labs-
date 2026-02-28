-- Add clinical compliance fields to patients table
ALTER TABLE patients ADD COLUMN risk_category TEXT DEFAULT 'standard' CHECK (risk_category IN ('standard', 'glaucoma_suspect', 'diabetic', 'myopia_child', 'other_clinical'));
ALTER TABLE patients ADD COLUMN last_clinical_test_date DATE;
ALTER TABLE patients ADD COLUMN next_clinical_due_date DATE;
ALTER TABLE patients ADD COLUMN clinical_condition_notes TEXT;

-- Create compliance_audit_log table
CREATE TABLE compliance_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    recall_reason TEXT NOT NULL,
    attempt_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    outcome TEXT CHECK (outcome IN ('answered', 'no_answer', 'voicemail', 'busy', 'opted_out', 'booked')) NOT NULL,
    call_recording_url TEXT,
    call_duration_seconds INTEGER,
    next_action_required TEXT,
    notes TEXT
);

-- Create indexes for performance
CREATE INDEX idx_patients_risk_category ON patients(practice_id, risk_category);
CREATE INDEX idx_patients_next_due ON patients(practice_id, next_clinical_due_date) WHERE next_clinical_due_date IS NOT NULL;
CREATE INDEX idx_compliance_audit_practice ON compliance_audit_log(practice_id);
CREATE INDEX idx_compliance_audit_patient ON compliance_audit_log(patient_id);
CREATE INDEX idx_compliance_audit_date ON compliance_audit_log(practice_id, attempt_date);

-- Enable Row Level Security
ALTER TABLE compliance_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for compliance_audit_log
CREATE POLICY "Practices can view their own compliance logs"
    ON compliance_audit_log FOR SELECT
    USING (
        practice_id IN (
            SELECT id FROM practices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Practices can insert their own compliance logs"
    ON compliance_audit_log FOR INSERT
    WITH CHECK (
        practice_id IN (
            SELECT id FROM practices WHERE user_id = auth.uid()
        )
    );

-- Add clinical appointment tracking fields to practices table
ALTER TABLE practices ADD COLUMN avg_clinical_appointment_value DECIMAL(10,2) DEFAULT 75.00;
ALTER TABLE practices ADD COLUMN track_clinical_revenue BOOLEAN DEFAULT true;

-- Create function to auto-calculate next_clinical_due_date
CREATE OR REPLACE FUNCTION calculate_next_clinical_due_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_clinical_test_date IS NOT NULL THEN
        CASE NEW.risk_category
            WHEN 'glaucoma_suspect' THEN
                NEW.next_clinical_due_date := NEW.last_clinical_test_date + INTERVAL '12 months';
            WHEN 'diabetic' THEN
                NEW.next_clinical_due_date := NEW.last_clinical_test_date + INTERVAL '12 months';
            WHEN 'myopia_child' THEN
                NEW.next_clinical_due_date := NEW.last_clinical_test_date + INTERVAL '6 months';
            WHEN 'other_clinical' THEN
                NEW.next_clinical_due_date := NEW.last_clinical_test_date + INTERVAL '12 months';
            ELSE
                NEW.next_clinical_due_date := NEW.last_clinical_test_date + INTERVAL '24 months';
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update next_clinical_due_date
CREATE TRIGGER auto_calculate_clinical_due_date
    BEFORE INSERT OR UPDATE OF last_clinical_test_date, risk_category ON patients
    FOR EACH ROW
    EXECUTE FUNCTION calculate_next_clinical_due_date();

-- Create view for overdue high-risk patients
CREATE OR REPLACE VIEW high_risk_patients_overdue AS
SELECT
    p.*,
    pr.practice_name,
    CASE
        WHEN p.next_clinical_due_date < CURRENT_DATE THEN CURRENT_DATE - p.next_clinical_due_date
        ELSE 0
    END as days_overdue
FROM patients p
JOIN practices pr ON p.practice_id = pr.id
WHERE p.risk_category != 'standard'
  AND p.next_clinical_due_date < CURRENT_DATE
  AND p.opted_out = false
ORDER BY days_overdue DESC;

COMMENT ON TABLE compliance_audit_log IS 'Tracks all recall attempts for GOC/FODO compliance and legal protection';
COMMENT ON COLUMN patients.risk_category IS 'Clinical risk category for prioritized recall: glaucoma_suspect, diabetic, myopia_child, other_clinical';
COMMENT ON COLUMN patients.next_clinical_due_date IS 'Auto-calculated based on risk_category and last_clinical_test_date';
