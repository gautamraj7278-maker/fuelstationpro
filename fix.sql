-- Run ALL of this in Supabase Studio SQL Editor
-- Fix stock_movements schema drift: drop old column names, add current ones
ALTER TABLE stock_movements DROP COLUMN IF EXISTS type;
ALTER TABLE stock_movements DROP COLUMN IF EXISTS quantity;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS movement_date date;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS movement_type text default 'IN';
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS tank_name text;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS product_name text;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS volume numeric(12,2) default 0;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS reason text;
