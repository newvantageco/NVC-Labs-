-- Add PMS system tracking to practices table
-- This helps us understand which PMS systems our customers use
-- so we can prioritize which integrations to build

ALTER TABLE practices
ADD COLUMN pms_system TEXT;

-- Add index for analytics queries
CREATE INDEX idx_practices_pms_system ON practices(pms_system) WHERE pms_system IS NOT NULL;

-- Add comment
COMMENT ON COLUMN practices.pms_system IS 'Practice Management Software system used by the practice (e.g., Optix, Acuitas, OptiSoft, 4Sight, etc.)';
