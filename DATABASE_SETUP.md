# 🗄️ WOMIM Database Setup Guide

## Current Status
- ✅ **Supabase Connection**: Working
- ✅ **Environment Variables**: Configured  
- ❌ **Database Tables**: Need to be created

## 🚨 **IMPORTANT: RLS Policies Required**
If you get "row-level security policy" errors when testing the API, you need to run the RLS policies section at the bottom of this guide.

## 🚀 Quick Setup (Recommended)

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your WOMIM project
4. Navigate to **SQL Editor** (in the left sidebar)

### Step 2: Run Migration Files
Copy and paste these SQL scripts **in order** into the SQL Editor and run them:

#### 📄 **Migration 1: Core Tables**
```sql
-- Create members table for WOMIM choir registration
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Personal Information (Part A)
  surname VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  contact_address TEXT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  mobile_number VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  marital_status VARCHAR(20) NOT NULL CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
  whatsapp_number VARCHAR(20) NOT NULL,
  social_media_id VARCHAR(255) NOT NULL,
  
  -- Spiritual Information (Part B)
  is_born_again BOOLEAN NOT NULL,
  holy_ghost_baptism BOOLEAN NOT NULL,
  local_church_name VARCHAR(255) NOT NULL,
  local_church_address TEXT NOT NULL,
  academic_qualification VARCHAR(255) NOT NULL,
  job_status VARCHAR(20) NOT NULL CHECK (job_status IN ('Employed', 'Unemployed', 'Self-employed')),
  profession VARCHAR(255) NOT NULL,
  photo_url VARCHAR(500),
  
  -- System fields
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  role VARCHAR(50) DEFAULT 'Chorister' CHECK (role IN ('Chorister', 'Instrumentalist', 'Usher', 'Conductor', 'Other')),
  registration_number VARCHAR(20) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_role ON members(role);
CREATE INDEX idx_members_created_at ON members(created_at);

-- Create events table for choir events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('rehearsal', 'performance', 'meeting', 'other')),
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  max_attendees INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rehearsals table specifically for choir practices
CREATE TABLE IF NOT EXISTS rehearsals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  rehearsal_number INTEGER NOT NULL,
  rehearsal_type VARCHAR(50) DEFAULT 'regular' CHECK (rehearsal_type IN ('regular', 'special', 'dress_rehearsal')),
  focus_area TEXT,
  songs_to_practice TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique attendance per member per event
  UNIQUE(event_id, member_id)
);

-- Create indexes
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_rehearsals_event_id ON rehearsals(event_id);
CREATE INDEX idx_attendance_records_event_id ON attendance_records(event_id);
CREATE INDEX idx_attendance_records_member_id ON attendance_records(member_id);
CREATE INDEX idx_attendance_records_status ON attendance_records(status);
```

#### 📄 **Migration 2: Admin Tables**
```sql
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

-- Create admin sessions table for session management
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for admin tables
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Insert default admin user (password: womim2025)
INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active) VALUES
('admin', 'admin@womim.org', 'womim2025', 'WOMIM Administrator', 'super_admin', true);
```

