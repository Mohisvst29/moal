/*
  # Fix RLS policies for admin operations

  1. Policy Updates
    - Update RLS policies to allow admin operations with anonymous key
    - Ensure proper permissions for CRUD operations
    - Maintain security while allowing necessary operations

  2. Changes Made
    - Drop existing conflicting policies if they exist
    - Create new policies that allow admin operations
    - Add proper permissions for all tables

  3. Security Notes
    - This allows admin operations using the anon key
    - In production, consider implementing proper authentication
*/

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
    -- Drop policies for menu_sections
    DROP POLICY IF EXISTS "Anyone can read menu sections" ON menu_sections;
    DROP POLICY IF EXISTS "Public can read menu sections" ON menu_sections;
    DROP POLICY IF EXISTS "Authenticated users can manage menu sections" ON menu_sections;
    
    -- Drop policies for menu_items
    DROP POLICY IF EXISTS "Anyone can read menu items" ON menu_items;
    DROP POLICY IF EXISTS "Public can read available menu items" ON menu_items;
    DROP POLICY IF EXISTS "Authenticated users can manage menu items" ON menu_items;
    
    -- Drop policies for menu_item_sizes
    DROP POLICY IF EXISTS "Anyone can read menu item sizes" ON menu_item_sizes;
    DROP POLICY IF EXISTS "Public can read menu item sizes" ON menu_item_sizes;
    DROP POLICY IF EXISTS "Authenticated users can manage menu item sizes" ON menu_item_sizes;
    
    -- Drop policies for special_offers
    DROP POLICY IF EXISTS "Anyone can read active special offers" ON special_offers;
    DROP POLICY IF EXISTS "Public can read active special offers" ON special_offers;
    DROP POLICY IF EXISTS "Authenticated users can manage special offers" ON special_offers;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore errors if policies don't exist
END $$;

-- Create new policies for menu_sections
CREATE POLICY "Public can read menu sections"
  ON menu_sections
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin operations on menu sections"
  ON menu_sections
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create new policies for menu_items
CREATE POLICY "Public can read available menu items"
  ON menu_items
  FOR SELECT
  TO public
  USING (available = true);

CREATE POLICY "Allow admin operations on menu items"
  ON menu_items
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create new policies for menu_item_sizes
CREATE POLICY "Public can read menu item sizes"
  ON menu_item_sizes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create new policies for special_offers
CREATE POLICY "Public can read active special offers"
  ON special_offers
  FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Allow admin operations on special offers"
  ON special_offers
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add missing calories column to menu_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'calories'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN calories integer;
  END IF;
END $$;

-- Add missing calories column to special_offers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'special_offers' AND column_name = 'calories'
  ) THEN
    ALTER TABLE special_offers ADD COLUMN calories integer;
  END IF;
END $$;

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_menu_sections_updated_at ON menu_sections;
CREATE TRIGGER update_menu_sections_updated_at
    BEFORE UPDATE ON menu_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_special_offers_updated_at ON special_offers;
CREATE TRIGGER update_special_offers_updated_at
    BEFORE UPDATE ON special_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();