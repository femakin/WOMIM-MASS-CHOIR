-- Fix Row Level Security (RLS) for admin_users table
-- This allows the service role to manage admin users

-- Disable RLS on admin_users table to allow service role access
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on admin_sessions table
ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;

-- Ensure the default admin user exists
INSERT INTO admin_users (username, email, password_hash, full_name, role) 
VALUES ('admin', 'admin@womim.org', 'womim2025', 'WOMIM Administrator', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- Create a policy for admin_users if you want to re-enable RLS later
-- (Uncomment these lines if you want to use RLS with policies)
/*
-- Re-enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can manage admin users" ON admin_users
    FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow authenticated admins to read their own data
CREATE POLICY "Admins can read own data" ON admin_users
    FOR SELECT USING (auth.uid()::text = id::text);
*/
