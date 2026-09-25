-- Migration: Add updated_at column and auto-update trigger to tasks table

-- 1. Add updated_at column with default now()
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Create or replace trigger function to update updated_at on row modification
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach trigger to tasks table
DROP TRIGGER IF EXISTS handle_tasks_updated_at ON tasks;
CREATE TRIGGER handle_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Also ensure goals table has updated_at column and trigger
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP TRIGGER IF EXISTS handle_goals_updated_at ON goals;
CREATE TRIGGER handle_goals_updated_at
BEFORE UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
