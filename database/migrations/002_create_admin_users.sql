-- Create admin users table for WOMIM choir management
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for admin users
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);

-- Create admin sessions table for tracking login sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for admin sessions
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_admin_user_id ON admin_sessions(admin_user_id);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Create function to update updated_at timestamp for admin_users
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Insert default admin user (password: womim2025)
-- In production, use proper password hashing
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@womim.org', 'womim2025', 'WOMIM Administrator', 'super_admin');

-- Add role field to members table for better management
ALTER TABLE members ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Chorister' CHECK (role IN ('Chorister', 'Instrumentalist', 'Usher', 'Conductor', 'Other'));

-- Create index for member roles
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);

-- Add registration_number field to members for unique identification
ALTER TABLE members ADD COLUMN IF NOT EXISTS registration_number VARCHAR(20) UNIQUE;

-- Create a sequence for registration numbers
CREATE SEQUENCE IF NOT EXISTS members_reg_seq START 1;

-- Create function to generate registration numbers
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.registration_number IS NULL THEN
    NEW.registration_number := 'WOM' || LPAD(nextval('members_reg_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically generate registration numbers
CREATE TRIGGER generate_member_registration_number 
  BEFORE INSERT ON members 
  FOR EACH ROW 
  EXECUTE FUNCTION generate_registration_number();

-- Update existing members with registration numbers if they don't have them
UPDATE members 
SET registration_number = 'WOM' || LPAD(nextval('members_reg_seq'), 4, '0')
WHERE registration_number IS NULL;