#### 📄 **Migration 3: Sample Data & Functions**
```sql
-- Create functions for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_members_updated_at 
  BEFORE UPDATE ON members 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate registration numbers
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.registration_number IS NULL THEN
    NEW.registration_number := 'WOM' || LPAD(nextval('members_reg_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for registration numbers
CREATE SEQUENCE IF NOT EXISTS members_reg_seq START 1;

-- Create trigger for registration numbers
CREATE TRIGGER generate_member_registration_number
  BEFORE INSERT ON members
  FOR EACH ROW
  EXECUTE FUNCTION generate_registration_number();

-- Insert sample events and rehearsals
INSERT INTO events (title, event_type, description, date, start_time, end_time, location, status, max_attendees) VALUES
('Weekly Rehearsal', 'rehearsal', 'Regular choir practice session', '2025-01-27', '18:00:00', '20:00:00', 'Main Auditorium', 'upcoming', 100),
('Weekly Rehearsal', 'rehearsal', 'Regular choir practice session', '2025-02-03', '18:00:00', '20:00:00', 'Main Auditorium', 'upcoming', 100),
('Weekly Rehearsal', 'rehearsal', 'Regular choir practice session', '2025-02-10', '18:00:00', '20:00:00', 'Main Auditorium', 'upcoming', 100),
('Weekly Rehearsal', 'rehearsal', 'Regular choir practice session', '2025-02-17', '18:00:00', '20:00:00', 'Main Auditorium', 'upcoming', 100),
('Weekly Rehearsal', 'rehearsal', 'Regular choir practice session', '2025-02-24', '18:00:00', '20:00:00', 'Main Auditorium', 'upcoming', 100),
('Sunday Service Performance', 'performance', 'Sunday morning worship service performance', '2025-02-23', '09:00:00', '12:00:00', 'Main Auditorium', 'upcoming', 150);

-- Insert rehearsals with details
INSERT INTO rehearsals (event_id, rehearsal_number, rehearsal_type, focus_area, songs_to_practice) VALUES
((SELECT id FROM events WHERE title = 'Weekly Rehearsal' AND date = '2025-01-27'), 1, 'regular', 'Warm-up and basic songs', ARRAY['Amazing Grace', 'How Great Thou Art']),
((SELECT id FROM events WHERE title = 'Weekly Rehearsal' AND date = '2025-02-03'), 2, 'regular', 'New song introduction', ARRAY['Great Is Thy Faithfulness', 'It Is Well']),
((SELECT id FROM events WHERE title = 'Weekly Rehearsal' AND date = '2025-02-10'), 3, 'regular', 'Harmony practice', ARRAY['Be Thou My Vision', 'Come Thou Fount']),
((SELECT id FROM events WHERE title = 'Weekly Rehearsal' AND date = '2025-02-17'), 4, 'regular', 'Performance preparation', ARRAY['Holy, Holy, Holy', 'All Hail the Power']),
((SELECT id FROM events WHERE title = 'Weekly Rehearsal' AND date = '2025-02-24'), 5, 'regular', 'Final rehearsal before performance', ARRAY['All songs for Sunday service']);

-- Create view for easy access to rehearsal information
CREATE OR REPLACE VIEW rehearsal_details AS
SELECT 
  e.id as event_id,
  e.title,
  e.date,
  e.start_time,
  e.end_time,
  e.location,
  e.status,
  r.rehearsal_number,
  r.rehearsal_type,
  r.focus_area,
  r.songs_to_practice,
  r.notes,
  CONCAT('Rehearsal #', r.rehearsal_number, ' ', TO_CHAR(e.date, 'Mon DD, YYYY')) as display_name
FROM events e
JOIN rehearsals r ON e.id = r.event_id
WHERE e.event_type = 'rehearsal'
ORDER BY e.date DESC, r.rehearsal_number DESC;

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rehearsals ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for the app)
CREATE POLICY "Allow public read access to members" ON members
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to rehearsals" ON rehearsals
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to attendance_records" ON attendance_records
  FOR SELECT USING (true);

-- Create policies for admin full access
CREATE POLICY "Allow admin full access to members" ON members
  FOR ALL USING (true);

CREATE POLICY "Allow admin full access to events" ON events
  FOR ALL USING (true);

CREATE POLICY "Allow admin full access to rehearsals" ON rehearsals
  FOR ALL USING (true);

CREATE POLICY "Allow admin full access to attendance_records" ON attendance_records
  FOR ALL USING (true);

CREATE POLICY "Allow admin full access to admin_users" ON admin_users
  FOR ALL USING (true);

CREATE POLICY "Allow admin full access to admin_sessions" ON admin_sessions
  FOR ALL USING (true);

-- Create policies for public insert (registration)
CREATE POLICY "Allow public insert to members" ON members
  FOR INSERT WITH CHECK (true);

-- Create policies for public insert (attendance)
CREATE POLICY "Allow public insert to attendance_records" ON attendance_records
  FOR INSERT WITH CHECK (true);

-- Create policies for public insert (events/rehearsals)
CREATE POLICY "Allow public insert to events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert to rehearsals" ON rehearsals
  FOR INSERT WITH CHECK (true);
```

### Step 3: Test Database Connection
After running the migrations, test your database:

```bash
curl http://localhost:3000/api/db-status
```

## 🎉 Expected Result
After setup, you should see:
- ✅ All tables created successfully
- ✅ Sample data inserted
- ✅ Admin user created (username: `admin`, password: `womim2025`)
- ✅ Rehearsals available for attendance tracking

## 🆘 Need Help?
If you encounter issues:
1. Check Supabase project URL and keys in `.env.local`
2. Ensure you're using the correct Supabase project
3. Check the SQL Editor for any error messages
4. Run the database test endpoint: `/api/db-status`
