-- Migration: Add settlement_remarks column to credit_sales table
-- Date: 2026-07-21
-- Purpose: Support storing settlement remarks when credit sales are settled

-- Add the settlement_remarks column (nullable, for backward compatibility)
ALTER TABLE credit_sales
ADD COLUMN settlement_remarks TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN credit_sales.settlement_remarks IS 'Optional remarks/notes entered when settling a credit sale (e.g. payment method, reference number, etc.)';
